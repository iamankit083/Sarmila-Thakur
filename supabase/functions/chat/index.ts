import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    // Any OpenAI-compatible chat/completions endpoint works here.
    // Defaults to OpenRouter (https://openrouter.ai), which accepts the
    // same "provider/model" slugs (e.g. "google/gemini-2.0-flash-001").
    // Set these as Supabase function secrets:
    //   supabase secrets set AI_API_KEY=sk-...
    //   supabase secrets set AI_API_URL=https://openrouter.ai/api/v1/chat/completions
    //   supabase secrets set AI_MODEL=google/gemini-2.0-flash-001
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_API_URL =
      Deno.env.get("AI_API_URL") ??
      "https://openrouter.ai/api/v1/chat/completions";
    const AI_MODEL = Deno.env.get("AI_MODEL") ?? "google/gemini-2.0-flash-001";

    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant. Keep your answers clear, concise, and well-formatted using markdown when appropriate. You can use code blocks, lists, bold, and other markdown formatting.",
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your AI provider account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI provider error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
