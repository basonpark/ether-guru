import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Basic validation
if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceRoleKey) {
  throw new Error('Missing environment variable SUPABASE_SERVICE_ROLE_KEY');
}
if (!openaiApiKey) {
  throw new Error('Missing environment variable OPENAI_API_KEY');
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Typically false for server-side operations
  },
});
const openai = new OpenAI({ apiKey: openaiApiKey });

// Configuration for the embedding model
const embeddingModel = 'text-embedding-3-small'; // Must match ingestion model
const embeddingDimension = 1536; // Dimension for text-embedding-3-small
const matchThreshold = 0.78; // Similarity threshold (adjust as needed)
const matchCount = 5; // Number of matches to retrieve

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query provided' }, { status: 400 });
    }

    console.log(`Received query: ${query}`);

    // 1. Generate embedding for the user's query
    console.log('Generating query embedding...');
    const embeddingResponse = await openai.embeddings.create({
      model: embeddingModel,
      input: query,
      dimensions: embeddingDimension,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('Query embedding generated.');

    // 2. Query Supabase for similar documents using the pgvector function
    console.log('Querying Supabase for similar documents...');
    const { data: documents, error: matchError } = await supabase.rpc(
      'match_documents', // The Supabase function we created
      {
        query_embedding: queryEmbedding, // The embedding vector
        match_threshold: matchThreshold, // Minimum similarity threshold
        match_count: matchCount, // Maximum number of matches
      }
    );

    if (matchError) {
      console.error('Error matching documents:', matchError);
      return NextResponse.json(
        { error: 'Failed to match documents', details: matchError.message },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      console.log('No matching documents found.');
      return NextResponse.json(
        { message: 'No relevant documents found.', results: [] },
        { status: 200 }
      );
    }

    console.log(`Found ${documents.length} matching documents.`);

    // 3. Return the content of the matched documents (for now)
    // Later, we'll feed this into a language model
    const results = documents.map((doc: any) => ({ // Use 'any' for now, refine later if needed
        content: doc.content,
        similarity: doc.similarity
    }));

    return NextResponse.json({ message: 'Query successful', results }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
