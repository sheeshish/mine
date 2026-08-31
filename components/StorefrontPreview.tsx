"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { StoreState } from "@/lib/types";

export default function StorefrontPreview({ slug }: { slug: string }) {
  const [store, setStore] = useState<StoreState | null | undefined>(undefined);

  useEffect(() => {
    const raw = window.localStorage.getItem("store-lab-state");
    if (!raw) return setStore(null);
    const parsed = JSON.parse(raw) as StoreState;
    setStore(parsed.slug === slug ? parsed : null);
  }, [slug]);

  const products = useMemo(() => new Map(store?.products.map((p) => [p.id, p]) ?? []), [store]);

  if (store === undefined) return <main className="public-loading">Opening store…</main>;
  if (!store) {
    return (
      <main className="public-loading">
        <h1>Store not found on this browser.</h1>
        <p>This MVP stores creator data locally until the database milestone.</p>
        <Link href="/">Back to Studio</Link>
      </main>
    );
  }

  return (
    <main className="public-store" style={{ background: store.background, color: store.foreground }}>
      <nav className="public-nav">
        <strong>{store.brandName}</strong>
        <span>SHOP · ABOUT · CART (0)</span>
      </nav>

      <section className="public-hero">
        <div className="public-kicker">AN INTERNET STORE FROM SOMEONE'S BRAIN</div>
        <h1>{store.brandName}</h1>
        <p>{store.tagline}</p>
      </section>

      <section className="public-grid">
        {store.products.map((product) => (
          <article className="public-product" key={product.id}>
            <div className="public-art" style={{ background: store.accent }}>{product.category}</div>
            <div className="public-product-row"><strong>{product.name}</strong><span>${product.price}</span></div>
            <p>{product.description}</p>
            <button disabled={product.manufacturingTier !== "ready"}>
              {product.manufacturingTier === "ready" ? "Add to cart" : product.badge}
            </button>
          </article>
        ))}
        {!store.products.length && <p>No products yet. The creator is still cooking.</p>}
      </section>

      <footer className="public-footer">
        <span>{store.brandName}</span>
        <Link href="/">Edit in Studio ↗</Link>
      </footer>
    </main>
  );
}
