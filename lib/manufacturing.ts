import type { ManufacturingTier, ProductConcept } from "./types";

const readyCategories = ["hat", "shirt", "t-shirt", "hoodie", "tote", "poster", "mug", "notebook"];
const configurableCategories = ["candle", "jewelry", "necklace", "sunglasses", "bag"];

export function classifyManufacturing(category: string): {
  tier: ManufacturingTier;
  note: string;
} {
  const normalized = category.toLowerCase();
  if (readyCategories.some((item) => normalized.includes(item))) {
    return {
      tier: "ready",
      note: "Eligible for an on-demand manufacturing adapter in the MVP.",
    };
  }
  if (configurableCategories.some((item) => normalized.includes(item))) {
    return {
      tier: "configurable",
      note: "Needs a configurable-product supplier before it can be sold automatically.",
    };
  }
  return {
    tier: "custom",
    note: "Keep as a concept for now; route to a future custom manufacturing workflow.",
  };
}

export interface ManufacturingProvider {
  id: string;
  canFulfill(product: ProductConcept): Promise<boolean>;
  estimateUnitCost(product: ProductConcept): Promise<number | null>;
  createSellableProduct(product: ProductConcept): Promise<{ providerProductId: string }>;
}

export class MockOnDemandProvider implements ManufacturingProvider {
  id = "mock-on-demand";

  async canFulfill(product: ProductConcept) {
    return product.manufacturingTier === "ready";
  }

  async estimateUnitCost(product: ProductConcept) {
    return product.manufacturingTier === "ready" ? Math.max(8, product.price * 0.35) : null;
  }

  async createSellableProduct(product: ProductConcept) {
    if (!(await this.canFulfill(product))) throw new Error("Product is not automatically manufacturable.");
    return { providerProductId: `mock_${product.id}` };
  }
}
