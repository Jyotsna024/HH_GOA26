// ============================================================
// canvasIDCard.ts — Builder ID Card v4 (FULL REDESIGN) — HH Goa 2026
// Rebuilds the generated ID card to match the retro boarding pass aesthetic:
// - 1080x1350 vertical collectible format
// - Grid background with green gradient, offset layers, and riso grain
// - Top 15%: Technical metadata + large editorial visual headline: BUILDER IN GOA
// - Photo: Rounded irregular crop with cream border, pink accent shadow,
//   and Goa badge breaking the border
// - Huge Name (yellow serif), small role, team, and rolled title stickers
// - Hand-drawn Goa background world layered at low opacity for depth
// - Perforation dashed lines, notches, barcode, and ticket stub details
// ============================================================

export interface IDCardOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | null;
  name: string;
  role: string;
  builderTitle: string;
  width?: number;
  height?: number;
}

const GREEN      = "#0F5C3F";
const DEEP_GREEN = "#073B29";
const YELLOW     = "#FFD93D";
const PINK       = "#FF3399";
const CREAM      = "#FFF6DC";
const MINT       = "#8FC9A9";
const BLACK_GREEN= "#09271C";
const WHITE      = "#FFFFFF";
const DARK_GREEN = "#0A3D2A";

// ── Deterministic Seeded Random ──────────────────────────────
class SeededRandom {
  private seed: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    this.seed = Math.abs(hash) || 54321;
  }
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

// ── Riso & Noise Texture ─────────────────────────────────────
function drawRisoTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = CREAM;
  const step = 2.5;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const val = n - Math.floor(n);
      if (val > 0.65) {
        ctx.fillRect(x + (val - 0.5) * 1.5, y + (val - 0.5) * 1.5, 1.2, 1.2);
      }
    }
  }
  ctx.restore();
}

// ── Background Goa Illustration ──────────────────────────────
function drawSeadBackground(ctx: CanvasRenderingContext2D, w: number, h: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;

  // Sun
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(w - 180, 480, 120, 0, Math.PI * 2);
  ctx.fill();

  // Sun rays
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(w - 180 + Math.cos(angle) * 135, 480 + Math.sin(angle) * 135);
    ctx.lineTo(w - 180 + Math.cos(angle) * 165, 480 + Math.sin(angle) * 165);
    ctx.stroke();
  }

  // Palms (Left & Right background)
  ctx.strokeStyle = MINT;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  // Left palm
  ctx.beginPath();
  ctx.moveTo(100, h - 250);
  ctx.bezierCurveTo(150, h - 350, 80, h - 450, 140, h - 550);
  ctx.stroke();

  // Right palm
  ctx.beginPath();
  ctx.moveTo(w - 100, h - 250);
  ctx.bezierCurveTo(w - 150, h - 350, w - 80, h - 450, w - 140, h - 550);
  ctx.stroke();

  // Beach Shack
  ctx.fillStyle = DEEP_GREEN;
  ctx.strokeStyle = MINT;
  ctx.lineWidth = 3;
  ctx.fillRect(w - 280, h - 320, 80, 60);
  ctx.strokeRect(w - 280, h - 320, 80, 60);
  // Shack roof
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.moveTo(w - 300, h - 320);
  ctx.lineTo(w - 240, h - 365);
  ctx.lineTo(w - 180, h - 320);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawWaves(ctx: CanvasRenderingContext2D, y: number, w: number, h: number) {
  ctx.save();
  const waveLayers = [
    { color: DEEP_GREEN, hOffset: 0, amp: 14, freq: 0.005 },
    { color: GREEN, hOffset: 60, amp: 10, freq: 0.007 },
    { color: MINT, hOffset: 140, amp: 7, freq: 0.009, alpha: 0.4 }
  ];

  for (const layer of waveLayers) {
    ctx.fillStyle = layer.color;
    if (layer.alpha) ctx.globalAlpha = layer.alpha;
    ctx.beginPath();
    ctx.moveTo(0, y + h);
    for (let x = 0; x <= w; x += 10) {
      const waveY = y + Math.sin(x * layer.freq + layer.hOffset) * layer.amp;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();
}

// Draw Goa Devanagari badge
function drawGoaBadge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 8);
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 6);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = WHITE;
  ctx.font = "bold 26px 'Noto Sans Devanagari', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("गोवा", 0, 2);
  ctx.restore();
}

