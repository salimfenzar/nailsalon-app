# NailLab Studio — AI hand scan studio

A mobile-first Next.js app that scans a hand with the camera, measures its
proportions with MediaPipe hand landmarks, recommends a nail shape, and paints
the recommendation back onto the captured photo so it can be previewed in
different colours and finishes.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000> on a phone or in a mobile viewport.

Camera access requires a secure context. `localhost` counts as secure, but if
you test from another device on your network you need HTTPS — otherwise the
browser will never prompt for the camera and the app falls back to the "Upload
a photo instead" path.

## How it works

The flow is a three-stage state machine in `src/app/_components/studio.tsx`:

1. **Splash** (`splash-screen.tsx`) — branding, the promise list, and the two
   entry points: start the camera scan or upload a photo.
2. **Scan** (`scan-screen.tsx`) — a live camera feed with an AR overlay drawn
   from the 21 hand landmarks. It coaches the user into frame ("Move closer",
   "Open your fingers", "Hold still"), then runs a five-second countdown while
   collecting landmark samples every frame. Any wobble past the jitter
   threshold restarts the countdown, so the capture is always taken from a
   steady hand. The samples are reduced with a per-axis median, which throws
   away frames where the tracker briefly slipped.
3. **Result** (`result-screen.tsx`) — the captured frame with nails painted on
   top, the match badge, the stylist advice, the colour picker, and the
   fine-tune sliders.

### Measurement and recommendation

`_lib/analysis.ts` derives two ratios from the averaged landmarks: finger
slenderness (middle-finger length over palm width) and nail-bed ratio (nail bed
length over width). Both are normalised into a 0–1 "drama" score, and that score
picks a shape from the band `round → oval → squoval → almond → coffin →
stiletto`. The match percentage is the distance from the score to the centre of
the winning band, so a hand that sits right between two shapes honestly reports
a lower match than one that lands squarely in a band.

### Rendering

`_lib/nail-shapes.ts` builds a local coordinate frame per finger from the DIP →
TIP vector, so the painted nail follows each finger's own direction and
foreshortening rather than a single global rotation. The silhouettes are
parametric (taper, edge width, edge bulge, edge flatness), which is what lets
one set of geometry produce all six shapes. `_lib/render-nails.ts` then layers a
contact shadow, base gradient, finish, cuticle shade, and specular highlights.
Ten finishes are supported, including french, ombré, chrome, glazed, aura,
cat-eye, glitter, and marble.

### Skin tone

`_lib/skin-tone.ts` samples skin patches between the knuckles on the captured
frame and classifies undertone (warm / cool / neutral) and depth. The colour
picker uses this to mark the shades that flatter that undertone.

## MediaPipe assets

The WASM runtime and the `hand_landmarker.task` model are vendored into
`public/mediapipe/`, so the app makes no third-party CDN calls at runtime and
works offline after the first load. The runtime tries the GPU delegate first and
falls back to CPU.

## Dev checks

Two Node scripts verify the parts that are hard to eyeball:

```bash
npm run check:analysis   # runs the measurement pipeline against a synthetic hand
npm run check:shapes     # renders all six silhouettes to scripts/nail-shapes.png
```

`check:analysis` catches calibration drift (it reports the ratios, drama score,
chosen shape, and per-nail aspect ratios). `check:shapes` catches geometry
regressions — it is how the over-sharp almond tip and a stiletto artefact were
found.

## Project layout

```
src/app
  page.tsx              entry, constrains the app to a phone-width column
  layout.tsx            fonts, metadata, viewport
  globals.css           design tokens, animations, custom utilities
  _components/          screens and UI primitives
  _lib/                 geometry, analysis, palette, rendering, camera + model hooks
```
