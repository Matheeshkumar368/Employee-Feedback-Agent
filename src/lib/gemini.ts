import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface FeedbackAnalysisResult {
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  summary: string;
  keywords: string[];
  priority: "high" | "medium" | "low";
  urgency: "immediate" | "soon" | "monitor" | "none";
  hrRecommendation: string;
  managementRecommendation: string;
  recommendedAction: string;
  emotion: string;
}

// ─── System Prompt ─────────────────────────────────────────────────────────────
// Role: Senior HR Consultant AI — handles analysis, classification, recommendations

const HR_SYSTEM_PROMPT = `You are AuraHR, a Senior HR Consultant AI with 20+ years of experience in employee relations, organizational psychology, and workforce analytics.

YOUR RESPONSIBILITIES:
1. Analyze employee feedback with professional empathy and objectivity
2. Detect the primary emotion the employee is expressing
3. Classify sentiment as positive, neutral, or negative with a numeric score
4. Identify the most important workplace issues raised
5. Summarize feedback concisely and professionally
6. Assign priority and urgency levels based on content severity
7. Generate specific, actionable HR recommendations
8. Generate management-level action recommendations
9. Never fabricate facts or hallucinate details not present in the feedback
10. Always return structured, valid JSON

PRIORITY RULES:
- high: Rating 1–2, OR expresses safety concerns, legal issues, harassment, or threats to leave
- medium: Rating 3, OR moderate dissatisfaction, team conflict, unclear career path
- low: Rating 4–5, OR general suggestions, positive feedback with minor notes

URGENCY RULES:
- immediate: Safety/harassment/legal issues, or multiple employees report same critical issue
- soon: High-priority items requiring HR action within 1 week
- monitor: Medium-priority items to watch over the next month
- none: Positive or low-concern feedback requiring no action

EMOTION DETECTION:
Detect the primary emotion: frustrated, satisfied, motivated, anxious, disappointed, hopeful, angry, content, disengaged, overwhelmed, appreciated, or neutral.`;

// ─── Few-shot examples for structured JSON output ──────────────────────────────

const FEW_SHOT_EXAMPLES = `
EXAMPLES OF CORRECT OUTPUT:

Example 1 — Negative feedback:
Input: Department=Sales, Category=Management, Rating=2, Message="My manager constantly micromanages every task and never trusts the team to make decisions. It's exhausting and demoralizing."
Output:
{
  "sentiment": "negative",
  "sentimentScore": -0.82,
  "summary": "Employee reports severe micromanagement from their manager, leading to low morale and reduced autonomy in the Sales team.",
  "keywords": ["micromanagement", "trust", "autonomy", "morale", "management style"],
  "priority": "high",
  "urgency": "soon",
  "emotion": "frustrated",
  "hrRecommendation": "Schedule a confidential meeting with the employee. Initiate management coaching for the Sales team lead focused on delegation and trust-building.",
  "managementRecommendation": "Review the Sales manager's leadership approach. Conduct 360-degree feedback assessment. Implement weekly team autonomy check-ins.",
  "recommendedAction": "HR should meet with employee within 3 days and arrange management coaching within 2 weeks."
}

Example 2 — Positive feedback:
Input: Department=Engineering, Category=Work Environment, Rating=5, Message="The remote work policy is excellent! I feel trusted and productive. The team standups are well-organized."
Output:
{
  "sentiment": "positive",
  "sentimentScore": 0.91,
  "summary": "Employee is highly satisfied with remote work policies and team structure in Engineering, citing trust, productivity, and organized meetings.",
  "keywords": ["remote work", "productivity", "trust", "team standups", "work policy"],
  "priority": "low",
  "urgency": "none",
  "emotion": "satisfied",
  "hrRecommendation": "Document and replicate this team's remote work best practices across other departments.",
  "managementRecommendation": "Recognize the Engineering team's strong work culture. Share this model with other department leads.",
  "recommendedAction": "Archive as positive benchmark. Share anonymized feedback in next HR best-practices report."
}

Example 3 — Neutral feedback:
Input: Department=Finance, Category=Career Growth, Rating=3, Message="The company is okay but I feel my career path is unclear. I'd like more mentoring opportunities."
Output:
{
  "sentiment": "neutral",
  "sentimentScore": -0.15,
  "summary": "Employee is moderately satisfied but uncertain about career progression in Finance, expressing a desire for structured mentorship.",
  "keywords": ["career path", "mentoring", "growth", "uncertainty", "development"],
  "priority": "medium",
  "urgency": "monitor",
  "emotion": "anxious",
  "hrRecommendation": "Set up a career development conversation with this employee. Introduce a formal mentorship matching program for Finance.",
  "managementRecommendation": "Review career ladders for Finance roles. Schedule quarterly career development check-ins.",
  "recommendedAction": "Schedule career planning session within 2 weeks. Add employee to mentorship program waitlist."
}`;

