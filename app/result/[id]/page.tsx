import { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: { id: string };
  searchParams: { url?: string; mode?: string; name?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const imageUrl = searchParams.url ?? "";
  const mode = searchParams.mode ?? "pfp";
  const name = searchParams.name ?? "a Builder";

  const title =
    mode === "idcard"
      ? `${name}'s HH Goa 2026 Builder ID Card`
      : "HH Goa 2026 Frame";
  const description = `Check out this HH Goa 2026 ${mode === "idcard" ? "Builder ID Card" : "PFP Frame"} — Hacker House Goa, 28–31 Oct 2026!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 800, height: mode === "idcard" ? 1200 : 800, alt: title }]
        : [],
      siteName: "HH Goa 2026",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function ResultPage({ params, searchParams }: Props) {
  const imageUrl = searchParams.url ?? "";
  const mode = searchParams.mode ?? "pfp";
  const name = searchParams.name ?? "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F5C3F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "monospace",
      }}
    >
      <h1
        style={{
          color: "#FFD93D",
          fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
          fontWeight: 900,
          textAlign: "center",
          marginBottom: "8px",
          textShadow: "3px 3px 0 #0A3D2A",
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          letterSpacing: "2px",
        }}
      >
        HH GOA 2026
      </h1>

      <p style={{ color: "#8FC9A9", marginBottom: "24px", fontSize: "0.85rem", letterSpacing: "2px" }}>
        {mode === "idcard" ? `${name ? name.toUpperCase() + "'S " : ""}BUILDER ID CARD` : "PFP FRAME"}
      </p>

      {imageUrl ? (
        <div
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(255,51,153,0.4)",
            maxWidth: "min(500px, 90vw)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`HH Goa 2026 ${mode === "idcard" ? "ID Card" : "Frame"}`}
            style={{ width: "100%", display: "block" }}
          />
        </div>
      ) : (
        <div style={{ color: "#8FC9A9", padding: "40px" }}>Image not found.</div>
      )}

      <div style={{ marginTop: "32px", display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        {imageUrl && (
          <a
            href={imageUrl}
            download="hh-goa-2026.png"
            style={{
              background: "#FFD93D",
              color: "#0F5C3F",
              padding: "12px 28px",
              borderRadius: "999px",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.9rem",
              letterSpacing: "1px",
            }}
          >
            ↓ DOWNLOAD
          </a>
        )}
        <Link
          href="/"
          style={{
            background: "transparent",
            color: "#FFD93D",
            padding: "12px 28px",
            borderRadius: "999px",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "0.9rem",
            border: "2px solid #FFD93D",
            letterSpacing: "1px",
          }}
        >
          ← MAKE YOUR OWN
        </Link>
      </div>

      <p
        style={{
          color: "#8FC9A9",
          fontSize: "0.72rem",
          marginTop: "32px",
          opacity: 0.6,
          letterSpacing: "2px",
        }}
      >
        2:47 PM STUDIO · HH GOA 2026
      </p>
    </div>
  );
}
