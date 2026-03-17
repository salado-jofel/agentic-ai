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
      success_rate: z.number().min(0).max(100),
      usage_count: z.number(),
      trend: z.enum(["up", "down", "stable"]),
      example_note: z.string(),
    }),
  ),
  insights: z.object({
    top_performing_category: z.string(),
    most_common_codes: z.array(z.string()),
    avg_success_rate: z.number(),
    recommendations: z.array(z.string()),
  }),
});

export async function POST(req: Request) {
  const { department, date_range } = await req.json();

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: PatternsSchema,
      prompt: `
You are a medical QA analyst reviewing historical report patterns.

Department filter: ${department || "All Departments"}
Date range: ${date_range || "Last 90 days"}

Generate realistic historical QA report patterns based on common medical
documentation scenarios. Include patterns from departments like Cardiology,
ICU, Surgery, and Emergency. Each pattern should reflect real-world
documentation successes and failures with practical coding suggestions.

Return 6 diverse patterns covering different medical categories with
realistic success rates, usage counts and coding recommendations.
      `,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Gemini patterns error:", error);
    return Response.json(
      { error: "Failed to load patterns. Check your Gemini API key." },
      { status: 500 },
    );
  }
}
