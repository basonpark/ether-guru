// src/app/api/evaluate-explanation/route.ts
import { NextRequest, NextResponse } from 'next/server'; // Use NextRequest
import { RateLimiterMemory } from 'rate-limiter-flexible';
import OpenAI from 'openai';
import { getChallengeBySlug } from '@/lib/challenges'; // Assuming correct path alias

// Ensure the API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key - make sure OPENAI_API_KEY is set in your .env file");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize rate limiter (3 requests per 5 minutes per IP)
const rateLimiter = new RateLimiterMemory({
  points: 3, // Number of points
  duration: 10 * 60, // Per 5 minutes (in seconds)
});

export async function POST(request: NextRequest) { // Use NextRequest type
  // Get IP address from request headers
  const forwardedFor = request.headers.get('x-forwarded-for'); // Use request.headers
  const realIp = request.headers.get('x-real-ip'); // Use request.headers
  // Use x-forwarded-for (common proxy header), fallback to x-real-ip
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'unknown'; 

  try {
    // Consume 1 point per request for the IP address
    await rateLimiter.consume(ip);

    // --- Original logic wrapped in a try block ---
    try {
      const { userExplanation, challengeSlug } = await request.json();

      // Basic input validation
      if (!userExplanation || !challengeSlug) {
        return NextResponse.json({ error: 'Missing userExplanation or challengeSlug' }, { status: 400 });
      }

      // Retrieve the official challenge explanation
      const challenge = getChallengeBySlug(challengeSlug);
      if (!challenge || !challenge.explanation) {
        return NextResponse.json({ error: 'Challenge or explanation not found' }, { status: 404 });
      }
      const officialExplanation = challenge.explanation;
      const challengeName = challenge.name;

      // --- Construct the Prompt for OpenAI ---
      const prompt = `
You are an expert Ethereum security auditor evaluating explanations for Ethernaut challenges.
The user is attempting the '${challengeName}' challenge.

Official Explanation for ${challengeName}:
---
${officialExplanation}
---

User's Explanation:
---
${userExplanation}
---

Evaluate the user's explanation based *only* on its relevance, accuracy, and completeness in explaining the vulnerability and exploit steps for the '${challengeName}' challenge, compared to the official explanation provided above.

Provide your evaluation in the following JSON format, and nothing else:
{
  "score": <integer score between 0 and 10>,
  "feedback": "<string feedback>"
}

Rules for Evaluation:
- Score 10: Perfect explanation, covers all key points accurately. Feedback should be positive encouragement (e.g., "Excellent work! Your explanation is spot on.").
- Score 7-9: Mostly correct, might miss minor details or clarity. Feedback should point out small gaps and suggest minor improvements based on the official explanation.
- Score 0-6: Significant inaccuracies, missing core concepts, or irrelevant information. Feedback MUST provide specific, actionable hints pointing directly to the weaknesses in the user's explanation and guiding them towards the concepts in the official explanation they missed. Be specific about *what* they missed or got wrong. Do not reveal the full solution, but guide them clearly.
- Base the score solely on the comparison to the provided official explanation for *this specific challenge*. Ignore formatting or grammar unless it significantly hinders understanding.
- Ensure the feedback is constructive and helpful, especially for lower scores.
`;

      // --- Call OpenAI API ---
      console.log(`Calling OpenAI for challenge: ${challengeName}, IP: ${ip}`); // Log IP
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using a cost-effective but capable model
        messages: [
          { role: 'system', content: 'You are an expert Ethereum security auditor evaluating explanations for Ethernaut challenges. Respond ONLY in the requested JSON format.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }, // Request JSON output
        temperature: 0.2, // Low temperature for consistent scoring
        max_tokens: 300, // Limit response length
      });

      console.log(`OpenAI response received for IP: ${ip}`); // Log IP

      // --- Parse Response ---
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("OpenAI returned empty content");
      }

      let score: number | null = null;
      let feedback: string | null = null;

      try {
        const result = JSON.parse(content);
        score = typeof result.score === 'number' ? Math.max(0, Math.min(10, result.score)) : null; // Clamp score 0-10
        feedback = typeof result.feedback === 'string' ? result.feedback : 'Could not parse feedback.';

        if (score === null || feedback === null) {
          console.error("Failed to parse score or feedback from OpenAI JSON:", content);
          throw new Error("Invalid JSON structure from OpenAI");
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI JSON response:", parseError);
        console.error("Raw OpenAI content:", content);
        // Attempt to extract score/feedback manually as fallback (less reliable)
        const scoreMatch = content.match(/"score":\s*(\d+)/);
        const feedbackMatch = content.match(/"feedback":\s*"([^"]*)"/);
        score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
        feedback = feedbackMatch ? feedbackMatch[1] : "Error processing evaluation. Please try again.";
        score = Math.max(0, Math.min(10, score)); // Clamp again
      }

      console.log(`Evaluation result - Score: ${score}, Feedback: ${feedback.substring(0, 50)}... (IP: ${ip})`); // Log IP

      // --- Return Result ---
      return NextResponse.json({ score, feedback });

    } catch (error) {
      console.error(`Error processing request for IP: ${ip}:`, error); // Log IP in error
      return NextResponse.json({ error: 'Failed to evaluate explanation. Please try again later.' }, { status: 500 });
    }
    // --- End of original logic try block ---

  } catch (rateLimitError: any) {
    // Rate limiter failed (likely limit exceeded)
    console.warn(`Rate limit exceeded for IP: ${ip}`); // Log rate limit event
    // Check if the error object has points information (optional, for logging)
    const secondsUntilReset = rateLimitError.msBeforeNext ? Math.ceil(rateLimitError.msBeforeNext / 1000) : 'unknown';
    console.warn(`Time until reset: ${secondsUntilReset} seconds`);
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
}

// Optional: Add type safety for the request body if needed
// interface EvaluateRequestBody {
//   userExplanation: string;
//   challengeSlug: string;
// }
