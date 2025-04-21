import os
import time
import logging
import asyncio
from typing import List, Dict
import json
import re

# Use Crawl4AI for crawling and extraction
from crawl4ai import AsyncWebCrawler
from langchain.text_splitter import RecursiveCharacterTextSplitter
from supabase import create_client, Client
from dotenv import load_dotenv
from html2text import HTML2Text  # For converting HTML to Markdown if needed

# --- Configuration ---
load_dotenv()  # Load environment variables from .env file

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# URL Settings
START_URL = "https://docs.soliditylang.org/en/v0.8.29/"
# Crawl4AI uses include/exclude patterns
INCLUDE_PATTERNS = [f"{START_URL}.*"]  # Crawl only URLs starting with the specific version path
EXCLUDE_PATTERNS = [
    ".*/genindex.html",
    ".*/search.html"  # Exclude search and index pages
]

# Text Chunking Settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

# Supabase Settings
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use Service Role Key
DB_INSERT_BATCH_SIZE = 50

# --- Supabase Client Initialization ---
try:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL or Key not found in environment variables.")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logging.info("Supabase client initialized.")
except Exception as e:
    logging.error(f"Failed to initialize Supabase client: {e}")
    exit(1)

# --- Helper Functions ---

# Regex to match Markdown code blocks (e.g., ```solidity ... ```)
CODE_BLOCK_PATTERN = r"```[\s\S]*?```"

def extract_code_blocks(content: str) -> List[tuple[str, bool]]:
    """
    Extract code blocks and non-code segments from the content.
    Returns a list of tuples: (segment, is_code_block).
    """
    segments = []
    last_pos = 0
    
    # Find all code blocks
    for match in re.finditer(CODE_BLOCK_PATTERN, content):
        start, end = match.span()
        
        # Add non-code segment before the code block (if any)
        if last_pos < start:
            non_code = content[last_pos:start].strip()
            if non_code:
                segments.append((non_code, False))
        
        # Add the code block
        code_block = content[start:end].strip()
        segments.append((code_block, True))
        
        last_pos = end
    
    # Add any remaining non-code content
    if last_pos < len(content):
        non_code = content[last_pos:].strip()
        if non_code:
            segments.append((non_code, False))
    
    return segments

def chunk_page_content(content: str, source_url: str) -> List[Dict[str, str]]:
    """
    Splits text content from a page into chunks, preserving code blocks.
    """
    if not content or not content.strip():
        logging.warning(f"No content provided or content is empty for {source_url}, skipping chunking.")
        return []

    # Step 1: Split content into code and non-code segments
    segments = extract_code_blocks(content)
    
    # Step 2: Initialize LangChain splitter for non-code content
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        add_start_index=False,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = []
    current_chunk = ""
    current_chunk_size = 0
    
    for segment, is_code_block in segments:
        if is_code_block:
            # Code blocks are kept intact
            segment_size = len(segment)
            # If adding the code block exceeds the chunk size, start a new chunk
            if current_chunk and (current_chunk_size + segment_size > CHUNK_SIZE):
                chunks.append(current_chunk.strip())
                current_chunk = segment
                current_chunk_size = segment_size
            else:
                current_chunk += "\n\n" + segment if current_chunk else segment
                current_chunk_size += segment_size
        else:
            # Split non-code content using LangChain
            sub_chunks = splitter.split_text(segment)
            for sub_chunk in sub_chunks:
                sub_chunk_size = len(sub_chunk)
                # If adding the sub-chunk exceeds the chunk size, start a new chunk
                if current_chunk and (current_chunk_size + sub_chunk_size > CHUNK_SIZE):
                    chunks.append(current_chunk.strip())
                    current_chunk = sub_chunk
                    current_chunk_size = sub_chunk_size
                else:
                    current_chunk += "\n\n" + sub_chunk if current_chunk else sub_chunk
                    current_chunk_size += sub_chunk_size
    
    # Add the final chunk if it exists
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    # Convert chunks to the required format with metadata
    formatted_chunks = [
        {
            "content": chunk,
            "source_url": source_url,
            "metadata": json.dumps({
                "original_url": source_url,
                "has_code": bool(re.search(CODE_BLOCK_PATTERN, chunk))
            })
        }
        for chunk in chunks if chunk.strip()
    ]
    logging.debug(f"Split text from {source_url} into {len(formatted_chunks)} chunks.")
    return formatted_chunks

def store_chunks_batch(chunks_to_store: List[Dict[str, str]]) -> int:
    """
    Stores a batch of chunks into the Supabase 'raw_chunks' table.
    """
    if not chunks_to_store:
        return 0
    try:
        response = supabase.table('raw_chunks').insert(chunks_to_store).execute()
        # Check for successful insertion
        if hasattr(response, 'data') and response.data:
            inserted_count = len(response.data)
            logging.info(f"Successfully inserted batch of {inserted_count} chunks.")
            return inserted_count
        else:
            logging.warning(f"Supabase insert executed but returned unexpected data structure or no data. Response: {response}")
            return 0
    except Exception as e:
        logging.error(f"Failed to insert batch into Supabase: {e}")
        return 0

# --- Main Logic using Crawl4AI ---

