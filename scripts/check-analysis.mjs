// Sanity check for the hand measurement maths. Compiles the pure-geometry
// modules and runs them against synthetic hands of varying proportions.
//   node scripts/check-analysis.mjs
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";

const OUT = ".tmp-analysis";
rmSync(OUT, { recursive: true, force: true });
execSync(
  `npx tsc src/app/_lib/geometry.ts src/app/_lib/analysis.ts src/app/_lib/nail-shapes.ts --outDir ${OUT} --module commonjs --target es2022 --moduleResolution node --skipLibCheck`,
  { stdio: "inherit" },
);

const require = createRequire(import.meta.url);
const { analyseHand } = require(`../${OUT}/analysis.js`);
const { buildNailFrames, NAIL_SHAPES } = require(`../${OUT}/nail-shapes.js`);

const WIDTH = 900;
const HEIGHT = 1200;

/**
 * Builds a hand in pixel space: the wrist at the bottom, four knuckles spread
 * across the palm, and each finger extended straight up. Segment lengths are
 * expressed against the palm length using adult hand anthropometry, where the
 * palm runs ~95 mm and the knuckles sit ~20 mm apart.
 */
function syntheticHand({ palm = 400, fingerScale = 1, distalScale = 1 } = {}) {
  const wrist = { x: WIDTH / 2, y: HEIGHT - 60 };
  const knuckleY = wrist.y - palm;
  const spacing = palm * 0.21;
  const points = new Array(21);
  points[0] = wrist;

  const fingers = [
    { mcp: 5, ratios: [0.42, 0.25, 0.17] },
    { mcp: 9, ratios: [0.46, 0.28, 0.19] },
    { mcp: 13, ratios: [0.43, 0.27, 0.19] },
    { mcp: 17, ratios: [0.34, 0.19, 0.17] },
  ];

  fingers.forEach((finger, index) => {
    const x = wrist.x + (index - 1.5) * spacing;
    let y = knuckleY;
    points[finger.mcp] = { x, y };
    finger.ratios.forEach((ratio, segment) => {
      const scale = segment === 2 ? fingerScale * distalScale : fingerScale;
      y -= palm * ratio * scale;
      points[finger.mcp + segment + 1] = { x, y };
    });
  });

  // Thumb, angled away from the palm.
  points[1] = { x: wrist.x - spacing * 1.6, y: wrist.y - palm * 0.28 };
  points[2] = { x: wrist.x - spacing * 2.3, y: wrist.y - palm * 0.6 };
  points[3] = { x: wrist.x - spacing * 2.7, y: wrist.y - palm * 0.85 };
  points[4] = { x: wrist.x - spacing * 2.95, y: wrist.y - palm * 1.05 };

  return points;
}

console.log("finger  distal   ratio    bed    drama  shape      match  alternates");
const seen = new Set();

for (const fingerScale of [0.8, 0.9, 1.0, 1.1, 1.2, 1.3]) {
  for (const distalScale of [0.85, 1.0, 1.15]) {
    const points = syntheticHand({ fingerScale, distalScale });
    const v = analyseHand(points);
    seen.add(v.shape);
    console.log(
      `${fingerScale.toFixed(2)}    ${distalScale.toFixed(2)}   ` +
        `${v.measurements.lengthWidthRatio.toFixed(2)}   ` +
        `${v.measurements.bedRatio.toFixed(2)}   ` +
        `${v.measurements.drama.toFixed(2)}   ` +
        `${v.shape.padEnd(9)}  ${v.match}%    ${v.alternates.join(", ")}`,
    );
  }
}

console.log("\nshapes reached:", [...seen].sort().join(", "));

const frames = buildNailFrames(syntheticHand(), NAIL_SHAPES.almond);
console.log("\nnail frames (almond):");
for (const frame of frames) {
  console.log(
    `  ${frame.finger.padEnd(7)} length=${frame.length.toFixed(1)}px ` +
      `width=${(frame.halfWidth * 2).toFixed(1)}px ` +
      `aspect=${(frame.length / (frame.halfWidth * 2)).toFixed(2)}`,
  );
}

rmSync(OUT, { recursive: true, force: true });
