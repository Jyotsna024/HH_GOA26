"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { drawPFPFrame } from "@/lib/canvasPFP";
import { drawIDCard } from "@/lib/canvasIDCard";
import { isHEIC, convertHEICtoJPEG, loadImage } from "@/lib/heicConvert";
import { getBuilderTitle, getRandomVibe } from "@/lib/builderTitles";

type Mode = "pfp" | "idcard";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function Home() {
  const [mode, setMode] = useState<Mode>("pfp");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");
  const [builderTitle, setBuilderTitle] = useState("");
  const [vibe, setVibe] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [generated, setGenerated] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize randomized fields on mount
  useEffect(() => {
    setBuilderTitle("Cashew CEO");
    setVibe("Beach Driven Dev");
  }, []);

  // Update canvas instantly when any input changes
  const generateCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    setGenerated(false);
    
    // Draw canvas based on mode
    try {
      if (mode === "pfp") {
        drawPFPFrame({ canvas: canvasRef.current, image: imageObj, size: 1080 });
      } else {
        // Build combined role/team parameter
        const teamSuffix = team.trim() ? ` · ${team.trim()}` : " · solo";
        const combinedRole = `${role.trim() || "react · postgres · ships fast"}${teamSuffix}`;
        const combinedTitle = `${builderTitle.trim()} // ${vibe.trim()}`;

        drawIDCard({
          canvas: canvasRef.current,
          image: imageObj,
          name: name.trim() || "Alia Cabral",
          role: combinedRole,
          builderTitle: combinedTitle,
          width: 1080,
          height: 1350,
        });
      }
      setGenerated(true);
      setShareUrl("");
    } catch (e) {
      setError("Canvas rendering failed. Try another image.");
    }
  }, [imageObj, mode, name, role, team, builderTitle, vibe]);

  useEffect(() => {
    // Generate canvas both on initial mount (for placeholders) and state updates
    generateCanvas();
  }, [imageObj, mode, name, role, team, builderTitle, vibe, generateCanvas]);

  const processFile = useCallback(async (file: File) => {
    setError("");
    setIsLoading(true);
    setGenerated(false);
    setShareUrl("");

    try {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 15MB limit.");
        setIsLoading(false);
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];
      const isHeicFile = isHEIC(file);
      const isKnownType = allowedTypes.includes(file.type) || isHeicFile;

      if (!isKnownType) {
        setError("Unsupported file format. Please use JPG, PNG, or HEIC.");
        setIsLoading(false);
        return;
      }

      let processedFile = file;
      if (isHeicFile) {
        try {
          processedFile = await convertHEICtoJPEG(file);
        } catch {
          setError("HEIC image conversion failed. Try converting to JPG first.");
          setIsLoading(false);
          return;
        }
      }

      const img = await loadImage(processedFile);
      setImageFile(processedFile);
      setImageObj(img);
    } catch {
      setError("Failed to load image file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mode === "pfp" ? "hh-goa-2026-frame.png" : `hh-goa-2026-${name.replace(/\s+/g, "-") || "builder"}-id-card.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [mode, name]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsSharing(true);
    setError("");

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((b) => {
          if (b) resolve(b); else reject(new Error("Canvas to blob failed"));
        }, "image/png");
      });

      const formData = new FormData();
      formData.append("image", blob, "frame.png");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const { id, url: blobUrl } = await res.json();

      const params = new URLSearchParams({
        url: blobUrl,
        mode,
        ...(name ? { name } : {}),
      });
      const resultUrl = `${window.location.origin}/result/${id}?${params}`;
      setShareUrl(resultUrl);

      const tweetText = encodeURIComponent(
        `Just shipped my HH Goa 2026 custom credentials! 🌴🚀 Join us at the Hacker House, 28–31 Oct. #FrameInGoa`
      );
      const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(resultUrl)}`;
      window.open(tweetUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setError(e.message || "Sharing failed. Check your BLOB_READ_WRITE_TOKEN env var.");
    } finally {
      setIsSharing(false);
    }
  }, [mode, name]);

  const rollTitle = () => {
    setBuilderTitle(getBuilderTitle(role));
  };

  const rollVibe = () => {
    setVibe(getRandomVibe());
  };

  return (
    <div className="min-h-screen flex flex-col font-mono text-[#0A3D2A] bg-[#FCFBF7]">
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#FCFBF7] border-b border-[#0A3D2A]/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0F5C3F] text-white flex items-center justify-center font-bold text-xs border border-white/20">
            2:47
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-[#0A3D2A] uppercase">
            STUDIO
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-block font-mono text-xs font-black text-[#0A3D2A]/60 tracking-wider">
            CHECK HYPE
          </span>
          <a
            href="https://hhgoa2026.devfolio.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFD93D] text-[#0A3D2A] hover:bg-[#ffe366] px-5 py-2.5 rounded-full font-mono text-xs font-black tracking-wider transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1 border border-[#0A3D2A] shadow-sm"
          >
            APPLY <span className="text-[10px]">↗</span>
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-[#0F5C3F] text-white px-4 md:px-8 py-16 md:py-20 flex flex-col items-center text-center overflow-hidden">
        {/* Palm & Sun backdrop on right */}
        <div className="absolute right-6 bottom-4 w-44 pointer-events-none opacity-25 hidden md:block">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M50 100 Q60 60 55 20" stroke="#8FC9A9" strokeWidth="4" />
            <path d="M55 20 Q20 10 5 15" stroke="#8FC9A9" strokeWidth="2.5" />
            <path d="M55 20 Q75 10 95 18" stroke="#8FC9A9" strokeWidth="2.5" />
            <circle cx="20" cy="30" r="10" stroke="#FFD93D" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Eyebrow tag */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#FF3399]" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-[#8FC9A9] uppercase">
            SHORTLISTING TASK · TASK #1 · LIVE
          </span>
        </div>

        {/* Giant Serif Display Headline */}
        <div className="relative max-w-4xl mx-auto mb-6">
          <h1
            style={{
              color: "#FFD93D",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2.5rem, 8vw, 6.2rem)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-1px",
            }}
          >
            FRAME IN GOA
          </h1>
          {/* Goa pink badge overlay */}
          <div className="absolute -top-1 right-2 md:-right-10 transform rotate-6 scale-90 md:scale-105">
            <span className="bg-[#FF3399] text-white font-mono text-xs font-black px-4 py-2 rounded border-2 border-dashed border-white shadow-md">
              गोवा
            </span>
          </div>
        </div>

        {/* Subtext description with serif italics */}
        <p className="max-w-2xl text-base md:text-[18px] font-mono text-[#8FC9A9] mb-8 leading-relaxed max-w-xl">
          Upload a face. Get a badge. Post the hype. Earn your seat at Hacker House Goa — <span className="italic font-serif text-white">the beach residency for people who ship.</span>
        </p>

        {/* Horizontal tag pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-4 py-1.5 rounded-full border border-[#FFD93D]/30 font-mono text-[10px] font-bold text-[#FFD93D] tracking-widest uppercase">
            GOA · INDIA
          </span>
          <span className="px-4 py-1.5 rounded-full border border-[#FFD93D]/30 font-mono text-[10px] font-bold text-[#FFD93D] tracking-widest uppercase">
            28–31 OCT 2026
          </span>
          <span className="px-4 py-1.5 rounded-full bg-[#FFD93D] text-[#0A3D2A] font-mono text-[10px] font-black tracking-widest uppercase">
            EDITION 2026
          </span>
        </div>
      </section>

      {/* 3. Marquee Ticker Strip */}
      <div className="relative w-full overflow-hidden bg-[#052116] py-3.5 border-y border-[#0A3D2A]">
        <div className="flex whitespace-nowrap marquee-track font-mono text-[11px] font-black tracking-widest">
          {Array.from({ length: 4 }).map((_, loopIdx) => (
            <div key={loopIdx} className="inline-flex items-center">
              <span className="mx-6 text-[#FFD93D]">#FRAMEINGOA</span>
              <span className="text-[#FF3399] font-bold">✦</span>
              <span className="mx-6 text-white">2:47 PM STUDIO</span>
              <span className="text-[#FF3399] font-bold">✦</span>
              <span className="mx-6 text-[#8FC9A9]">247 BUILDERS · ONE HOUSE</span>
              <span className="text-[#FF3399] font-bold">✦</span>
              <span className="mx-6 text-[#FFD93D]">SUSEGAD MODE</span>
              <span className="text-[#FF3399] font-bold">✦</span>
              <span className="mx-6 text-white">GOA, INDIA</span>
              <span className="text-[#FF3399] font-bold">✦</span>
              <span className="mx-6 text-[#8FC9A9]">28–31 OCT</span>
              <span className="text-[#FF3399] font-bold">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Generator studio segment */}
      <section className="bg-[#FCFBF7] px-4 md:px-8 py-12 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column — Live Preview */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-4 w-full">
              <span className="font-mono text-xs font-black tracking-widest text-[#0A3D2A]/40 uppercase">
                // LIVE PREVIEW
              </span>

              {/* Mode switch */}
              <div className="flex bg-[#FCFBF7] border border-[#0A3D2A]/20 p-1 rounded-full w-fit">
                <button
                  onClick={() => setMode("pfp")}
                  className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-black tracking-widest transition-all ${
                    mode === "pfp" ? "bg-[#0F5C3F] text-[#FFD93D]" : "text-[#0A3D2A]/50"
                  }`}
                >
                  PFP FRAME
                </button>
                <button
                  onClick={() => setMode("idcard")}
                  className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-black tracking-widest transition-all ${
                    mode === "idcard" ? "bg-[#0F5C3F] text-[#FFD93D]" : "text-[#0A3D2A]/50"
                  }`}
                >
                  BUILDER ID
                </button>
              </div>
            </div>

            {/* Canvas Preview Wrapper Box */}
            <div className="relative w-full bg-[#0A3D2A] rounded-2xl p-6 border border-[#0A3D2A] flex flex-col justify-between mb-6 shadow-md">
              {/* Scaled label top-left */}
              <div className="text-[10px] font-mono text-[#8FC9A9]/60 tracking-widest mb-4">
                PREVIEW · SCALED · {mode === "pfp" ? "1080×1080" : "1080×1350"}
              </div>

              {/* Canvas element centered */}
              <div className="flex items-center justify-center w-full max-w-[480px] mx-auto overflow-hidden rounded-xl">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto block"
                  style={{ imageRendering: "auto" }}
                />
              </div>

              {/* Watermark bottom-right */}
              <div className="text-right text-[10px] font-mono text-[#8FC9A9]/60 tracking-widest mt-4">
                CTRL+SEA
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
              <button
                onClick={handleDownload}
                disabled={!generated}
                className="flex-1 bg-[#FFD93D] hover:bg-[#ffe366] text-[#0A3D2A] disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-full font-mono text-xs font-black tracking-widest transition-all transform hover:scale-[1.02] flex items-center justify-center gap-1.5 border border-[#0A3D2A] shadow-sm uppercase"
              >
                📥 DOWNLOAD
              </button>
              <button
                onClick={handleShare}
                disabled={!generated || isSharing}
                className="flex-1 bg-[#0A3D2A] hover:bg-[#13593f] text-white disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-full font-mono text-xs font-black tracking-widest transition-all transform hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md uppercase"
              >
                𝕏 SHARE TO X
              </button>
              <span className="text-[10px] font-mono text-[#0A3D2A]/60 whitespace-nowrap">
                → REMEMBER <span className="font-bold text-[#FF3399]">#FrameInGoa</span>
              </span>
            </div>
          </div>

          {/* Right Column — Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Upload Zone */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-[#0A3D2A] uppercase">
                // 01 · YOUR FACE
              </span>
              
              <div
                id="upload-zone"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer transition-all border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center ${
                  isDragging ? "bg-[#0A3D2A]/5 border-[#FFD93D]" : imageFile ? "bg-[#0F5C3F]/5 border-[#FF3399]" : "bg-[#FCFBF7] border-[#0A3D2A]/20 hover:border-[#0A3D2A]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
                  className="hidden"
                  onChange={handleFileInput}
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#0A3D2A]/20 border-t-[#0A3D2A] rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-[#0A3D2A] font-bold tracking-wider">CONVERTING IMAGE...</span>
                  </div>
                ) : imageFile ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-2xl text-[#FF3399]">✓</span>
                    <span className="text-[10px] font-mono font-bold text-[#0A3D2A]">{imageFile.name}</span>
                    <span className="text-[9px] font-mono text-[#0A3D2A]/40 uppercase tracking-wider">REPLACE PHOTO</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0F5C3F]/5 flex items-center justify-center text-lg">
                      🖼️
                    </div>
                    <p className="font-serif text-[18px] font-bold text-[#0A3D2A]">
                      drop a photo
                    </p>
                    <p className="text-[9px] font-mono text-[#0A3D2A]/40 uppercase tracking-widest">
                      JPG · PNG · HEIC (IPHONE OK)
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-[#FF3399]/10 border border-[#FF3399] rounded-xl p-3 text-[#FF3399] font-mono text-[10px] flex items-center gap-1.5">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {/* Form Fields - ID Card style controls */}
            {mode === "idcard" && (
              <div className="flex flex-col gap-3.5 border border-[#0A3D2A]/10 rounded-2xl p-5 bg-white shadow-sm">
                <span className="font-mono text-xs font-black tracking-widest text-[#0A3D2A] uppercase">
                  // 02 · THE FUN FIELDS
                </span>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-[#8FC9A9] tracking-wider uppercase">NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alia Cabral"
                    maxLength={25}
                    className="border border-[#0A3D2A]/15 bg-[#FCFBF7] rounded-xl px-4 py-2.5 font-mono text-xs text-[#0A3D2A] focus:outline-none focus:border-[#0A3D2A]"
                  />
                </div>

                {/* Stack/Role */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-[#8FC9A9] tracking-wider uppercase">STACK / ROLE</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="react · postgres · ships fast"
                    maxLength={35}
                    className="border border-[#0A3D2A]/15 bg-[#FCFBF7] rounded-xl px-4 py-2.5 font-mono text-xs text-[#0A3D2A] focus:outline-none focus:border-[#0A3D2A]"
                  />
                </div>

                {/* Team */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-[#8FC9A9] tracking-wider uppercase">TEAM</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="Team Susegad"
                    maxLength={20}
                    className="border border-[#0A3D2A]/15 bg-[#FCFBF7] rounded-xl px-4 py-2.5 font-mono text-xs text-[#0A3D2A] focus:outline-none focus:border-[#0A3D2A]"
                  />
                </div>

                {/* Builder Title */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono font-black text-[#8FC9A9] tracking-wider uppercase">BUILDER TITLE</label>
                    <button
                      onClick={rollTitle}
                      className="text-[#FF3399] font-mono text-[9px] font-black uppercase tracking-wider hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="1" fill="currentColor"/>
                        <circle cx="15" cy="15" r="1" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1" fill="currentColor"/>
                        <circle cx="9" cy="15" r="1" fill="currentColor"/>
                        <circle cx="15" cy="9" r="1" fill="currentColor"/>
                      </svg>
                      ROLL
                    </button>
                  </div>
                  <div className="bg-[#FFD93D] text-[#0A3D2A] rounded-xl px-4 py-2.5 font-mono text-xs font-black tracking-wide border border-[#0A3D2A]/20">
                    ★ {builderTitle}
                  </div>
                </div>

                {/* Vibe */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono font-black text-[#8FC9A9] tracking-wider uppercase">VIBE</label>
                    <button
                      onClick={rollVibe}
                      className="text-[#FF3399] font-mono text-[9px] font-black uppercase tracking-wider hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="1" fill="currentColor"/>
                        <circle cx="15" cy="15" r="1" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1" fill="currentColor"/>
                        <circle cx="9" cy="15" r="1" fill="currentColor"/>
                        <circle cx="15" cy="9" r="1" fill="currentColor"/>
                      </svg>
                      ROLL
                    </button>
                  </div>
                  <div className="bg-[#FF3399] text-white rounded-xl px-4 py-2.5 font-mono text-xs font-black tracking-wide border border-white/20 shadow-sm">
                    {vibe}
                  </div>
                </div>

              </div>
            )}

            {/* Tip Box */}
            <div className="bg-[#FFD93D]/15 border border-[#0A3D2A]/15 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[9px] font-black text-[#0A3D2A] uppercase tracking-widest">
                // TIP
              </span>
              <h4 className="font-serif text-[16px] font-bold text-[#0A3D2A] mb-1">
                Your face stays the star.
              </h4>
              <p className="font-mono text-[11px] text-[#0A3D2A]/80 leading-relaxed">
                We wrap it in a green Goa postcard. Portrait, landscape, weird crop — it all works. Swap the photo any time.
              </p>
            </div>

            {/* Fine Print Box */}
            <div className="bg-[#0A3D2A] text-white rounded-2xl p-5 flex flex-col gap-2">
              <span className="font-mono text-[9px] font-black text-[#FFD93D] uppercase tracking-widest">
                // FINE PRINT
              </span>
              <p className="font-mono text-[11px] text-[#8FC9A9] leading-relaxed">
                Your submission is invalid if the X post doesn't carry <span className="text-[#FFD93D] font-bold">#FrameInGoa</span>. One entry per team. Deadline: <span className="text-white font-bold">13 Aug 2026, 11:59 PM.</span>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Numbered Steps Strip */}
      <section className="bg-[#FCFBF7] border-t border-[#0A3D2A]/10 px-4 md:px-8 py-8 mt-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col gap-1 p-3 md:border-r border-[#0A3D2A]/10 last:border-0">
            <span className="font-mono text-base font-black text-[#FF3399]">
              01
            </span>
            <p className="font-mono text-[10px] text-[#0A3D2A]/60 uppercase tracking-widest">
              UPLOAD — jpg / png / heic
            </p>
          </div>

          <div className="flex flex-col gap-1 p-3 md:border-r border-[#0A3D2A]/10 last:border-0">
            <span className="font-mono text-base font-black text-[#FF3399]">
              02
            </span>
            <p className="font-mono text-[10px] text-[#0A3D2A]/60 uppercase tracking-widest">
              PICK — pfp or builder id
            </p>
          </div>

          <div className="flex flex-col gap-1 p-3 last:border-0">
            <span className="font-mono text-base font-black text-[#FF3399]">
              03
            </span>
            <p className="font-mono text-[10px] text-[#0A3D2A]/60 uppercase tracking-widest">
              POST — with #frameingoa
            </p>
          </div>

        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#FCFBF7] border-t border-[#0A3D2A]/10 px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left font-mono text-[10px] text-[#0A3D2A]/40 uppercase tracking-wider leading-relaxed">
          Built at 2:47 PM · unofficial fan tool · not affiliated with Hacker House
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] font-bold">
          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A3D2A] hover:text-[#FF3399] transition-colors uppercase"
          >
            HHGOA.COM ↗
          </a>
          <a
            href="https://x.com/247pmstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A3D2A] hover:text-[#FF3399] transition-colors uppercase"
          >
            247PM.STUDIO ↗
          </a>
        </div>
      </footer>

      <style jsx global>{`
        .marquee-track {
          display: inline-flex;
          animation: marquee-scroll 45s linear infinite;
          width: max-content;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