async def crawl_chunk_and_store():
    """
    Uses Crawl4AI to crawl, then chunks and stores the results.
    """
    logging.info(f"Initializing Crawl4AI for URL: {START_URL}")
    logging.info(f"Include patterns: {INCLUDE_PATTERNS}")
    logging.info(f"Exclude patterns: {EXCLUDE_PATTERNS}")

    # Initialize Crawl4AI
    crawler = AsyncWebCrawler(
        concurrency=3,  # Reduced from 4 to be safer with rate limits
        max_depth=2,   # Increased to crawl two levels deep
        include_patterns=INCLUDE_PATTERNS,
        exclude_patterns=EXCLUDE_PATTERNS,
        delay=0.5,
    )

    # HTML to Markdown converter for fallback
    h2t = HTML2Text()
    h2t.ignore_links = False  # Keep links in the Markdown output

    all_chunks_buffer: List[Dict[str, str]] = []
    total_chunks_inserted = 0
    pages_processed = 0
    crawled_urls = set()  # Track crawled URLs to avoid duplicates

    try:
        logging.info("Starting crawl...")
        # Crawl the starting URL
        result = await crawler.arun(
            url=START_URL,
            bypass_cache=True,
            css_selector="div.document section",  # Target the main content
            output_format="markdown"
        )

        # Debug: Log the entire result to inspect its structure
        logging.info(f"Crawl4AI result: {result.__dict__}")

        # Check if the crawl was successful
        if not result.success:
            logging.error(f"Failed to crawl {START_URL}: {result.error_message}")
            return 0, 0

        # Extract content
        page_data_list = []

        # Handle the result for the starting URL
        if hasattr(result, 'markdown') and result.markdown:
            page_data_list.append({"url": result.url, "content": result.markdown})
            crawled_urls.add(result.url)
        elif hasattr(result, 'extracted_content') and result.extracted_content:
            page_data_list.append({"url": result.url, "content": result.extracted_content})
            crawled_urls.add(result.url)
        elif result.cleaned_html:
            # Fallback: Convert cleaned_html to Markdown
            markdown_content = h2t.handle(result.cleaned_html)
            page_data_list.append({"url": result.url, "content": markdown_content})
            crawled_urls.add(result.url)
        else:
            logging.warning(f"No content extracted for URL: {START_URL}")

        # Follow internal links to crawl more pages
        if result.links and 'internal' in result.links:
            internal_links = [
                link['href'] for link in result.links['internal']
                if link['href'].startswith(START_URL) and all(not re.match(pattern, link['href']) for pattern in EXCLUDE_PATTERNS)
            ]
            for link in internal_links:
                if link in crawled_urls:
                    continue
                crawled_urls.add(link)
                logging.info(f"Crawling additional page: {link}")
                sub_result = await crawler.arun(
                    url=link,
                    bypass_cache=True,
                    css_selector="div.document section",
                    output_format="markdown"
                )
                if not sub_result.success:
                    logging.warning(f"Failed to crawl {link}: {sub_result.error_message}")
                    continue
                if hasattr(sub_result, 'markdown') and sub_result.markdown:
                    page_data_list.append({"url": sub_result.url, "content": sub_result.markdown})
                elif hasattr(sub_result, 'extracted_content') and sub_result.extracted_content:
                    page_data_list.append({"url": sub_result.url, "content": sub_result.extracted_content})
                elif sub_result.cleaned_html:
                    markdown_content = h2t.handle(sub_result.cleaned_html)
                    page_data_list.append({"url": sub_result.url, "content": markdown_content})
                else:
                    logging.warning(f"No content extracted for URL: {link}")

        logging.info(f"Crawl finished. Received data for {len(page_data_list)} pages.")
        pages_processed = len(page_data_list)

        # Process results: Chunk and prepare for batch insertion
        for page_data in page_data_list:
            page_url = page_data.get('url', 'Unknown URL')
            page_content = page_data.get('content', '')

            if not page_content:
                logging.warning(f"No content extracted for URL: {page_url}")
                continue

            logging.info(f"Chunking content for: {page_url} (~{len(page_content)} chars)")
            page_chunks = chunk_page_content(page_content, page_url)
            all_chunks_buffer.extend(page_chunks)

            # Insert in batches as the buffer fills
            if len(all_chunks_buffer) >= DB_INSERT_BATCH_SIZE:
                logging.info(f"Buffer reached {len(all_chunks_buffer)} chunks. Inserting batch...")
                inserted = store_chunks_batch(all_chunks_buffer)
                total_chunks_inserted += inserted
                all_chunks_buffer = []  # Clear buffer

        # Insert any remaining chunks
        if all_chunks_buffer:
            logging.info(f"Inserting final batch of {len(all_chunks_buffer)} chunks...")
            inserted = store_chunks_batch(all_chunks_buffer)
            total_chunks_inserted += inserted

    except Exception as e:
        logging.error(f"An error occurred during crawling or processing: {e}", exc_info=True)
    finally:
        logging.info("-" * 30)
        logging.info("Processing complete.")
        logging.info(f"Pages processed by Crawl4AI: {pages_processed}")
        logging.info(f"Total raw chunks inserted: {total_chunks_inserted}")
        logging.info("-" * 30)

    return pages_processed, total_chunks_inserted

# --- Script Execution ---

if __name__ == "__main__":
    logging.info("Starting crawl and chunk process...")
    # Run the async function using asyncio
    pages_processed, total_chunks = asyncio.run(crawl_chunk_and_store())
    logging.info("Process finished.")