// Draw large collectible sticker badges (~2-3x size)
function drawStickerBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, type: string, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Bigger font for measurement
  ctx.font = "900 30px 'Courier New', monospace";
  const tw = ctx.measureText(text.toUpperCase()).width;
  const bw = tw + 52;   // generous horizontal padding
  const bh = 72;        // tall badge
  const br = bh / 2;    // fully-rounded pill

  // Drop shadow (print offset style)
  ctx.shadowColor = "rgba(0, 0, 0, 0.32)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  if (type === "yellow_seal") {
    // Slightly imperfect border: dark green inset stroke
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, br);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = DARK_GREEN;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.roundRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10, br - 3);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = DARK_GREEN;
    ctx.font = "900 30px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), 0, 1);
  } else {
    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, br);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.roundRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10, br - 3);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = WHITE;
    ctx.font = "900 30px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), 0, 1);
  }

  ctx.restore();
}

// ── Main ID Card Generator Rebuilt ──────────────────────────

export function drawIDCard(options: IDCardOptions): void {
  const { canvas, image, name, role, builderTitle, width = 1080, height = 1350 } = options;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const seed = new SeededRandom(name || "BUILDER_ID_SEED");

  // 1. Background Fill & Grid
  ctx.fillStyle = DEEP_GREEN;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = BLACK_GREEN;
  ctx.lineWidth = 1.5;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // 2. Faint Layered Goa Scene
  drawSeadBackground(ctx, width, height, 0.22);

  // Bottom ocean waves
  drawWaves(ctx, height - 340, width, 340);

  // 3. Top 15% - Boarding Pass Header
  ctx.save();
  ctx.fillStyle = CREAM;
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.textBaseline = "middle";

  // Left
  ctx.textAlign = "left";
  ctx.fillText("HACKER HOUSE · GOA 2026", 60, 60);

  // Middle (Serial)
  const passSerial = `PASS NO. ${String(Math.abs(name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 1000 + 100).padStart(4, "0")}`;
  ctx.textAlign = "center";
  ctx.fillText(passSerial, width / 2, 60);

  // Right
  ctx.textAlign = "right";
  ctx.fillText("EDITION 2026", width - 60, 60);
  ctx.restore();

  // Large Visual Editorial Title
  ctx.save();
  ctx.fillStyle = YELLOW;
  ctx.font = "900 100px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("BUILDER IN GOA", width / 2, 100);
  ctx.restore();

  // 4. Rounded Portrait Photo Slot (~43% card height = 580px)
  const photoW = 860;
  const photoH = 580;   // increased from 500 → more room to show full head
  const photoX = (width - photoW) / 2;
  const photoY = 230;
  const photoR = 16;

  // Print offset layer shadow
  ctx.save();
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.roundRect(photoX + 8, photoY + 8, photoW, photoH, photoR);
  ctx.fill();
  ctx.restore();

  // Actual photo frame
  if (image) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.clip();

    const srcW = image.naturalWidth;
    const srcH = image.naturalHeight;
    const aspect = photoW / photoH;
    const srcAspect = srcW / srcH;

    let cropW: number;
    let cropH: number;
    let cropX: number;
    let cropY: number;

    if (srcAspect > aspect) {
      // Source is wider than destination → crop sides, keep full height
      cropH = srcH;
      cropW = srcH * aspect;
      cropX = (srcW - cropW) / 2; // center horizontally
      cropY = 0;                  // start from top — preserve head
    } else {
      // Source is taller than destination (portrait) → crop bottom
      cropW = srcW;
      cropH = srcW / aspect;
      cropX = 0;
      // Bias to top: show top 75% of the crop window instead of center.
      // This ensures the head/hair is always visible.
      const maxCropY = srcH - cropH;
      cropY = maxCropY * 0.20; // 20% down from top — face-biased, not geometric center
    }

    ctx.drawImage(image, cropX, cropY, cropW, cropH, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Cream border
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.stroke();
  } else {
    // Empty state placeholder
    ctx.save();
    ctx.fillStyle = BLACK_GREEN;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.fill();

    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.stroke();

    ctx.fillStyle = YELLOW;
    ctx.font = "bold 38px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("upload a photo", width / 2, photoY + photoH / 2);
    ctx.restore();
  }

  // Tilted Goa badge at bottom-right corner of photo, breaking the border
  drawGoaBadge(ctx, photoX + photoW - 20, photoY + photoH - 20, 110, 48, 0.08);

  // 5. Identity Details Stack
  // Photo ends at photoY + photoH. Gap of 28px before Name.
  let currentY = photoY + photoH + 28;

  // ── NAME ─────────────────────────────────────────────────────
  ctx.save();
  ctx.fillStyle = YELLOW;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = BLACK_GREEN;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  let displayName = (name || "Alia Cabral").toUpperCase();
  // Start at 80px; shrink if too wide
  let nameFontSize = 80;
  ctx.font = `900 ${nameFontSize}px Georgia, 'Times New Roman', serif`;
  while (ctx.measureText(displayName).width > photoW - 20 && nameFontSize > 32) {
    nameFontSize -= 4;
    ctx.font = `900 ${nameFontSize}px Georgia, 'Times New Roman', serif`;
  }
  ctx.fillText(displayName, photoX + 10, currentY);
  ctx.restore();

  currentY += nameFontSize + 20; // name height + gap before next section

  // ── STACK / ROLE ─────────────────────────────────────────────
  ctx.save();
  // Label
  ctx.fillStyle = MINT;
  ctx.font = "bold 17px 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("// STACK / ROLE", photoX + 10, currentY);
  currentY += 26;

  // Value — large & uppercase
  ctx.fillStyle = WHITE;
  ctx.font = "bold 40px 'Courier New', monospace";
  ctx.letterSpacing = "1px";
  const roleDisplay = (role || "react · postgres · ships fast").toUpperCase();
  // Auto-shrink if too wide
  let roleFontSize = 40;
  ctx.font = `bold ${roleFontSize}px 'Courier New', monospace`;
  while (ctx.measureText(roleDisplay).width > photoW - 20 && roleFontSize > 20) {
    roleFontSize -= 2;
    ctx.font = `bold ${roleFontSize}px 'Courier New', monospace`;
  }
  ctx.fillText(roleDisplay, photoX + 10, currentY);
  currentY += roleFontSize + 24;
  ctx.restore();

  // ── TEAM ─────────────────────────────────────────────────────
  ctx.save();
  // Label
  ctx.fillStyle = MINT;
  ctx.font = "bold 17px 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("// TEAM", photoX + 10, currentY);
  currentY += 26;

  // Extract team value
  let teamVal = "SOLO";
  if (role.includes("·")) {
    const parts = role.split("·");
    teamVal = (parts[1]?.trim() || "SOLO").toUpperCase();
  }
  // Value — large & uppercase
  ctx.fillStyle = WHITE;
  ctx.font = "bold 40px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(teamVal, photoX + 10, currentY);
  currentY += 40 + 12; // tighter gap so stickers clear perf line
  ctx.restore();

  // ── STICKER BADGES (Builder Title + Vibe) ────────────────────
  // Split builderTitle into title // vibe
  let mainTitle = builderTitle || "Cashew CEO";
  let mainVibe = "Beach Driven Dev";
  if (builderTitle && builderTitle.includes("//")) {
    const parts = builderTitle.split("//");
    mainTitle = parts[0].trim();
    mainVibe = parts[1]?.trim() || "Beach Driven Dev";
  }

  // Builder Title sticker (yellow pill)
  const titleStickerX = photoX + 180;
  const titleStickerY = currentY + 36; // centre of badge = currentY + half-badge-height
  drawStickerBadge(ctx, titleStickerX, titleStickerY, `★ ${mainTitle}`, "yellow_seal", seed.range(-0.08, 0.08));

  // Vibe sticker (pink pill) — aligned on same baseline
  const vibeStickerX = photoX + photoW - 200;
  drawStickerBadge(ctx, vibeStickerX, titleStickerY, mainVibe, "pink_badge", seed.range(-0.08, 0.08));

  currentY += 72 + 20; // badge height + gap

  // Decorative SUSEGAD stamp floating above photo top-right
  drawStickerBadge(ctx, photoX + photoW - 110, photoY - 36, "SUSEGAD MODE", "yellow_seal", seed.range(-0.1, 0.1));

  // 7. Ticket perforation and cut-out notches
  const perfY = height - 165;
  ctx.save();
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(0, perfY);
  ctx.lineTo(width, perfY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Notches
  ctx.fillStyle = DEEP_GREEN;
  ctx.beginPath();
  ctx.arc(0, perfY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width, perfY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 8. Bottom Stub barcode and dates
  const stubY = perfY + 45;

  // Drawn barcode
  ctx.save();
  ctx.fillStyle = YELLOW;
  let curX = 60;
  const bars = [35, 20, 35, 12, 28, 35, 15, 25, 35, 18, 12, 35, 10, 28, 35, 18, 35];
  for (const b of bars) {
    ctx.fillRect(curX, stubY, 4, b);
    curX += 8;
  }
  ctx.restore();

  // Date and location info
  ctx.save();
  ctx.fillStyle = YELLOW;
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.textAlign = "right";

  ctx.fillText("28—31 OCT 2026", width - 60, stubY + 12);
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("GOA - INDIA  ·  GEN 00247", width - 60, stubY + 34);
  ctx.restore();

  // Watermark
  ctx.save();
  ctx.fillStyle = YELLOW;
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.letterSpacing = "3px";
  ctx.textAlign = "right";
  ctx.fillText("CTRL+SEA", width - 60, height - 35);
  ctx.restore();

  // Riso grain overlay
  drawRisoTexture(ctx, width, height);
}
