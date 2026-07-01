import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Minimal QR code generator (byte mode, level L). Self-contained — no deps.
// Based on the QR specification; supports up to version 10 (174 bytes) which
// covers typical text/URL inputs for this tool.

const EC_CODEWORDS_L = [
  7, 10, 15, 20, 26, 36, 40, 48, 60, 72, 80, 96, 108, 130, 150, 176,
];

function getGFTables() {
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  return { exp, log };
}

const GF = getGFTables();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF.exp[GF.log[a] + GF.log[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF.exp[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Array(ecLen).fill(0);
  for (const d of data) {
    const factor = d ^ res.shift()!;
    res.push(0);
    for (let i = 0; i < ecLen; i++) {
      res[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return res;
}

function pickVersion(byteLen: number): number {
  // capacity for byte mode, level L
  const caps = [17, 32, 53, 78, 106, 134, 154, 192, 230, 271];
  for (let v = 0; v < caps.length; v++) {
    if (byteLen + 2 <= caps[v]) return v + 1;
  }
  return 10;
}

function buildMatrix(data: number[], version: number): boolean[][] {
  const size = version * 4 + 17;
  const m: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  );

  // Finder patterns
  const placeFinder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const border = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        m[rr][cc] = border || inner;
        reserved[rr][cc] = true;
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Alignment patterns (versions 2+)
  if (version >= 2) {
    const positions = [6];
    const last = size - 7;
    const step = Math.floor((last - 6) / (Math.floor(version / 7) + 1));
    for (let p = last; p > 6; p -= step) positions.unshift(p);
    for (const r of positions) {
      for (const c of positions) {
        if (reserved[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const border = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const center = dr === 0 && dc === 0;
            m[r + dr][c + dc] = border || center;
            reserved[r + dr][c + dc] = true;
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Reserve format areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) reserved[8][i] = true;
    if (i !== 6) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[size - 1 - i][8] = true;
    reserved[8][size - 1 - i] = true;
  }
  reserved[size - 8][8] = true; // dark module

  // Place data bits
  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const r = upward ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (reserved[r][cc]) continue;
        const byteIdx = bitIdx >> 3;
        const bitInByte = 7 - (bitIdx & 7);
        const bit =
          byteIdx < data.length
            ? ((data[byteIdx] >> bitInByte) & 1) === 1
            : false;
        m[r][cc] = bit;
        bitIdx++;
      }
    }
    upward = !upward;
  }

  // Apply mask 0 (i + j) % 2 === 0, skipping reserved
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      if ((r + c) % 2 === 0) m[r][c] = !m[r][c];
    }
  }

  // Format info for mask 0, level L (precomputed bits 0x77c4)
  const fmt = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const bit = ((fmt >> i) & 1) === 1;
    if (i < 6) m[8][i] = bit;
    else if (i < 8) m[8][i + 1] = bit;
    else if (i < 9) m[size - 15 + i][8] = bit;
    else m[size - 15 + i][8] = bit;
  }
  for (let i = 0; i < 8; i++) {
    const bit = ((fmt >> (14 - i)) & 1) === 1;
    m[8][size - 1 - i] = bit;
    if (i < 7) m[size - 1 - i][8] = bit;
  }
  m[size - 8][8] = true;

  return m;
}

function encodeQR(text: string): boolean[][] | null {
  try {
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > 271) return null;
    const version = pickVersion(bytes.length);
    const ecLen = EC_CODEWORDS_L[version - 1];
    const totalData = version * 4 + 17;
    const dataCap = totalData * totalData; // not used directly
    void dataCap;

    // Build bit stream: mode (4 bits) + length (8 bits for v1-9) + data + terminator + pad
    const bits: number[] = [];
    const push = (val: number, len: number) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };
    push(0b0100, 4); // byte mode
    push(bytes.length, version < 10 ? 8 : 16);
    for (const b of bytes) push(b, 8);
    push(0, 4); // terminator
    while (bits.length % 8 !== 0) bits.push(0);
    const dataCodewords: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      let v = 0;
      for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i + j] ?? 0);
      dataCodewords.push(v);
    }
    const totalCodewords = ((version * 4 + 17) * (version * 4 + 17)) / 8;
    void totalCodewords;
    const dataLen = Math.floor((version * 4 + 17) ** 2 / 8) - ecLen;
    while (dataCodewords.length < dataLen) {
      dataCodewords.push(0xec);
      if (dataCodewords.length < dataLen) dataCodewords.push(0x11);
    }
    const ec = rsEncode(dataCodewords, ecLen);
    const full = [...dataCodewords, ...ec];
    return buildMatrix(full, version);
  } catch {
    return null;
  }
}

export interface ToolUseProps {
  onUse?: (inputSummary: string, outputSummary: string) => void;
}

export function QRGenerator({ onUse }: ToolUseProps) {
  const [text, setText] = useState("https://caffeine.ai");
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: redraw only when text/size change; onUse is a stable callback
  useEffect(() => {
    const matrix = encodeQR(text || " ");
    const canvas = canvasRef.current;
    if (!canvas || !matrix) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const n = matrix.length;
    const scale = Math.max(1, Math.floor(size / n));
    const dim = scale * n;
    canvas.width = dim;
    canvas.height = dim;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
    if (onUse && text) {
      onUse(
        text.length > 80 ? `${text.slice(0, 80)}…` : text,
        `QR code ${matrix.length}×${matrix.length} @ ${size}px`,
      );
    }
  }, [text, size]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.png";
    a.click();
    toast.success("QR code downloaded.");
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="qr-text" data-ocid="qr.text.label">
          Text or URL
        </Label>
        <Input
          id="qr-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or a URL"
          data-ocid="qr.text.input"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label data-ocid="qr.size.label">Size</Label>
          <span className="font-mono text-xs text-muted-foreground">
            {size}px
          </span>
        </div>
        <Slider
          value={[size]}
          min={128}
          max={512}
          step={16}
          onValueChange={(v) => setSize(v[0] ?? 256)}
          data-ocid="qr.size.slider"
        />
      </div>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded-md border border-border/60 bg-white"
          aria-label="Generated QR code"
          data-ocid="qr.canvas"
        />
        <Button
          onClick={download}
          className="w-full sm:w-auto"
          data-ocid="qr.download_button"
        >
          <Download className="size-4" aria-hidden />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
