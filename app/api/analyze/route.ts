import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const AnalysisSchema = z.object({
  consistency: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string()), // ← was "conflicts", now "issues"
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

  if (!notes) {
    return Response.json(
      { error: "Narrative notes are required." },
      { status: 400 },
    );
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: AnalysisSchema,
      prompt: `
        ROLE: Expert Home Health Clinical Auditor & ICD-10 Coding Specialist.
        
        TASK: 
        Perform a rigorous Quality Assurance (QA) audit on the provided clinical narrative. 
        Your goal is to identify risks that lead to insurance claim denials.

        INPUT DATA:
        - Report Title: ${title || "Untitled Visit"}
        - Inputted ICD/HCPCS Codes: ${codes || "None"}
        - Narrative Notes: "${notes}"

        AUDIT PROTOCOL:
        1. LOGICAL CONTRADICTIONS: Cross-reference statements. Flag mismatches.
        2. CLINICAL SPECIFICITY: Identify "vague_terms" (e.g., "doing well", "stable"). 
        3. CODE ALIGNMENT: Compare documentation against "Inputted Codes".
        4. INTEGRITY CHECK: Flag missing vitals, homebound justification, or measurements.

        SCORING CALIBRATION (CRITICAL):
        - If the narrative includes specific vital signs, objective measurements, and clear medical necessity without contradictions, YOU MUST ISSUE A 100/100 SCORE.
        - Do not hallucinate issues. If an array (issues, missing_fields, vague_terms) is empty, return an empty array [].
        - A "Perfect Score" represents documentation that is ready for immediate billing.

        INSTRUCTIONS:
        - Only flag issues that would actually lead to a claim denial.
        - If the documentation is objective and specific, acknowledge its high quality.
      `,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Clinical Auditor Error:", error);
    return Response.json(
      {
        error:
          "The AI Auditor encountered an error processing the clinical data.",
      },
      { status: 500 },
    );
  }
}
