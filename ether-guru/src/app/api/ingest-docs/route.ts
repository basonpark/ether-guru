import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY!;
if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key environment variable');
}
const openai = new OpenAI({ apiKey: openaiApiKey });

// --- Configuration ---
const embeddingModel = 'text-embedding-3-small';
const embeddingDimension = 1536;
const EMBEDDING_BATCH_SIZE = 50; // How many chunks to embed in one OpenAI API call
const UPSERT_BATCH_SIZE = 100; // How many records to upsert into Supabase at once

// --- Helper Functions ---

/**
 * Fetches raw text chunks from the 'raw_chunks' table that haven't been processed yet.
 * For simplicity, this version fetches all chunks.
 * A more robust version might select based on a flag or timestamp.
 */
async function fetchRawChunks() {
  console.log('Fetching raw chunks from Supabase...');
  const { data, error } = await supabase
    .from('raw_chunks')
    .select('id, content') // Select only needed columns
    // Potential Optimization: Add '.eq('is_processed', false)' if using a flag
    .order('id'); // Process in a consistent order

  if (error) {
    console.error('Error fetching raw chunks:', error);
    throw new Error(`Supabase fetch error: ${error.message}`);
  }
  console.log(`Fetched ${data?.length || 0} raw chunks.`);
  return data || [];
}

/**
 * Generates embeddings for an array of text chunks.
 */
async function generateEmbeddings(chunks: { id: number; content: string }[]): Promise<{ raw_chunk_id: number; content: string; embedding: number[] }[]> {
  const embeddingsData: { raw_chunk_id: number; content: string; embedding: number[] }[] = [];
  console.log(`Generating embeddings for ${chunks.length} chunks...`);

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchTexts = batchChunks.map(chunk => chunk.content);

    try {
      if (batchTexts.length === 0) continue;

      console.log(` - Processing embedding batch ${Math.floor(i / EMBEDDING_BATCH_SIZE) + 1}...`);
      const response = await openai.embeddings.create({
        model: embeddingModel,
        input: batchTexts,
        dimensions: embeddingDimension,
      });

      response.data.forEach((embeddingResult, index) => {
        const originalChunk = batchChunks[index];
        embeddingsData.push({
          raw_chunk_id: originalChunk.id,
          content: originalChunk.content, // Store content again in documents table
          embedding: embeddingResult.embedding,
        });
      });
    } catch (error) {
      console.error(`Error generating embeddings for batch starting at index ${i}:`, error);
      // Continue to next batch if one fails
    }
  }
  console.log(`Generated ${embeddingsData.length} embeddings successfully.`);
  return embeddingsData;
}

/**
 * Upserts embeddings into the 'documents' table.
 */
async function storeEmbeddings(embeddingsToStore: { raw_chunk_id: number; content: string; embedding: number[] }[]) {
  if (embeddingsToStore.length === 0) {
    console.log('No new embeddings to store.');
    return;
  }
  console.log(`Upserting ${embeddingsToStore.length} embeddings into 'documents' table...`);

  for (let i = 0; i < embeddingsToStore.length; i += UPSERT_BATCH_SIZE) {
    const batch = embeddingsToStore.slice(i, i + UPSERT_BATCH_SIZE);
    try {
      const { error } = await supabase
        .from('documents')
        .upsert(batch, { onConflict: 'raw_chunk_id' }); // Upsert based on the raw_chunk_id

      if (error) {
        console.error(`Supabase upsert error (Batch ${Math.floor(i / UPSERT_BATCH_SIZE) + 1}):`, error);
        // Throw error to stop the process if a batch fails
        throw new Error(`Supabase upsert failed: ${error.message}`);
      }
       console.log(` - Upserted batch ${Math.floor(i / UPSERT_BATCH_SIZE) + 1} (${batch.length} records)`);
    } catch (error) {
      console.error('Error during Supabase upsert processing:', error);
      // Re-throw error
      throw error;
    }
  }
  console.log('Embeddings stored successfully.');
}

// --- Route Handler (POST) ---

export async function POST(req: NextRequest) {
  console.log('Received request to process raw chunks and generate embeddings...');

  try {
    // 1. Fetch raw chunks from Supabase (output of Python script)
    const rawChunks = await fetchRawChunks();

    if (!rawChunks || rawChunks.length === 0) {
      return NextResponse.json({ message: 'No raw chunks found to process.' }, { status: 200 });
    }

    // 2. Generate embeddings for the fetched chunks
    const embeddingsWithContent = await generateEmbeddings(rawChunks);

    // 3. Store embeddings in the 'documents' table (using upsert)
    await storeEmbeddings(embeddingsWithContent);

    console.log('Embedding generation and storage process completed.');
    return NextResponse.json({ 
        message: 'Embeddings generated and stored successfully.',
        chunksProcessed: rawChunks.length,
        embeddingsStored: embeddingsWithContent.length // May be less than chunksProcessed if embedding generation failed for some
    }, { status: 200 });

  } catch (error: any) {
    console.error(`Embedding process failed:`, error);
    return NextResponse.json({
      message: "Embedding process failed due to an internal server error.",
      error: typeof error?.message === 'string' ? error.message : 'Unknown internal server error.'
    }, { status: 500 });
  }
}

// Optionally, add a GET handler for testing or other purposes
export async function GET(req: NextRequest) {
    return NextResponse.json({ message: 'This endpoint expects a POST request with a URL to ingest.' });
}
