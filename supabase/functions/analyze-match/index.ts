import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { frames, videoInfo } = await req.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(JSON.stringify({ error: "No frames provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const imageContent = frames.map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame },
    }));

    const isChunked = videoInfo?.totalChunks !== undefined;
    const chunkContext = isChunked 
      ? `You are analyzing segment ${videoInfo.chunkIndex} of ${videoInfo.totalChunks} (each segment is roughly 1-2 minutes of footage). Limit momentum points to 1 or 2. Identify 1 or 2 key events. Focus on what happens specifically within this timeframe.`
      : `You are analyzing a compressed timeline of the full match.`;

    const systemPrompt = `You are an elite football (soccer) match analyst AI with deep expertise in tactical analysis, sports science, and performance metrics. You analyze match footage frames with extreme precision.

CRITICAL ACCURACY RULES:
- Only report what you can ACTUALLY SEE in the frames. Do not fabricate data.
- If you cannot determine something from the frames, provide your best estimate and note uncertainty.
- Base all numbers on observable evidence: player positions, spacing, body postures, ball location, pitch zones.
- ${chunkContext}
- For possession: observe which team has/is near the ball across multiple frames.

You MUST respond with valid JSON only, no markdown, no explanation outside JSON.

Analyze ALL provided frames sequentially (they are time-ordered) and return this exact JSON structure:
{
  "teamAnalysis": {
    "homeTeam": {
      "name": "string - identify by dominant jersey color",
      "possessionRate": number (0-100),
      "passAccuracy": number (0-100),
      "pressingIntensity": number (0-100),
      "formationDetected": "string like 4-3-3",
      "attackingThird": number (0-100),
      "defensiveStrength": number (0-100)
    },
    "awayTeam": { same structure }
  },
  "playerAnalysis": [
    {
      "identifier": "string - jersey number if visible, otherwise positional description",
      "team": "home or away",
      "fatigueLevel": number (0-100),
      "activityRate": number (0-100),
      "positionHeatzone": "string - primary zone",
      "sprintCount": number,
      "performanceRating": number (1-10)
    }
  ],
  "matchMomentum": [
    { "minute": number (${isChunked ? 'estimate minute based on chunk index ' + videoInfo.chunkIndex : 'estimate minute'}), "homeTeamMomentum": number (0-100), "awayTeamMomentum": number (0-100) }
  ],
  "keyEvents": [
    { "description": "string", "timestamp": "string", "significance": "high/medium/low" }
  ],
  "predictions": {
    "likelyScoreline": "string",
    "winProbability": { "home": number, "away": number, "draw": number },
    "nextGoalTeam": "string",
    "expectedGoals": { "home": number, "away": number }
  },
  "tacticalSuggestions": [
    {
      "team": "home or away",
      "suggestion": "string",
      "priority": "high/medium/low",
      "expectedImpact": "string"
    }
  ],
  "overallMatchRating": number (1-10),
  "matchPhase": "string",
  "intensity": number (0-100)
}

Provide specific and evidence-based analysis for this specific period of play.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze these ${frames.length} sequential frames. ${chunkContext} Video info: ${JSON.stringify(videoInfo || {})}. These frames are in chronological order. Provide comprehensive evidence-based analytics in JSON format.`,
              },
              ...imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from response, handling markdown code blocks
    let analytics;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analytics = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ analytics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
