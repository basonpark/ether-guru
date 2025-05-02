// src/app/api/evaluate-explanation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import OpenAI from 'openai';
import { getChallengeBySlug } from '@/lib/challenges';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key - make sure OPENAI_API_KEY is set in your .env file");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize rate limiter (3 requests per 10 minutes per IP)
const rateLimiter = new RateLimiterMemory({
  points: 3, // Number of points
  duration: 10 * 60, // Per 10 minutes (in seconds)
});

export async function POST(request: NextRequest) {
  // Get IP address from request headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  // Use x-forwarded-for (common proxy header), fallback to x-real-ip
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'unknown';

  try {
    // Consume 1 point per request for the IP address
    await rateLimiter.consume(ip);

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
You are an expert smart contract security auditor reviewing a user's explanation of a specific vulnerability.

Challenge Name: ${challengeName}

Official Explanation (for context, do not simply copy it):
${officialExplanation}

User's Explanation:
${userExplanation}

Task:
Evaluate the user's explanation based ONLY on the provided user explanation and the official explanation context. Assess how well the user understands the *core concepts* of the vulnerability described in the official explanation, the potential *impact*, and any relevant *mitigation* strategies mentioned or implied.

Instructions:
1.  **Compare Core Concepts:** Does the user accurately identify the main vulnerability type (e.g., reentrancy, integer overflow, access control issue)? Do they explain *why* it's a vulnerability in this context?
2.  **Assess Impact Understanding:** Does the user grasp the potential consequences of the vulnerability (e.g., loss of funds, denial of service, unauthorized actions)?
3.  **Evaluate Mitigation Awareness:** Does the user mention or allude to correct ways to prevent or fix the vulnerability (even if not explicitly asked for)?
4.  **Clarity and Accuracy:** Is the explanation clear, concise, and technically accurate? Avoid penalizing minor grammatical errors if the meaning is clear.
5.  **Scoring (0-10):** Assign a score based on the following criteria:
    *   0-2: Completely incorrect or irrelevant explanation.
    *   3-4: Shows minimal understanding, misses key concepts.
    *   5-6: Grasps some basic concepts but has significant gaps or inaccuracies.
    *   7-8: Good understanding of core concepts and impact, minor inaccuracies or omissions allowed.
    *   9-10: Excellent, accurate, and comprehensive understanding of the vulnerability, impact, and potentially mitigation.
6.  **Feedback:** Provide brief, constructive feedback (2-3 sentences max). Highlight strengths and specific areas for improvement. Be encouraging.

Output Format: Respond ONLY with a valid JSON object containing 'score' (integer 0-10) and 'feedback' (string).
Example:
{
  "score": 8,
  "feedback": "Good grasp of the reentrancy vulnerability and its potential for draining funds. Consider mentioning the checks-effects-interactions pattern for mitigation."
}
`;

      // --- Call OpenAI API ---
      console.log(`Calling OpenAI for evaluation... (Challenge: ${challengeSlug}, IP: ${ip})`); // Log IP
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use the newer model if available
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Lower temperature for more deterministic evaluation
        max_tokens: 200, // Limit response size
        response_format: { type: "json_object" }, // Request JSON output
      });

      const content = completion.choices[0]?.message?.content;

      // --- Parse OpenAI Response (with fallback) ---
      let score: number = 0;
      let feedback: string = "Could not evaluate explanation.";

      try {
        if (!content) {
          throw new Error("No content received from OpenAI");
        }

        console.log("Raw OpenAI Response:", content); // Log raw response for debugging

        const result = JSON.parse(content);
        if (typeof result.score === 'number' && typeof result.feedback === 'string') {
          score = Math.max(0, Math.min(10, Math.round(result.score))); // Clamp score between 0-10 and round
          feedback = result.feedback;
        } else {
          console.error("Invalid JSON structure from OpenAI", result);
          throw new Error("Unexpected JSON structure from OpenAI");
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI JSON response:", parseError);
        console.error("Raw OpenAI content:", content);
        // Attempt to extract score/feedback manually as fallback (less reliable)
        const scoreMatch = content?.match(/"score":\s*(\d+)/);
        const feedbackMatch = content?.match(/"feedback":\s*"([^"]*)"/);
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

  } catch (rateLimitError: unknown) {
    // Rate limiter failed (likely limit exceeded)
    console.warn(`Rate limit exceeded for IP: ${ip}`); // Log rate limit event

    // Safely check for msBeforeNext property
    let secondsUntilReset = 'unknown';
    if (
      typeof rateLimitError === 'object' &&
      rateLimitError !== null &&
      'msBeforeNext' in rateLimitError &&
      typeof (rateLimitError as { msBeforeNext: unknown }).msBeforeNext === 'number'
    ) {
      secondsUntilReset = Math.ceil((rateLimitError as { msBeforeNext: number }).msBeforeNext / 1000).toString();
    }

    console.warn(`Time until reset: ${secondsUntilReset} seconds`);
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
}