// ─── Prompt template for feedback analysis ─────────────────────────────────────

function buildAnalysisPrompt(
  feedbackText: string,
  department: string,
  category: string,
  rating: number
): string {
  return `${HR_SYSTEM_PROMPT}

${FEW_SHOT_EXAMPLES}

Now analyze this NEW employee feedback. Return ONLY valid JSON, no markdown, no explanation:

CONTEXT:
- Department: ${department}
- Category: ${category}
- Rating: ${rating}/5
- Feedback: "${feedbackText}"

Return ONLY this exact JSON structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "sentimentScore": <number between -1.0 and 1.0>,
  "summary": "<2-3 professional sentences>",
  "keywords": ["<5-6 key topic words>"],
  "priority": "high" | "medium" | "low",
  "urgency": "immediate" | "soon" | "monitor" | "none",
  "emotion": "<primary detected emotion>",
  "hrRecommendation": "<specific HR action>",
  "managementRecommendation": "<specific management action>",
  "recommendedAction": "<combined summary action with timeline>"
}`;
}

// ─── analyzeFeedback ───────────────────────────────────────────────────────────

export async function analyzeFeedback(
  feedbackText: string,
  department: string,
  category: string,
  rating: number
): Promise<FeedbackAnalysisResult> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.2, topP: 0.8 },
    });

    const prompt = buildAnalysisPrompt(feedbackText, department, category, rating);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const parsed = JSON.parse(jsonMatch[0]) as Partial<FeedbackAnalysisResult>;

    return {
      sentiment: (["positive", "neutral", "negative"] as const).includes(parsed.sentiment as never)
        ? (parsed.sentiment as "positive" | "neutral" | "negative")
        : inferSentiment(rating),
      sentimentScore: typeof parsed.sentimentScore === "number"
        ? Math.max(-1, Math.min(1, parsed.sentimentScore))
        : inferSentimentScore(rating),
      summary: parsed.summary || `Employee submitted ${inferSentiment(rating)} feedback about ${category} in ${department}.`,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 6) : [category, department],
      priority: (["high", "medium", "low"] as const).includes(parsed.priority as never)
        ? (parsed.priority as "high" | "medium" | "low")
        : inferPriority(rating),
      urgency: (["immediate", "soon", "monitor", "none"] as const).includes(parsed.urgency as never)
        ? (parsed.urgency as "immediate" | "soon" | "monitor" | "none")
        : inferUrgency(rating),
      emotion: parsed.emotion || "neutral",
      hrRecommendation: parsed.hrRecommendation || "Review feedback and schedule follow-up.",
      managementRecommendation: parsed.managementRecommendation || "Acknowledge feedback and monitor team.",
      recommendedAction: parsed.recommendedAction || parsed.hrRecommendation || "Review feedback and take appropriate action.",
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return buildFallbackAnalysis(feedbackText, department, category, rating);
  }
}

// ─── Chat with agent ────────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `${HR_SYSTEM_PROMPT}

CHAT MODE INSTRUCTIONS:
- You are in interactive chat mode with an HR administrator
- Use the provided feedback database context to answer questions accurately
- Format responses with markdown for readability (use **bold**, bullet points, headers)
- Be concise but thorough
- When citing data, always mention the specific numbers from the context
- If asked about trends, identify patterns across departments and time periods
- If a question cannot be answered from the available data, say so clearly rather than guessing
- Suggest follow-up questions when relevant`;

export async function chatWithAgent(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  feedbackContext?: string
): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7, topP: 0.9 },
    });

    // Context injection prompt
    const contextSection = feedbackContext
      ? `\n\n## CURRENT FEEDBACK DATABASE CONTEXT\n${feedbackContext}\n\nUse the above data to answer questions accurately. Reference specific numbers when available.\n`
      : "\n\n## NOTE: No feedback data available yet in the database.\n";

    const systemWithContext = `${CHAT_SYSTEM_PROMPT}${contextSection}`;

    // Build recent conversation history (last 10 turns)
    const historyText = conversationHistory
      .slice(-10)
      .map((m) => `${m.role === "user" ? "HR Admin" : "AuraHR"}: ${m.content}`)
      .join("\n\n");

    const fullPrompt = historyText
      ? `${systemWithContext}\n\n## CONVERSATION HISTORY\n${historyText}\n\n## NEW MESSAGE\nHR Admin: ${userMessage}\nAuraHR:`
      : `${systemWithContext}\n\n## NEW MESSAGE\nHR Admin: ${userMessage}\nAuraHR:`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Chat error:", error);
    if (error instanceof Error) {
      if (error.message.includes("GEMINI_API_KEY is not configured")) {
        return "⚠️ **Gemini API Key not configured.**\n\nPlease add your `GEMINI_API_KEY` to the `.env.local` file.\n\nGet your free API key at [Google AI Studio](https://makersuite.google.com/app/apikey).";
      }
      if (error.message.includes("429") || error.message.includes("quota")) {
        return "⚠️ **API rate limit reached.** Please wait a moment before sending another message.";
      }
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return "⚠️ **Network error.** Please check your internet connection and try again.";
      }
    }
    return "I encountered an error processing your request. Please try again.";
  }
}

