export type ManufacturingTier = "ready" | "configurable" | "custom";

export type ProductConcept = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  manufacturingTier: ManufacturingTier;
  manufacturingNote: string;
  badge: string;
};

export type StoreBlock = {
  id: string;
  type: "headline" | "copy" | "product" | "sticker";
  content: string;
  x: number;
  y: number;
  width: number;
  rotation?: number;
  productId?: string;
};

export type StoreState = {
  brandName: string;
  tagline: string;
  vibe: string;
  background: string;
  foreground: string;
  accent: string;
  products: ProductConcept[];
  blocks: StoreBlock[];
  published: boolean;
  slug: string;
};

export type GenerateRequest = {
  prompt: string;
  currentStore?: StoreState;
};

export type GenerateResult = {
  message: string;
  store: StoreState;
};
