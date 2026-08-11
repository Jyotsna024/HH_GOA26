import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
    }

    // Generate a unique ID
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const filename = `hh-goa-26/${id}.png`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: "image/png",
    });

    return NextResponse.json({ id, url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Check BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}
