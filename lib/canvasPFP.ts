// ============================================================
// canvasPFP.ts — PFP Frame v4 (FULL REDESIGN) — HH Goa 2026
// Rebuilds the generated PFP to match the official poster aesthetic:
// - 1080x1080 square canvas
// - Deep Goa green background with riso grain
// - Rich illustrated Goa world: large sunset, waves, palm trees, beach hut, surfboards, stars
// - Curated stickers (3-5 selectively placed with offsets/rotations)
// - Center circular user photo with multi-layered decorative rings (cream, pink, yellow, dots, ticks)
// - Top arched "HACKER HOUSE GOA" with generous spacing
// - Bottom ticket stub containing barcode, serial number, and "28—31 OCT 2026 // GOA, INDIA"
// ============================================================

export interface PFPOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | null;
  size?: number;
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
    this.seed = Math.abs(hash) || 12345;
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

// ── Programmatic Illustration Drawings ──────────────────────

function drawRisoTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = CREAM;
  const step = 2.5;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      // Deterministic noise
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const val = n - Math.floor(n);
      if (val > 0.65) {
        ctx.fillRect(x + (val - 0.5) * 1.5, y + (val - 0.5) * 1.5, 1.2, 1.2);
      }
    }
  }
  ctx.restore();
}

function drawSunset(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  // Large yellow sunset circle
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Sun rays
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 3.5;
  ctx.globalAlpha = 0.6;
  const rayCount = 18;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const startDist = r + 8;
    const endDist = r + 36;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * startDist, cy + Math.sin(angle) * startDist);
    ctx.lineTo(cx + Math.cos(angle) * endDist, cy + Math.sin(angle) * endDist);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaves(ctx: CanvasRenderingContext2D, y: number, w: number, h: number) {
  ctx.save();
  // Overlapping wave layers
  const waveLayers = [
    { color: DEEP_GREEN, hOffset: 0, amp: 16, freq: 0.005 },
    { color: GREEN, hOffset: 50, amp: 12, freq: 0.007 },
    { color: MINT, hOffset: 120, amp: 8, freq: 0.009, alpha: 0.5 }
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

function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, flip = false, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (flip) ctx.scale(-1, 1);

  // Trunk - thick hand-drawn outline
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 7 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(20 * scale, -60 * scale, -10 * scale, -130 * scale, 15 * scale, -220 * scale);
  ctx.stroke();

  // Fronds / Leaves
  ctx.lineWidth = 4.5 * scale;
  const leaves = [
    [15, -220, -35, -240, -80, -200],
    [15, -220, -10, -265, -45, -270],
    [15, -220, 45, -265, 80, -240],
    [15, -220, 60, -220, 95, -180],
    [15, -220, 20, -190, 45, -150]
  ];
  for (const [sx, sy, cx, cy, ex, ey] of leaves) {
    ctx.beginPath();
    ctx.moveTo(sx * scale, sy * scale);
    ctx.quadraticCurveTo(cx * scale, cy * scale, ex * scale, ey * scale);
    ctx.stroke();

    // Leaf details (individual spikes)
    ctx.save();
    ctx.lineWidth = 2 * scale;
    for (let t = 0.2; t <= 1.0; t += 0.2) {
      const px = sx + (ex - sx) * t;
      const py = sy + (ey - sy) * t;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 10 * scale, py + 15 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawBeachUmbrella(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";

  // Stick
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10 * scale, -70 * scale);
  ctx.stroke();

  // Top cap
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.arc(-10 * scale, -70 * scale, 32 * scale, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Stripes on umbrella
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.moveTo(-10 * scale, -70 * scale);
  ctx.arc(-10 * scale, -70 * scale, 32 * scale, -Math.PI * 0.7, -Math.PI * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawSurfboard(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 3.5;
  ctx.fillStyle = YELLOW;

  // Board outline
  ctx.beginPath();
  ctx.moveTo(0, -60 * scale);
  ctx.quadraticCurveTo(18 * scale, -10 * scale, 12 * scale, 60 * scale);
  ctx.quadraticCurveTo(0, 75 * scale, -12 * scale, 60 * scale);
  ctx.quadraticCurveTo(-18 * scale, -10 * scale, 0, -60 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Stripe
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.moveTo(0, -60 * scale);
  ctx.quadraticCurveTo(4 * scale, -10 * scale, 3 * scale, 60 * scale);
  ctx.lineTo(-3 * scale, 60 * scale);
  ctx.quadraticCurveTo(-4 * scale, -10 * scale, 0, -60 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBeachShack(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 4 * scale;
  ctx.fillStyle = DEEP_GREEN;

  // Walls
  ctx.fillRect(-30 * scale, 0, 60 * scale, 50 * scale);
  ctx.strokeRect(-30 * scale, 0, 60 * scale, 50 * scale);

  // Roof
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.moveTo(-40 * scale, 0);
  ctx.lineTo(0, -35 * scale);
  ctx.lineTo(40 * scale, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Door
  ctx.fillStyle = PINK;
  ctx.fillRect(-10 * scale, 15 * scale, 20 * scale, 35 * scale);
  ctx.strokeRect(-10 * scale, 15 * scale, 20 * scale, 35 * scale);

  ctx.restore();
}

function drawSparkles(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.fillStyle = YELLOW;
  ctx.translate(x, y);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4 * scale, 4 * scale, 0, 12 * scale);
    ctx.quadraticCurveTo(-4 * scale, 4 * scale, 0, 0);
    ctx.fill();
  }
  ctx.restore();
}

// ── Designer Sticker Drawing Library ─────────────────────────

function drawStickerBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, type: string, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  ctx.font = "900 13px 'Courier New', monospace";
  const tw = ctx.measureText(text.toUpperCase()).width;

  if (type === "postage") {
    // Stamp border (perforated rectangle)
    const sw = tw + 24;
    const sh = 38;
    ctx.fillStyle = CREAM;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // Mini outline
    ctx.strokeStyle = PINK;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-sw / 2 + 3, -sh / 2 + 3, sw - 6, sh - 6);

    ctx.fillStyle = PINK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), 0, 0);
  } 
  else if (type === "seal") {
    // Circular scalloped seal
    const r = Math.max(tw / 2 + 10, 24);
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = DARK_GREEN;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = DARK_GREEN;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 10px 'Courier New', monospace";
    ctx.fillText(text.toUpperCase(), 0, 0);
  }
  else if (type === "starburst") {
    // Starburst badge
    const points = 16;
    const outerR = Math.max(tw / 2 + 12, 28);
    const innerR = outerR - 6;
    ctx.fillStyle = PINK;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? outerR : innerR;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 10px 'Courier New', monospace";
    ctx.fillText(text.toUpperCase(), 0, 0);
  }
  else if (type === "torn") {
    // Rough torn tape badge
    const sw = tw + 20;
    const sh = 32;
    ctx.fillStyle = MINT;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    ctx.strokeStyle = BLACK_GREEN;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Squiggly torn left/right edges
    ctx.moveTo(-sw / 2, -sh / 2);
    for (let i = -sh / 2; i <= sh / 2; i += 4) {
      ctx.lineTo(-sw / 2 + Math.sin(i * 2) * 2, i);
    }
    ctx.lineTo(sw / 2, sh / 2);
    for (let i = sh / 2; i >= -sh / 2; i -= 4) {
      ctx.lineTo(sw / 2 + Math.sin(i * 2) * 2, i);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BLACK_GREEN;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), 0, 0);
  }

  ctx.restore();
}

// Draw arched text
function drawArchedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  font: string,
  color: string
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars = text.split("");
  const totalAngle = endAngle - startAngle;
  const angleStep = totalAngle / (chars.length - 1);

  for (let i = 0; i < chars.length; i++) {
    const angle = startAngle + i * angleStep;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ── Main PFP Generator Rebuilt ──────────────────────────────

export function drawPFPFrame(options: PFPOptions): void {
  const { canvas, image, size = 1080 } = options;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;

  // Set seed based on image state or constant to avoid layout jump
  const seed = new SeededRandom("PFP_GOA_2026_SEED");

  // 1. Solid Deep Green base background
  ctx.fillStyle = DEEP_GREEN;
  ctx.fillRect(0, 0, size, size);

  // Background Grid Lines
  ctx.strokeStyle = BLACK_GREEN;
  ctx.lineWidth = 1;
  for (let x = 0; x < size; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
  }
  for (let y = 0; y < size; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
  }

  // 2. Large yellow sunset (placed slightly offset upwards)
  drawSunset(ctx, cx, cy - 80, 240);

  // 3. Middleground ocean waves (bottom section)
  drawWaves(ctx, cy + 180, size, 400);

  // 4. Foreground line art Goa world
  // Left palm tree
  drawPalmTree(ctx, 40, cy + 300, 1.2, false, -0.05);
  // Right palm tree
  drawPalmTree(ctx, size - 40, cy + 300, 1.2, true, 0.05);
  // Beach shack on lower left
  drawBeachShack(ctx, 160, cy + 240, 1.1);
  // Beach umbrella on lower right
  drawBeachUmbrella(ctx, size - 200, cy + 260, 1.2);
  // Surfboards
  drawSurfboard(ctx, 250, cy + 280, 0.9, -0.15);
  drawSurfboard(ctx, size - 280, cy + 275, 0.9, 0.1);
  // Sparkles/stars
  drawSparkles(ctx, 220, cy - 280, 1.2);
  drawSparkles(ctx, size - 220, cy - 250, 1.0);
  drawSparkles(ctx, cx - 350, cy + 50, 0.8);

  // 5. Center circular user photo slot
  const photoR = 260; // 520px diameter

  // Outer ring ticks
  ctx.save();
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 2.5;
  const tickCount = 64;
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2;
    const startDist = photoR + 10;
    const endDist = photoR + 24;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * startDist, cy + Math.sin(angle) * startDist);
    ctx.lineTo(cx + Math.cos(angle) * endDist, cy + Math.sin(angle) * endDist);
    ctx.stroke();
  }
  ctx.restore();

  // Hand-drawn dotted ring
  ctx.save();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Yellow outer ring
  ctx.save();
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Cream/pink inner ring
  ctx.save();
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Draw user photo or placeholder
  if (image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 2, 0, Math.PI * 2);
    ctx.clip();

    const srcW = image.naturalWidth;
    const srcH = image.naturalHeight;
    const srcSize = Math.min(srcW, srcH);
    const srcX = (srcW - srcSize) / 2;
    const srcY = (srcH - srcSize) / 2;
    ctx.drawImage(image, srcX, srcY, srcSize, srcSize, cx - photoR, cy - photoR, photoR * 2, photoR * 2);
    ctx.restore();
  } else {
    // Empty state placeholder
    ctx.save();
    ctx.fillStyle = BLACK_GREEN;
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = YELLOW;
    ctx.font = "bold 32px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("upload a photo", cx, cy);
    ctx.restore();
  }

  // 6. Top Arched Headline
  const archText = "HACKER HOUSE GOA";
  const archFontSize = 64;
  const archFont = `900 ${archFontSize}px 'Playfair Display', Georgia, serif`;
  // Start from -140 deg to -40 deg
  const startAng = (-140 / 180) * Math.PI;
  const endAng = (-40 / 180) * Math.PI;
  drawArchedText(ctx, archText, cx, cy - 80, photoR + 70, startAng, endAng, archFont, YELLOW);

  // 7. Goa stamp overlapping the top of circle
  ctx.save();
  drawStickerBadge(ctx, cx, cy - photoR + 5, "गोवा", "postage", -0.06);
  ctx.restore();

  // 8. Bottom Ticket Stub Layout
  const ticketW = 420;
  const ticketH = 90;
  const ticketX = cx - ticketW / 2;
  const ticketY = cy + photoR - 55;

  ctx.save();
  // Drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // Cream ticket body
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.roundRect(ticketX, ticketY, ticketW, ticketH, 6);
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Perforated edge lines on sides
  ctx.fillStyle = DEEP_GREEN;
  ctx.beginPath();
  ctx.arc(ticketX, ticketY + ticketH / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ticketX + ticketW, ticketY + ticketH / 2, 8, 0, Math.PI * 2);
  ctx.fill();

  // Dashed tear-off line inside ticket
  ctx.strokeStyle = DARK_GREEN;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(ticketX + 320, ticketY + 4);
  ctx.lineTo(ticketX + 320, ticketY + ticketH - 4);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ticket text content
  ctx.fillStyle = DARK_GREEN;
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("28—31 OCT 2026 // GOA, INDIA", ticketX + 20, ticketY + 30);
  ctx.font = "900 10px 'Courier New', monospace";
  ctx.fillText("BUILD · SHIP · CHILL", ticketX + 20, ticketY + 60);

  // Barcode / Serial inside stub
  ctx.fillText("PASS", ticketX + 332, ticketY + 22);
  ctx.fillText("NO. 0427", ticketX + 332, ticketY + 40);

  // Barcode ticks
  ctx.fillStyle = DARK_GREEN;
  let barX = ticketX + 332;
  const bars = [12, 16, 10, 18, 14, 16, 8, 14];
  for (const b of bars) {
    ctx.fillRect(barX, ticketY + 54, 2, b);
    barX += 4;
  }
  ctx.restore();

  // 9. Reusable Stickers (deteministic selective placement, 3 per graphic)
  const stickerOptions = [
    { text: "SHIP IT", type: "seal" },
    { text: "SUSEGAD MODE", type: "torn" },
    { text: "247 BUILDERS", type: "postage" },
    { text: "BUILDER", type: "starburst" }
  ];

  // Pick stickers based on seeded random
  const pick1 = stickerOptions[0];
  const pick2 = stickerOptions[1];
  const pick3 = stickerOptions[3];

  // Draw 3 stickers overlapping the borders of PFP
  drawStickerBadge(ctx, 160, cy - 100, pick1.text, pick1.type, seed.range(-0.15, 0.15));
  drawStickerBadge(ctx, size - 150, cy - 100, pick2.text, pick2.type, seed.range(-0.15, 0.15));
  drawStickerBadge(ctx, cx - 220, cy + photoR + 50, pick3.text, pick3.type, seed.range(-0.15, 0.15));

  // 10. Metadata / Watermark footer details
  ctx.save();
  ctx.fillStyle = YELLOW;
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.textAlign = "left";
  ctx.fillText("#FRAMEINGOA", 40, size - 45);

  ctx.textAlign = "right";
  ctx.fillText("2:47 PM STUDIO", size - 40, size - 45);
  ctx.restore();

  // Final riso grain overlay
  drawRisoTexture(ctx, size, size);
}
