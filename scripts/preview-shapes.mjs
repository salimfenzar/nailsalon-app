// Renders the six nail silhouettes to an SVG and a PNG so the outline maths can
// be eyeballed without a browser.
//   node scripts/preview-shapes.mjs
import { execSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const OUT = ".tmp-shapes";
rmSync(OUT, { recursive: true, force: true });
execSync(
  `npx tsc src/app/_lib/geometry.ts src/app/_lib/nail-shapes.ts --outDir ${OUT} --module commonjs --target es2022 --moduleResolution node --skipLibCheck`,
  { stdio: "inherit" },
);

const require = createRequire(import.meta.url);
const { NAIL_SHAPES, NAIL_SHAPE_ORDER, nailOutline } = require(
  `../${OUT}/nail-shapes.js`,
);

const CELL = 190;
// The nail plate is a fixed width per finger; only the free edge length moves
// with the shape, exactly as buildNailFrames does it.
const NAIL_WIDTH = 74;
const BASE_LENGTH = 96;
const HEIGHT = 300;
const WIDTH = CELL * NAIL_SHAPE_ORDER.length;
const BASELINE = 230;

const placed = NAIL_SHAPE_ORDER.map((id, index) => {
  const shape = NAIL_SHAPES[id];
  const nailLength = BASE_LENGTH * shape.lengthFactor;
  const aspect = NAIL_WIDTH / 2 / nailLength;

  return {
    shape,
    polygon: nailOutline(shape, aspect).map(([u, v]) => [
      index * CELL + CELL / 2 + (v * NAIL_WIDTH) / 2,
      BASELINE - u * nailLength,
    ]),
  };
});

// --- SVG ------------------------------------------------------------------

const cells = placed
  .map(({ shape, polygon }, index) => {
    const d = polygon
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ");
    const cx = index * CELL + CELL / 2;
    return `
    <g>
      <path d="${d} Z" fill="#e6d2c4" stroke="#8c7361" stroke-width="1.2"/>
      <text x="${cx}" y="264" text-anchor="middle" font-family="serif" font-size="15" fill="#4a3b32">${shape.name}</text>
      <text x="${cx}" y="282" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#b59b84">length ${shape.lengthFactor}</text>
    </g>`;
  })
  .join("");

writeFileSync(
  "scripts/nail-shapes.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#faf7f4"/>${cells}
</svg>`,
);

// --- PNG ------------------------------------------------------------------

const BACKGROUND = [250, 247, 244];
const FILL = [230, 210, 196];
const EDGE = [140, 115, 97];
const SAMPLES = 3;

function inside(polygon, x, y) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      hit = !hit;
    }
  }
  return hit;
}

const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const cell = placed[Math.min(placed.length - 1, Math.floor(x / CELL))];

    // Supersampled coverage, so the silhouette edges read cleanly.
    let covered = 0;
    for (let sy = 0; sy < SAMPLES; sy++) {
      for (let sx = 0; sx < SAMPLES; sx++) {
        const px = x + (sx + 0.5) / SAMPLES;
        const py = y + (sy + 0.5) / SAMPLES;
        if (inside(cell.polygon, px, py)) covered++;
      }
    }

    const alpha = covered / (SAMPLES * SAMPLES);
    const colour = alpha > 0 && alpha < 1 ? EDGE : FILL;
    const weight = alpha > 0 && alpha < 1 ? 1 : alpha;
    const offset = (y * WIDTH + x) * 3;
    for (let channel = 0; channel < 3; channel++) {
      pixels[offset + channel] = Math.round(
        BACKGROUND[channel] * (1 - weight) + colour[channel] * weight,
      );
    }
  }
}

writeFileSync("scripts/nail-shapes.png", encodePng(WIDTH, HEIGHT, pixels));
console.log(
  `Wrote scripts/nail-shapes.svg and scripts/nail-shapes.png (${NAIL_SHAPE_ORDER.length} shapes)`,
);

rmSync(OUT, { recursive: true, force: true });

function encodePng(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([length, body, crc]);
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}
