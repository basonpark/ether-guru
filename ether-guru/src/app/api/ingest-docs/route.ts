import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}
const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Process chunks in batches to avoid hitting OpenAI API limits
  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchNumber = Math.floor(i / EMBEDDING_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / EMBEDDING_BATCH_SIZE);

    console.log(`Processing embedding batch ${batchNumber} of ${totalBatches}...`);

    // Clean up newlines for embedding
    const inputs = batchChunks.map(chunk => chunk.content.replace(/\n/g, ' '));

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: embeddingModel,
        input: inputs,
        dimensions: embeddingDimension,
      });

      const batchEmbeddings = embeddingResponse.data;

      for (let j = 0; j < batchChunks.length; j++) {
        const chunk = batchChunks[j];
        const embedding = batchEmbeddings[j];
        embeddingsData.push({
          raw_chunk_id: chunk.id,
          content: chunk.content, // Store content again in documents table
          embedding: embedding.embedding,
        });
      }
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
async function storeEmbeddings(embeddingsWithContent: { raw_chunk_id: number; content: string; embedding: number[] }[]) {
  console.log(`Attempting to store ${embeddingsWithContent.length} embeddings...`);

  // Upsert embeddings in batches to Supabase
  for (let i = 0; i < embeddingsWithContent.length; i += UPSERT_BATCH_SIZE) {
    const batch = embeddingsWithContent.slice(i, i + UPSERT_BATCH_SIZE);
    const batchNumber = Math.floor(i / UPSERT_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(embeddingsWithContent.length / UPSERT_BATCH_SIZE);
    console.log(`Processing Supabase upsert batch ${batchNumber} of ${totalBatches}...`);

    const batchData = batch.map(item => ({
      raw_chunk_id: item.raw_chunk_id,
      content: item.content,
      embedding: item.embedding,
    }));

    try {
      const { error: upsertError } = await supabase
        .from('documents')
        .upsert(batchData, { onConflict: 'raw_chunk_id' }); // Assuming raw_chunk_id is unique

      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
        // Throw error to stop the process if a batch fails
        throw new Error(`Supabase upsert failed: ${upsertError.message}`);
      }
      console.log(` - Upserted batch ${batchNumber} (${batch.length} records)`);
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
    const rawChunks = await fetchRawChunks();

    if (!rawChunks || rawChunks.length === 0) {
      return NextResponse.json({ message: 'No raw chunks found to process.' }, { status: 200 });
    }

    const embeddingsWithContent = await generateEmbeddings(rawChunks);

    await storeEmbeddings(embeddingsWithContent);

    console.log('Embedding generation and storage process completed.');
    return NextResponse.json({ 
        message: 'Embeddings generated and stored successfully.',
        chunksProcessed: rawChunks.length,
        embeddingsStored: embeddingsWithContent.length // May be less than chunksProcessed if embedding generation failed for some
    }, { status: 200 });

  } catch (error: unknown) {
    console.error(`Embedding process failed:`, error);
    let errorMessage = 'Unknown internal server error.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({
      message: "Embedding process failed due to an internal server error.",
      error: errorMessage
    }, { status: 500 });
  }
}
