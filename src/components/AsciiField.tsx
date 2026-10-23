"use client";

import { useEffect, useRef } from "react";

/**
 * A diagonal brush-stroke of colour rendered through a grid of monospace
 * glyphs — an ASCII halftone — drifting and shimmering slowly behind the page.
 * Canvas 2D, no dependencies: each cell samples a moving gradient field for its
 * colour and a soft diagonal mask for its density, and picks a glyph from a
 * ramp by that density. Repaints at a low frame rate (the motion is meant to
 * be felt, not watched), paints once under prefers-reduced-motion, and pauses
 * when the tab is hidden.
 */
const GLYPHS = " .:-=+*#%@$S8B0M"; // density ramp, sparse to dense
const PALETTE = ["#7c3aed", "#ff3d81", "#ff7a1a", "#22d3ee"]; // the site's glow tokens

export function AsciiField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const cell = mobile ? 14 : 12;
    const fps = mobile ? 6 : 10;
    const mono =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace";
    const palette = PALETTE.map(hexToRgb);

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell * 0.95}px ${mono}`;
      ctx.textBaseline = "top";
    };

    // Deterministic per-cell noise so the grain does not crawl every frame.
    const hash = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const diag = Math.hypot(w, h);
      // The stroke: a band around a line from the upper right to the lower
      // left, like a brush pulled across the page. It breathes slowly.
      const angle = -0.95 + Math.sin(t * 0.00005) * 0.05;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const width = diag * (0.085 + 0.012 * Math.sin(t * 0.00009));
      const cx = w * 0.8 + Math.sin(t * 0.00006) * w * 0.02;
      const cy = h * 0.4;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell;
          const y = j * cell;
          // Distance from the stroke's centre line, and position along it.
          const dx = x - cx;
          const dy = y - cy;
          const across = dx * ca + dy * sa;
          const along = -dx * sa + dy * ca;
          const band = Math.exp(-(across * across) / (2 * width * width));
          // Soften the left/bottom edge like a dry brush, and fade at the ends.
          const ends = Math.exp(-(along * along) / (2 * (diag * 0.4) ** 2));
          const grain = hash(i, j);
          const flow = 0.5 + 0.5 * Math.sin(along * 0.012 - t * 0.0004 + grain * 2);
          // Dry-brush edge: cells thin out quickly outside the core of the stroke.
          const edge = band < 0.35 ? band * band * 2 : band;
          let density = edge * ends * (0.55 + 0.45 * flow) * (0.5 + 0.5 * grain);
          if (density < 0.05) continue;
          density = Math.min(1, density * 1.2);
          // Colour: a gradient along the stroke that drifts with time.
          const u = ((along / diag) * 1.4 + 0.5 + t * 0.00002 + grain * 0.06) % 1;
          const [r, g, b] = samplePalette(palette, u < 0 ? u + 1 : u);
          const glyph =
            GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(density * (GLYPHS.length - 1)))];
          if (glyph === " ") continue;
          ctx.fillStyle = `rgba(${r},${g},${b},${(0.08 + density * 0.42).toFixed(3)})`;
          ctx.fillText(glyph, x, y);
        }
      }
    };

    resize();
    let frame = 0;
    let last = 0;
    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      if (now - last >= 1000 / fps) {
        last = now;
        paint(now);
      }
      frame = requestAnimationFrame(loop);
    };
    if (reduced) paint(0);
    else frame = requestAnimationFrame(loop);

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !reduced) frame = requestAnimationFrame(loop);
    };
    const onResize = () => {
      resize();
      if (reduced) paint(0);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 [filter:blur(0.4px)]" />;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function samplePalette(p: [number, number, number][], u: number): [number, number, number] {
  const scaled = u * p.length;
  const i = Math.floor(scaled) % p.length;
  const k = (i + 1) % p.length;
  const f = scaled - Math.floor(scaled);
  return [
    Math.round(p[i][0] + (p[k][0] - p[i][0]) * f),
    Math.round(p[i][1] + (p[k][1] - p[i][1]) * f),
    Math.round(p[i][2] + (p[k][2] - p[i][2]) * f),
  ];
}
