import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const PatternsSchema = z.object({
  patterns: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      pattern_type: z.string(),
      description: z.string(),
      recommended_codes: z.array(z.string()),
      success_rate: z.number().min(0).max(100), // How often this pattern passes audit
      usage_count: z.number(),
      trend: z.enum(["up", "down", "stable"]),
      example_note: z.string(),
    }),
  ),
  insights: z.object({
    top_performing_category: z.string(),
    most_common_codes: z.array(z.string()),
    avg_success_rate: z.number(),
    denial_risk_summary: z.string(), // Added for business value
    recommendations: z.array(z.string()),
  }),
});

export async function POST(req: Request) {
  const { department, date_range } = await req.json();

  try {
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: PatternsSchema,
      prompt: `
        ROLE: Senior Medical QA Strategist.
        TASK: Analyze historical clinical documentation patterns to identify "Audit Strengths" and "Denial Risks."

        CONTEXT:
        - Department: ${department || "General Home Health"}
        - Period: ${date_range || "Last 90 days"}

        REQUIREMENTS:
        1. GENERATE 6 DIVERSE PATTERNS: 
           - Include "High-Risk" patterns (e.g., Vague wound descriptions, missing vitals).
           - Include "High-Success" patterns (e.g., Specific objective measurements, strong homebound justification).
        2. CODING ACCURACY: Ensure 'recommended_codes' are valid ICD-10 or HCPCS formats.
        3. REALISM: success_rate should correlate with the pattern_type. A "Vague Narrative" pattern should have a < 40% success rate.
        4. BUSINESS INSIGHT: The 'denial_risk_summary' must explain the financial impact of these patterns.

        INSTRUCTIONS:
        - Focus on documentation quality as it relates to Medicare/Insurance reimbursement.
        - Provide 'example_note' snippets that demonstrate the pattern clearly.
      `,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Gemini patterns error:", error);
    return Response.json(
      {
        error:
          "Failed to load audit patterns. Please check your API configuration.",
      },
      { status: 500 },
    );
  }
}
