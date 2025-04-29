import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Load environment variables
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
    persistSession: false,
  },
});
const openai = new OpenAI({ apiKey: openaiApiKey });

// Configuration
const embeddingModel = 'text-embedding-3-small'; // Ensure this matches ingestion if re-run
const embeddingDimension = 1536; // Dimension for text-embedding-3-large
const matchThreshold = 0.55; // Keep the tuned threshold
const matchCount = 3; // Limit context slightly
const chatModel = 'gpt-4o-mini'; // Model for generating the answer

interface DocumentChunk {
  content: string;
  // Add other properties if known, e.g., embedding: number[], metadata: object
}

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

    // 2. Query Supabase for similar documents
    console.log('Querying Supabase for similar documents...');
    const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (matchError) {
      console.error('Supabase RPC error:', matchError);
      // Ensure the function signature matches the DB: check param names/types
      // Also check if the pgvector index exists and is valid for cosine similarity
      return NextResponse.json({ error: `Database query failed: ${matchError.message}` }, { status: 500 });
    }

    console.log(`Found ${documents?.length ?? 0} relevant document chunks.`);

    // 3. Prepare context for OpenAI Chat Completion
    let contextText = '';
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: DocumentChunk) => doc.content).join('\n\n---\n\n');
      console.log("Context prepared for LLM.");
    } else {
      console.log("No relevant documents found to provide context.");
       // Optional: Decide if you want to proceed without context or return a specific message
       // For now, we proceed but the prompt will indicate lack of specific context
       contextText = "No specific context found in the Solidity documentation for this query.";
    }

    // 4. Generate response using OpenAI Chat Completion
    console.log('Generating response with OpenAI Chat Completion...');
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are EtherGuru, a very helpful assistant specialized in Solidity. Answer the user's question based *primarily* on the provided context from the Solidity documentation. If the context doesn't fully cover the question, you may use your general knowledge but clearly state that the information is not from the provided docs. Keep your answers concise and focused on Solidity. If the users ask weird questions that are not based on solidity or blockchain technology broadly, say that you are only here to answer questinos on solidityContext:\n---\n${contextText}\n---`,
        },
        {
            role: 'user',
            content: query,
        },
    ];

    const completionResponse = await openai.chat.completions.create({
      model: chatModel,
      messages: chatMessages,
      temperature: 0.5, // Adjust for creativity vs factualness
      max_tokens: 500,
    });

    const aiResponse = completionResponse.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
        console.error('OpenAI Chat Completion failed to return content.');
        return NextResponse.json({ error: 'Failed to generate AI response.' }, { status: 500 });
    }

    console.log("AI response generated successfully.");

    // 5. Return the AI-generated answer
    return NextResponse.json({ answer: aiResponse });

  } catch (error: unknown) {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500; // Default status code

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Safely check for message property
      if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      // Safely check for status property (like OpenAI errors)
      if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
          const status = (error as { status: number }).status;
          if (status === 401) {
              errorMessage = 'Invalid OpenAI API Key.';
              statusCode = 401; // Update status code for auth error
          }
          // Potentially handle other specific status codes here
          else {
            // Keep original error message if status is not 401 but exists
            statusCode = status >= 100 && status < 600 ? status : 500; // Use status if valid HTTP code
          }
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
