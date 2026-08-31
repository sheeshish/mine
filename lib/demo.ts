import { classifyManufacturing } from "./manufacturing";
import type { GenerateResult, ProductConcept, StoreState } from "./types";

const productKeywords = [
  ["hat", "Hat"],
  ["cap", "Hat"],
  ["shirt", "T-Shirt"],
  ["tee", "T-Shirt"],
  ["hoodie", "Hoodie"],
  ["tote", "Tote Bag"],
  ["poster", "Poster"],
  ["mug", "Mug"],
  ["candle", "Candle"],
  ["lamp", "Lamp"],
] as const;

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 36) || "my-store";
}

function productFromPrompt(prompt: string): ProductConcept {
  const lower = prompt.toLowerCase();
  const matched = productKeywords.find(([keyword]) => lower.includes(keyword));
  const category = matched?.[1] ?? "Object";
  const manufacturing = classifyManufacturing(category);
  const quoted = prompt.match(/[“\"]([^”\"]+)[”\"]/i)?.[1];
  const name = quoted ? `${quoted} ${category}` : `${category} No. ${Math.floor(Math.random() * 90 + 10)}`;

  return {
    id: crypto.randomUUID(),
    name,
    description: `Generated from: “${prompt.slice(0, 130)}${prompt.length > 130 ? "…" : ""}”`,
    category,
    price: manufacturing.tier === "ready" ? 38 : manufacturing.tier === "configurable" ? 64 : 120,
    manufacturingTier: manufacturing.tier,
    manufacturingNote: manufacturing.note,
    badge: manufacturing.tier === "ready" ? "READY TO ROUTE" : manufacturing.tier === "configurable" ? "SUPPLIER NEEDED" : "MAKE THIS REAL",
  };
}

export function makeInitialStore(prompt: string): StoreState {
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  const brandName = words.slice(0, 2).join(" ").toUpperCase() || "ODD GOODS";
  const dark = /dark|black|goth|night|underground|metal/i.test(prompt);
  const playful = /fun|weird|playful|pickle|chaos|color|bright|candy/i.test(prompt);

  return {
    brandName,
    tagline: "Objects from a world that did not exist five minutes ago.",
    vibe: prompt,
    background: dark ? "#111111" : playful ? "#fff4d8" : "#f3efe8",
    foreground: dark ? "#f8f5ee" : "#171717",
    accent: playful ? "#ff5a36" : dark ? "#d6ff4b" : "#4457ff",
    products: [],
    blocks: [
      { id: crypto.randomUUID(), type: "headline", content: brandName, x: 7, y: 8, width: 62, rotation: -2 },
      { id: crypto.randomUUID(), type: "copy", content: "A tiny universe of physical things.", x: 9, y: 27, width: 38, rotation: 1 },
      { id: crypto.randomUUID(), type: "sticker", content: "NEW WORLD →", x: 72, y: 12, width: 18, rotation: 8 },
    ],
    published: false,
    slug: slugify(brandName),
  };
}

export function runLocalGenerator(prompt: string, currentStore?: StoreState): GenerateResult {
  let store = currentStore ? structuredClone(currentStore) : makeInitialStore(prompt);
  const lower = prompt.toLowerCase();

  if (!currentStore) {
    return { message: "I made the first version of your world. Now tell me what product should exist in it.", store };
  }

  if (/black background|make.*black|dark mode|make.*dark/.test(lower)) {
    store.background = "#101010";
    store.foreground = "#f6f1e8";
    store.accent = "#d6ff4b";
  }

  if (/cream|beige|warm|paper/.test(lower)) {
    store.background = "#f5ead7";
    store.foreground = "#1d1b18";
  }

  if (productKeywords.some(([keyword]) => lower.includes(keyword)) || /make me|create a product|product/.test(lower)) {
    const product = productFromPrompt(prompt);
    store.products.push(product);
    store.blocks.push({
      id: crypto.randomUUID(),
      type: "product",
      content: product.name,
      x: 10 + ((store.products.length - 1) % 3) * 29,
      y: 48 + Math.floor((store.products.length - 1) / 3) * 30,
      width: 24,
      rotation: store.products.length % 2 ? -2 : 2,
      productId: product.id,
    });
    return {
      message: `${product.name} exists. Manufacturing status: ${product.badge}.`,
      store,
    };
  }

  if (/logo|brand name|rename/.test(lower)) {
    const quoted = prompt.match(/[“\"]([^”\"]+)[”\"]/i)?.[1];
    if (quoted) {
      store.brandName = quoted.toUpperCase();
      store.slug = slugify(quoted);
      const hero = store.blocks.find((b) => b.type === "headline");
      if (hero) hero.content = store.brandName;
    }
  }

  return { message: "I changed the world. Keep art-directing it, or ask me to make a product.", store };
}
