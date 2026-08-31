"use client";

import { useEffect, useMemo, useState } from "react";
import type { GenerateResult, StoreBlock, StoreState } from "@/lib/types";

const STARTER = "Make me a weird little tennis brand inspired by 1980s country clubs and Japanese convenience stores.";

export default function Studio() {
  const [store, setStore] = useState<StoreState | null>(null);
  const [prompt, setPrompt] = useState(STARTER);
  const [message, setMessage] = useState("Describe the world you want to make.");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("store-lab-state");
    if (saved) setStore(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (store) window.localStorage.setItem("store-lab-state", JSON.stringify(store));
  }, [store]);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, currentStore: store }),
      });
      const data = (await res.json()) as GenerateResult;
      setStore(data.store);
      setMessage(data.message);
      setPrompt("");
    } finally {
      setLoading(false);
    }
  }

  function moveBlock(id: string, x: number, y: number) {
    if (!store) return;
    setStore({
      ...store,
      blocks: store.blocks.map((block) => block.id === id ? { ...block, x: Math.max(0, Math.min(88, x)), y: Math.max(0, Math.min(88, y)) } : block),
    });
  }

  function publish() {
    if (!store) return;
    const publishedStore = { ...store, published: true };
    setStore(publishedStore);
    window.localStorage.setItem("store-lab-state", JSON.stringify(publishedStore));
    setMessage(`Published locally at /s/${store.slug}. Real checkout comes next.`);
    window.open(`/s/${store.slug}`, "_blank", "noopener,noreferrer");
  }

  function reset() {
    window.localStorage.removeItem("store-lab-state");
    setStore(null);
    setPrompt(STARTER);
    setMessage("Describe the world you want to make.");
  }

  return (
    <main className="app-shell">
      <aside className="left-rail">
        <div>
          <div className="eyebrow">STORE LAB / 0.1</div>
          <h1>{store?.brandName ?? "MAKE A WORLD"}</h1>
          <p className="muted">Idea → product → storefront → publish.</p>
        </div>

        <section className="panel">
          <div className="panel-label">AI creative director</div>
          <p className="assistant-message">{message}</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
            }}
            placeholder="Make me a hat that says…"
          />
          <button className="primary" onClick={generate} disabled={loading}>{loading ? "Making…" : store ? "Change the world" : "Make my store"}</button>
          <div className="hint">⌘ + Enter to send</div>
        </section>

        {store && (
          <section className="panel compact">
            <div className="panel-label">Product lab</div>
            <div className="stats">
              <span>{store.products.length} products</span>
              <span>{store.blocks.length} canvas objects</span>
            </div>
            <div className="product-list">
              {store.products.map((product) => (
                <div className="mini-product" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.category} · ${product.price}</small>
                  </div>
                  <span className={`status ${product.manufacturingTier}`}>{product.badge}</span>
                </div>
              ))}
              {!store.products.length && <p className="muted small">Ask the AI to make your first physical product.</p>}
            </div>
          </section>
        )}

        <div className="rail-actions">
          <button className="ghost" onClick={reset}>Reset</button>
          <button className="publish" onClick={publish} disabled={!store}>{store?.published ? "Published ✓" : "Publish"}</button>
        </div>
      </aside>

      <section className="workspace">
        {!store ? <EmptyCanvas /> : <StoreCanvas store={store} dragging={dragging} setDragging={setDragging} moveBlock={moveBlock} />}
      </section>
    </main>
  );
}

function EmptyCanvas() {
  return (
    <div className="empty-canvas">
      <div className="asterisk">✳</div>
      <h2>Your store appears here.</h2>
      <p>Start with a sentence. You can be specific, strange, or both.</p>
      <div className="examples">“A brutalist gardening store” · “Luxury merch for accountants” · “A surf brand from Mars”</div>
    </div>
  );
}

function StoreCanvas({ store, dragging, setDragging, moveBlock }: {
  store: StoreState;
  dragging: string | null;
  setDragging: (id: string | null) => void;
  moveBlock: (id: string, x: number, y: number) => void;
}) {
  const products = useMemo(() => new Map(store.products.map((p) => [p.id, p])), [store.products]);

  return (
    <div
      className="store-canvas"
      style={{ background: store.background, color: store.foreground }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        if (!dragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        moveBlock(dragging, ((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
        setDragging(null);
      }}
    >
      <div className="store-topbar">
        <span>{store.brandName}</span>
        <span>SHOP · ABOUT · CART (0)</span>
      </div>
      {store.blocks.map((block) => (
        <CanvasBlock key={block.id} block={block} accent={store.accent} product={block.productId ? products.get(block.productId) : undefined} onDrag={() => setDragging(block.id)} />
      ))}
      <div className="canvas-footer">DRAG ANYTHING · THEN TELL THE AI WHAT TO CHANGE</div>
    </div>
  );
}

function CanvasBlock({ block, accent, product, onDrag }: { block: StoreBlock; accent: string; product?: StoreState["products"][number]; onDrag: () => void }) {
  return (
    <div
      className={`canvas-block ${block.type}`}
      draggable
      onDragStart={onDrag}
      style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.width}%`, transform: `rotate(${block.rotation ?? 0}deg)`, ...(block.type === "sticker" ? { background: accent } : {}) }}
    >
      {block.type === "product" && product ? (
        <>
          <div className="product-art" style={{ background: accent }}><span>{product.category}</span></div>
          <div className="product-meta"><strong>{product.name}</strong><span>${product.price}</span></div>
        </>
      ) : block.content}
    </div>
  );
}
