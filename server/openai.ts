import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface MarketingPlanParams {
  businessType: string;
  goalsPrimary: string;
  audience: string;
  budget: string;
  timeline: string;
  competitors?: string;
  additionalInfo?: string;
  includeSocialMedia: boolean;
  includeContentMarketing: boolean;
  includeSEO: boolean;
  includeEmailMarketing: boolean;
  includePaidAdvertising: boolean;
}

/**
 * Generate a marketing plan using OpenAI
 */
export async function generateMarketingPlan(params: MarketingPlanParams, clientName: string): Promise<any> {
  const strategyTypes = [];
  if (params.includeSocialMedia) strategyTypes.push("social media marketing");
  if (params.includeContentMarketing) strategyTypes.push("content marketing");
  if (params.includeSEO) strategyTypes.push("SEO (Search Engine Optimization)");
  if (params.includeEmailMarketing) strategyTypes.push("email marketing");
  if (params.includePaidAdvertising) strategyTypes.push("paid advertising");
  
  const prompt = `
    Create a detailed, professional marketing plan for ${clientName}'s ${params.businessType} business.
    
    CLIENT INFORMATION:
    - Business Type: ${params.businessType}
    - Primary Goal: ${params.goalsPrimary}
    - Target Audience: ${params.audience}
    - Budget Range: ${params.budget}
    - Timeline: ${params.timeline}
    ${params.competitors ? `- Competitors: ${params.competitors}` : ''}
    ${params.additionalInfo ? `- Additional Information: ${params.additionalInfo}` : ''}
    
    The marketing plan should focus on these strategy areas: ${strategyTypes.join(", ")}
    
    For the marketing plan, provide the following:
    1. Executive Summary (brief overview of the marketing plan)
    2. Situation Analysis (market overview, SWOT analysis)
    3. Target Audience Analysis (detailed breakdown of target demographics, psychographics)
    4. Marketing Objectives (specific, measurable goals)
    5. Marketing Strategies (detailed strategies for each selected marketing channel)
    6. Tactical Implementation Plan (specific actions, timeline, and responsibilities)
    7. Budget Allocation (detailed breakdown of marketing spending)
    8. Measurement & KPIs (metrics to track the success of marketing efforts)
    
    Structure the response as valid JSON following this exact format:
    {
      "executiveSummary": "text describing the overall marketing plan",
      "situationAnalysis": {
        "marketOverview": "text describing the market",
        "swot": {
          "strengths": ["strength1", "strength2", ...],
          "weaknesses": ["weakness1", "weakness2", ...],
          "opportunities": ["opportunity1", "opportunity2", ...],
          "threats": ["threat1", "threat2", ...]
        }
      },
      "targetAudience": {
        "demographics": ["demographic1", "demographic2", ...],
        "psychographics": ["psychographic1", "psychographic2", ...],
        "behaviors": ["behavior1", "behavior2", ...]
      },
      "objectives": ["objective1", "objective2", ...],
      "strategies": [
        {
          "type": "strategy type (e.g., 'social_media')",
          "title": "Strategy title",
          "description": "Description of the strategy",
          "tactics": ["tactic1", "tactic2", ...],
          "timeline": "Implementation timeline",
          "metrics": ["metric1", "metric2", ...]
        },
        ...
      ],
      "budget": {
        "total": "Total budget amount (formatted as currency)",
        "breakdown": [
          {
            "category": "Budget category name",
            "amount": "Amount (formatted as currency)",
            "percentage": "Percentage of total budget",
            "description": "Description of this budget category"
          },
          ...
        ]
      },
      "implementation": {
        "phases": [
          {
            "name": "Phase name",
            "duration": "Duration",
            "activities": ["activity1", "activity2", ...],
            "deliverables": ["deliverable1", "deliverable2", ...]
          },
          ...
        ]
      },
      "kpis": ["kpi1", "kpi2", ...]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert marketing strategist who creates detailed, actionable marketing plans tailored to specific business needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate marketing plan: Empty response from OpenAI");
    }
    
    // Parse the JSON response
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating marketing plan with OpenAI:", error);
    throw new Error(`Failed to generate marketing plan: ${error.message}`);
  }
}