// ─── Generate insights ──────────────────────────────────────────────────────────

export async function generateInsights(feedbackData: {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  avgRating: number;
  topDepartments: { name: string; avg: number }[];
  topIssues: string[];
}): Promise<string[]> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.4 },
    });

    const prompt = `${HR_SYSTEM_PROMPT}

Analyze this HR feedback data and generate exactly 5 key actionable insights.
Return ONLY a JSON array of 5 strings. Each insight must be under 20 words.

DATA:
- Total Feedback: ${feedbackData.total}
- Positive: ${feedbackData.positive} (${feedbackData.total > 0 ? Math.round((feedbackData.positive / feedbackData.total) * 100) : 0}%)
- Neutral: ${feedbackData.neutral} (${feedbackData.total > 0 ? Math.round((feedbackData.neutral / feedbackData.total) * 100) : 0}%)
- Negative: ${feedbackData.negative} (${feedbackData.total > 0 ? Math.round((feedbackData.negative / feedbackData.total) * 100) : 0}%)
- Average Rating: ${feedbackData.avgRating.toFixed(1)}/5
- Top Issues: ${feedbackData.topIssues.join(", ") || "none identified"}
- Department Performance: ${feedbackData.topDepartments.map((d) => `${d.name}: ${d.avg.toFixed(1)}/5`).join(", ") || "no data"}

Return ONLY:
["insight1", "insight2", "insight3", "insight4", "insight5"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");

    const insights = JSON.parse(jsonMatch[0]) as string[];
    return insights.slice(0, 5);
  } catch {
    // Fallback insights
    const positivePct = feedbackData.total > 0 ? Math.round((feedbackData.positive / feedbackData.total) * 100) : 0;
    return [
      `Average satisfaction is ${feedbackData.avgRating.toFixed(1)}/5 across all departments.`,
      `${positivePct}% of feedback reflects positive employee sentiment this period.`,
      `Top concern: "${feedbackData.topIssues[0] ?? "Work environment"}" needs HR attention.`,
      `${feedbackData.topDepartments[0]?.name ?? "Engineering"} leads with ${feedbackData.topDepartments[0]?.avg.toFixed(1) ?? "N/A"}/5 satisfaction.`,
      "Schedule quarterly feedback reviews to track ongoing improvements.",
    ];
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function inferSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

function inferSentimentScore(rating: number): number {
  return (rating - 3) / 2;
}

function inferPriority(rating: number): "high" | "medium" | "low" {
  if (rating <= 2) return "high";
  if (rating === 3) return "medium";
  return "low";
}

function inferUrgency(rating: number): "immediate" | "soon" | "monitor" | "none" {
  if (rating === 1) return "soon";
  if (rating === 2) return "monitor";
  if (rating === 3) return "monitor";
  return "none";
}

function buildFallbackAnalysis(
  _text: string,
  department: string,
  category: string,
  rating: number
): FeedbackAnalysisResult {
  const sentiment = inferSentiment(rating);
  const priority = inferPriority(rating);
  const urgency = inferUrgency(rating);
  const actionMap = {
    high: "Immediate HR review required. Schedule employee meeting within 48 hours.",
    medium: "Monitor situation and follow up within the week.",
    low: "Acknowledge feedback and maintain current positive practices.",
  };
  return {
    sentiment,
    sentimentScore: inferSentimentScore(rating),
    summary: `Employee submitted ${sentiment} feedback regarding ${category} in the ${department} department with a rating of ${rating}/5.`,
    keywords: [category, department, sentiment, "feedback", "employee"],
    priority,
    urgency,
    emotion: sentiment === "negative" ? "frustrated" : sentiment === "positive" ? "satisfied" : "neutral",
    hrRecommendation: actionMap[priority],
    managementRecommendation: `Review ${department} team ${category.toLowerCase()} concerns and schedule team check-in.`,
    recommendedAction: actionMap[priority],
  };
}
