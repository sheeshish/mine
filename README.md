# Store Lab MVP

A deliberately narrow first version of the idea: **imagine a brand → create physical product concepts → arrange them on a playful store canvas → publish**.

## What is already wired

- AI-prompt-first store creation
- Optional real OpenAI Responses API call
- Deterministic local fallback, so the demo runs without an API key
- Persistent store state in localStorage
- Freeform-ish draggable storefront blocks
- Product concept creation from natural-language prompts
- Manufacturing classification: `ready`, `configurable`, or `custom`
- Provider abstraction for manufacturing
- Mock publish state
- Responsive creator workspace

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

If `OPENAI_API_KEY` is blank, prompts still work through the local deterministic generator. Add an API key to use the model route.

## Suggested first prompts

1. `Make me a weird little tennis brand inspired by 1980s country clubs and Japanese convenience stores.`
2. `Make me a cream hat that says “LOGGING HOURS” in tiny serif lettering.`
3. `Make the whole site black.`
4. `Make me a chrome toaster shaped like a frog.`

The hat will route to the MVP-ready manufacturing tier; the toaster remains a custom manufacturing concept.

## Architecture

```text
Creator UI
  ├── Prompt / AI creative director
  ├── Store canvas
  └── Product lab
        │
        ▼
/api/generate
  ├── OpenAI Responses API (optional)
  └── local fallback generator
        │
        ▼
StoreState JSON
  ├── Brand
  ├── Canvas blocks
  └── Product concepts
        │
        ▼
ManufacturingProvider interface
  └── MockOnDemandProvider today
      ├── Print-on-demand adapter later
      ├── Configurable supplier adapter later
      └── Custom sourcing workflow later
```

## What I would build next

1. **Database + auth** — move StoreState from localStorage to Postgres; add creator accounts.
2. **Real image generation** — every generated product gets a visual asset and printable production asset.
3. **Structured AI actions** — replace whole-state JSON generation with explicit tools such as `create_product`, `move_block`, `change_theme`, and `publish_store`.
4. **Manufacturing adapter #1** — integrate one print-on-demand provider for hats, tees, hoodies, totes and posters.
5. **Real checkout** — Stripe Checkout initially, then Stripe Connect when creators need payouts.
6. **Public storefront route** — `/s/[slug]` rendered from the same StoreState.
7. **Voice** — voice input should submit to the same prompt/action pipeline rather than creating a parallel product architecture.

## Important MVP rule

Do not make arbitrary manufacturing a launch dependency. Let any concept exist, but only products classified as `ready` can become automatically sellable in V1.
