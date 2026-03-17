import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const AnalysisSchema = z.object({
  consistency: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string()),
  }),
  structured_data: z.object({
    patient_condition: z.string(),
    procedures: z.array(z.string()),
    diagnoses: z.array(z.string()),
    recommended_codes: z.array(z.string()),
    urgency_level: z.enum(["low", "medium", "high", "critical"]),
  }),
  integrity: z.object({
    missing_fields: z.array(z.string()),
    vague_terms: z.array(z.string()),
    overall_score: z.number().min(0).max(100),
  }),
  suggestions: z.array(z.string()),
});

export async function POST(req: Request) {
  const { title, notes, codes } = await req.json();

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: AnalysisSchema,
      prompt: `
You are a medical QA compliance expert. Analyze the following clinical report data.

Report Title: ${title || "N/A"}
Classification Codes: ${codes || "N/A"}
Clinician Notes: ${notes}

Tasks:
1. Check logical consistency — flag contradictions (e.g. "stable" vs "critical")
2. Extract structured data from the unstructured notes
3. Verify integrity — identify missing fields and vague terms
4. Suggest improvements for better compliance and coding accuracy
      `,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Gemini analyze error:", error);
    return Response.json(
      { error: "AI analysis failed. Check your Gemini API key." },
      { status: 500 },
    );
  }
}
