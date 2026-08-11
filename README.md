# HH Goa 2026 — Frame & ID Card Generator

> Generate your **PFP Frame** or **Builder ID Card** for Hacker House Goa, 28–31 Oct 2026.  
> Built with Next.js 14, Tailwind CSS, HTML5 Canvas, and Vercel Blob.

---

## Features

- 🏖️ **PFP Frame** — Circular frame with arc text, palm art, गोवा badge
- 🪪 **Builder ID Card** — Full card with photo, name, role, auto-generated Builder Title
- 🖼️ HEIC photo support (converted client-side)
- ⬇️ Direct PNG download (no server round-trip)
- 𝕏 **Share on X** — uploads to Vercel Blob, creates a result page with OG image so X shows the actual graphic in the tweet preview
- 📱 Mobile-first, all tap targets ≥ 44px

---

## Setup

### 1. Clone / open project

```bash
cd hh-goa-26
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | [Vercel Dashboard](https://vercel.com) → Storage → Blob → Create store → copy token |

The app works fully **without** this env var for the download flow.  
Only the **Share on X** button requires it to upload the image.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard.

**Required env var in Vercel project settings:**
- `BLOB_READ_WRITE_TOKEN` — add under Settings → Environment Variables

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Image compositing | HTML5 Canvas API (no Fabric.js dependency) |
| HEIC conversion | `heic2any` (client-side, dynamic import) |
| Blob storage | `@vercel/blob` |
| OG image | Per-result page `/result/[id]` with dynamic metadata |
| Deploy | Vercel |

---

## Brand

Colors, typography and illustration style follow the official **2:47 PM Studio** HH Goa 2026 brand kit:

- Base green `#0F5C3F` · Yellow `#FFD93D` · Hot pink `#FF3399` · Mint `#8FC9A9`
- All canvas art (palms, sun, waves, beach shack) drawn programmatically — zero external image dependencies
