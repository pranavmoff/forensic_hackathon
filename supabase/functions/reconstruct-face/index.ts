import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frontalImage, lateralImage } = await req.json();
    
    if (!frontalImage || !lateralImage) {
      return new Response(
        JSON.stringify({ error: "Both frontal and lateral images are required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    console.log("Step 1: Analyzing skull X-rays...");
    
    // Step 1: Analyze the X-rays to get facial features
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: frontalImage }
              },
              {
                type: "image_url",
                image_url: { url: lateralImage }
              },
              {
                type: "text",
                text: `Analyze these frontal and lateral skull X-ray images. Provide a detailed facial reconstruction profile in JSON format:

{
  "faceShape": "describe the overall face shape",
  "estimatedAge": "age range",
  "sex": "Male/Female",
  "ancestry": "ethnic background",
  "facialFeatures": {
    "foreheadShape": "description",
    "eyeShape": "description",
    "noseShape": "description",
    "mouthShape": "description",
    "jawline": "description",
    "cheekbones": "description",
    "skinTone": "description",
    "hairType": "description"
  },
  "softTissueDepth": {
    "forehead": "measurement",
    "cheeks": "measurement",
    "chin": "measurement"
  },
  "reconstructionNotes": "methodology notes",
  "detailedDescription": "Complete physical description for image generation"
}

Respond ONLY with valid JSON.`
              }
            ]
          }
        ]
      })
    });

    const analysisData = await analysisResponse.json();
    console.log("Analysis response received");

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Analysis failed" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const analysisText = analysisData.choices?.[0]?.message?.content;
    if (!analysisText) {
      return new Response(
        JSON.stringify({ error: "No analysis generated" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Parse JSON from analysis
    let reconstructionData;
    try {
      const cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      reconstructionData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    console.log("Step 2: Generating realistic face image...");

    // Step 2: Generate realistic face image based on analysis
    const imagePrompt = `Create a photorealistic portrait of a human face based on this forensic reconstruction:

${reconstructionData.detailedDescription}

Features:
- Face Shape: ${reconstructionData.faceShape}
- Age: ${reconstructionData.estimatedAge}
- Sex: ${reconstructionData.sex}
- Ancestry: ${reconstructionData.ancestry}
- Skin Tone: ${reconstructionData.facialFeatures.skinTone}
- Eyes: ${reconstructionData.facialFeatures.eyeShape}
- Nose: ${reconstructionData.facialFeatures.noseShape}
- Mouth: ${reconstructionData.facialFeatures.mouthShape}
- Jawline: ${reconstructionData.facialFeatures.jawline}
- Cheekbones: ${reconstructionData.facialFeatures.cheekbones}
- Hair: ${reconstructionData.facialFeatures.hairType}

Professional forensic reconstruction quality, frontal view, neutral expression, detailed facial features, photorealistic.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    const imageData = await imageResponse.json();
    console.log("Image generation response received");

    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Image generation failed",
          analysisData: reconstructionData 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const reconstructedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    return new Response(
      JSON.stringify({ 
        reconstructedImage,
        analysisData: reconstructionData
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in reconstruct-face function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
