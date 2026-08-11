import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HH Goa 2026 — Frame & ID Card Generator",
  description:
    "Create your HH Goa 2026 PFP frame or Builder ID Card instantly. Hacker House Goa, 28–31 Oct 2026. #FrameInGoa",
  openGraph: {
    title: "HH Goa 2026 — Frame & ID Card Generator",
    description: "Create your HH Goa 2026 PFP frame or Builder ID Card instantly.",
    siteName: "HH Goa 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Frame & ID Card Generator",
    description: "Create your HH Goa 2026 PFP frame or Builder ID Card instantly. #FrameInGoa",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
