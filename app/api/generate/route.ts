import OpenAI from "openai";
import { NextResponse } from "next/server";
import { runLocalGenerator } from "@/lib/demo";
import type { GenerateRequest, StoreState } from "@/lib/types";

const SYSTEM = `You are the creative engine inside a playful commerce product. A creator describes a brand, storefront, or physical product. Return ONLY valid JSON with this shape: {"message":"short creative reply","store": StoreState}. Preserve all existing IDs and state unless the user requests a change. For products, only use manufacturingTier values ready, configurable, or custom. Treat hats, shirts, hoodies, totes, posters, mugs and notebooks as ready; candles, jewelry, sunglasses and bags as configurable; novel industrial objects as custom. Keep blocks inside a 0-100 percentage canvas. Never add markdown.`;

function extractJson(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("Model did not return JSON.");
  return JSON.parse(text.slice(first, last + 1));
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateRequest;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(runLocalGenerator(body.prompt, body.currentStore));
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const seed: StoreState | undefined = body.currentStore;
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4",
      instructions: SYSTEM,
      input: `Creator request: ${body.prompt}\n\nCurrent store JSON:\n${seed ? JSON.stringify(seed) : "No store yet. Create one."}`,
    });

    const result = extractJson(response.output_text);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(runLocalGenerator(body.prompt, body.currentStore));
  }
}
