# Lumière Nails - AI Hand Scan & Nail Advice Web App

## Goal
Build a premium, mobile-first Next.js (App Router) web application using Tailwind CSS and Google MediaPipe (`@mediapipe/tasks-vision`).

## Core Features & User Flow
1. **Splash Screen**:
   - High-end beauty aesthetic (minimalist, nude/beige palette, luxury typography).
   - "Start Hand Scan" button (Safari/iOS compatible gesture trigger) + manual fallback.

2. **Scanning Screen (Camera + Real-Time AR)**:
   - Uses rear/front camera via browser mediaDevices.
   - Detects 21 hand landmarks in real-time with MediaPipe.
   - Displays dynamic AR overlays over fingertips (landmarks 4, 8, 12, 16, 20) showing glowing nail shape outlines.
   - 5-second countdown timer that averages landmark ratios for high accuracy.

3. **Results Screen**:
   - Captures the actual camera frame/photo instead of a drawn hand illustration.
   - Overlays the recommended nail shape (e.g., Almond, Squoval, Coffin) directly onto the user's real fingertips with realistic drop-shadows and specular highlights.
   - Displays a "98% Match" badge and stylist advice explanation based on finger length/width ratio.
   - Includes a "Fine-Tune Alignment" tool (position/scale offset sliders) for perfect placement.

4. **Interactive Color & Design Picker**:
   - Category tabs: "Solid Colors", "Chrome & Glazed", "French & Minimal", "Trending Designs".
   - Swatches dynamically update the visual overlay pattern/color on the user's real hand photo.
   - Skin undertone AI badge recommendation.