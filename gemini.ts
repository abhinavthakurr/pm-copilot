import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export type ToolType = 'prd' | 'strategy' | 'priority' | 'okr' | 'research' | 'competitive' | 'suite';

export interface GenerationParams {
  tool: ToolType;
  inputs: Record<string, string>;
}

const PROMPTS: Record<ToolType, (inputs: Record<string, string>) => string> = {
  suite: (inputs) => `
    You are an elite Product Management AI Agent. Generate a comprehensive "Product Kickoff Suite" based ONLY on this problem statement:
    Problem Statement: ${inputs.problem}
    Product Stage: ${inputs.stage || 'MVP'}

    This suite must include a high-level version of:
    1. A mini-PRD (Summary, Goals, Top 3 Features).
    2. A Product Strategy (North Star, 6-month roadmap themes).
    3. Quarterly OKRs (2 Objectives with 2 KRs each).
    4. A Prioritization Recommendation (using RICE).
    5. A User Research Hypothesis.

    Format the entire response in one cohesive Markdown document with clear headers for each section.
    # PRODUCT KICKOFF SUITE: ${inputs.problem.substring(0, 30)}...
  `,
  prd: (inputs) => `
    You are a senior Product Manager. Generate a comprehensive, professional Product Requirements Document (PRD) based on this problem.
    Problem Statement: ${inputs.problem}
    Target User: ${inputs.user || 'General Users'}
    Product Stage: ${inputs.stage || '0-to-1'}

    Format correctly in Markdown with these sections:
    # Product Requirements Document
    ## 1. Executive Summary
    ## 2. Problem Statement & Background
    ## 3. Goals & Non-Goals
    ## 4. User Personas
    ## 5. User Stories (At least 5)
    ## 6. Functional Requirements
    ## 7. Non-Functional Requirements
    ## 8. Acceptance Criteria
    ## 9. Success Metrics & KPIs
    ## 10. Risks & Mitigations
  `,
  strategy: (inputs) => `
    You are a Chief Product Officer. Generate a comprehensive 6-month product strategy document.
    Product Description: ${inputs.description}
    Time Horizon: ${inputs.horizon || '6 months'}
    Primary Goal: ${inputs.goal || 'Growth'}

    Format in Markdown:
    # Product Strategy
    ## 1. Vision & North Star
    ## 2. Market Context
    ## 3. Strategic Bets
    ## 4. Competitive Positioning
    ## 5. Roadmap Themes
    ## 6. Success Metrics
  `,
  priority: (inputs) => `
    You are a senior Product Manager. Apply the ${inputs.framework || 'RICE'} framework to prioritize this feature list.
    Features: ${inputs.features}
    Context: ${inputs.context || 'General'}

    Format in Markdown:
    # Prioritization Analysis (${inputs.framework})
    ## Framework Breakdown
    ## Scored Feature List
    ## Recommendations
    ## Defer List
  `,
  okr: (inputs) => `
    You are a product leader. Generate quarterly OKRs.
    Vision/Context: ${inputs.vision}
    Quarter: ${inputs.quarter || 'Q1'}
    Objective Count: ${inputs.count || '3'}

    Format in Markdown:
    # Quarterly OKRs (${inputs.quarter})
    ## Objective 1 + Key Results
    ## Objective 2 + Key Results
    ## Objective 3 + Key Results
    ## Tracking Plan
  `,
  research: (inputs) => `
    You are a UX Research lead. Create a structured user research plan.
    Hypothesis: ${inputs.hypothesis}
    Method: ${inputs.method || 'Interviews'}
    Participants: ${inputs.participants || '5-8'}

    Format in Markdown:
    # User Research Plan
    ## Research Goals
    ## Methodology
    ## Participant Criteria
    ## Interview Guide / Questions
    ## Success Metrics
  `,
  competitive: (inputs) => `
    You are a product strategist. Generate a thorough competitive analysis.
    My Product: ${inputs.product}
    Competitors: ${inputs.competitors}
    Differentiator: ${inputs.diff}

    Format in Markdown:
    # Competitive Analysis
    ## Market Landscape
    ## Competitor Profiles
    ## Feature Comparison
    ## Differentiation Strategy
  `
};

export async function generateProductAsset({ tool, inputs }: GenerationParams) {
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please configure it in your environment.");
  }

  const prompt = PROMPTS[tool](inputs);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate content.";
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "An error occurred during generation.");
  }
}
