# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LaminaTone is a React + TypeScript application for generating layered color palettes using CAM16-JMH and OkLCh color spaces for perceptually uniform color generation. The name comes from "lamination + tone" - representing stacked ToneSheet components that create a 3D layered color palette interface.

## Development Commands

- `npm run dev` - Start development server with hot reload (Vite HMR is configured for WSL environments)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

There is no test setup in this project.

## Core Architecture

### Application Layout Structure

The app uses a **3-section vertical layout**:

1. **ToneSheets Display Area** (flexible height): Containerized 3D stack visualization with `skewY(45deg)` transformation
2. **Axis Controls Section** (fixed height): 3-axis controls combining size adjustment and dual-range sliders for Hue/Lightness/Chroma
3. **Export Section** (fixed height): Export button at bottom for color palette export functionality

**App Entry Flow**: When `toneSheets.length === 0`, App renders only the ColorPicker full-screen. After the first color is selected via `handleColorSelect`, the main 3-section layout appears. `resetApp` reverts to the ColorPicker by clearing `toneSheets` and resetting `dimensions` — but it does NOT reset `selectedColor`, `activeSheetIndex`, or any range values.

### Key Components

- **App** (`src/App.tsx`) - Main layout with 3-section structure and conditional ColorPicker rendering
- **useAppState** (`src/hooks/useAppState.ts`) - Centralized state management hook with all business logic
- **ColorPicker** (`src/components/color-picker/color-picker.tsx`) - Entry screen shown when no sheets exist. Provides a native `<input type="color">` for custom hex input and a grid of 8 random color swatches (regenerated on demand via `generateRandomColors`). Selecting any color triggers `handleColorSelect` and transitions to the main layout.
- **AxisControl** (`src/components/controls/axis-control.tsx`) - 3-axis control combining +/- size buttons with a range control. Accepts optional `renderRangeControl` prop to substitute a custom control (e.g. HueRangeWheel) instead of the default DualRangeSlider.
- **DualRangeSlider** (`src/components/controls/dual-range-slider.tsx`) - Default range control used for Lightness and Chroma axes. Used inside AxisControl when no `renderRangeControl` is provided.
- **HueRangeWheel** (`src/components/controls/hue-range-wheel.tsx`) - Circular SVG color wheel for selecting the hue range. Coordinate system: 0° at top, clockwise. Uses SVG pointer capture for drag. Drag start (blue) and end (orange) handles; supports wrap-around ranges (e.g. 300°→60°). Used as the `renderRangeControl` for the Hue AxisControl.
- **useHover** (`src/hooks/useHover.ts`) - Minimal hook that tracks which `Color` (if any) is currently hovered in the grid. Consumed by `ToneSheetsContainer` to drive the `ColorTooltip`.

### State Management Pattern

All state is managed through the `useAppState` hook which returns:

- `appState` - Current application state
- Action handlers: `handleColorSelect`, `handleAxisResize`, `handleSheetClick`, `handleContainerClick`, `resetApp`, `updateRange`

Key state structure:

```typescript
interface AppState {
  toneSheets: ToneSheetData[];
  activeSheetIndex: number;
  dimensions: { lightness: number; chroma: number; hue: number };
  globalChromaRange: { min: number; max: number };
  globalLightnessRange: { min: number; max: number };
  globalHueRange: { min: number; max: number };
  showColorInfo: boolean;
  selectedColor: Color | null;
}
```

**Initial state defaults**: `dimensions` starts as `{ lightness: 1, chroma: 1, hue: 0 }` (1×1 grid, no sheets). `globalChromaRange` and `globalLightnessRange` start at `{ min: 50, max: 100 }`. `globalHueRange` starts at `{ min: 0, max: 180 }`.

**Subtle state behaviors**:

- `dimensions.hue` is kept in sync with `toneSheets.length` but is redundant — axis controls always read `toneSheets.length` directly for the hue count.
- `handleColorSelect` only auto-sets `globalChromaRange`, `globalLightnessRange`, and `globalHueRange` when adding the very first sheet (`toneSheets.length === 0`). The initial hue range is ±90° around the selected color's hue: `min: (hue - 90 + 360) % 360`, `max: (hue + 90) % 360`. Subsequent color additions do not change the ranges.
- `redistributeHues` is called on every hue range change and on add/remove sheet, ensuring even spacing across the range clockwise. Wrap-around: span = `max >= min ? max - min : 360 - min + max`.
- `resetApp` is exported from `useAppState` but is **not currently wired to any UI button** in `App.tsx`. Adding a reset/back button requires destructuring it there.

### 3D Visualization System

**skewY(45°) Transformation**: The `ColorGrid` inside each ToneSheet applies `transform: skewY(45deg)` to the CSS grid, creating parallelogram shapes that represent the 3D color space. The sheet container divs in `ToneSheetsContainer` are not themselves skewed — only the inner grid is.

**Positioning Logic**: `ToneSheetsContainer` measures its own pixel width via a `window` resize listener and centers the sheet stack within that width.

- Container height: `(H + W) * 1.1` to accommodate skew expansion
- Horizontal centering: `startX = (containerWidth - totalVisualWidth) / 2 + H/2`
- `totalVisualWidth = lastSheetOffset + W + H` (H accounts for skew bleed)

**Dynamic Spacing (sheetOffset function)**:

- No selection (`activeIndex === -1`): sheets step by `normalSpacing` (40px) — relaxed stack
- Active selection: inactive sheets before active compact at 10px intervals; active sheet gets a full `W`-wide gap after the preceding sheet; sheets after active compact again at 10px after the active sheet
- Non-active sheets dim to 0.3 opacity when any sheet is selected

**Active State Indication**: Selected ToneSheet displays a white outline with glow that follows the skewY transformation.

### Color Space Implementation

**Color spaces used**:

- **OKLCH** (L, C, h) — UI-facing space. L: lightness 0–1, C: chroma 0–0.4, h: hue angle 0–360°. Intuitive for users (lightness/chroma/hue as independent axes).
- **OKLab** (L, a, b) — internal generation space. Cartesian form of OKLCH; Euclidean distance ≈ perceived color difference. Linear interpolation in this space gives perceptually uniform steps without additional compression.
- **sRGB** — display output (hex/rgb).
- Primary dependency: `colorjs.io` for conversions.

**Naming collision**: `colorjs.io` exports a class also named `Color`. In `src/utils/color-space.ts`, the local `Color` interface is imported as `ColorType` to avoid the conflict.

**Why OKLCH over CAM16-JMH**: CAM16's strength is modeling viewing conditions (adaptation, surround, HDR). For a fixed sRGB monitor context those are irrelevant. OKLab was designed specifically for Web/UI use and achieves equal or better perceptual uniformity with much simpler math.

**`Color` type**:

- `oklch: [L, C, h]` — L (0–1), C (0–~0.4), h (0–360°). Achromatic colors have h=0.

**Slider scale vs. internal scale**: Sliders display 0–100 for both lightness and chroma. Internally:

- Lightness: `L = display / 100`
- Chroma: `C = (display / 100) × MAX_CHROMA` where `MAX_CHROMA = 0.4`

**Color Generation Flow** (`generateColorGrid`):

1. Convert slider range endpoints to OKLCH native values (L: 0–1, C: 0–0.4)
2. Interpolate L and C **linearly** — no compression needed since OKLab is already approximately perceptually uniform
3. Row 0 = highest L (top of visual grid)
4. Each cell: `oklchToColor(L, C, baseHue)` → sRGB

**Out-of-gamut handling** (`oklchToColor`): Binary search on C (20 iterations) to find the maximum C that keeps the color within sRGB while preserving L and h. This avoids the hue/lightness distortion caused by naive RGB clipping.

**Grid cell sizing** (`calculateGridDimensions` in `src/utils/grid.ts`): cells are scaled to fit a 180px container, then cell height is divided by `Math.cos(π/4)` to compensate for the 45° skew so cells appear visually square.

### Axis Control System

**3-Axis Unified Controls** - Each axis control combines size adjustment (+/-) with dual-range sliders. All axes share the same size limits: min=1, max=16 (`AXIS_LIMITS` in `src/constants/ui.ts`).

- **Hue Axis** (depth): Add/remove ToneSheets, auto-distribute hues within hue range (0–360)
- **Lightness Axis** (vertical): Adjust grid rows, control lightness range (0–100)
- **Chroma Axis** (horizontal): Adjust grid columns, control chroma range (0–100)

**Range Synchronization**: When hue range changes, all existing ToneSheets redistribute evenly within the new range.

### Export Format

`ColorExportModal` regenerates all colors at export time using `generateColorGrid` (no cached grid). The exported 3D palette structure uses `h-Z / l-Y / c-X` string keys (zero-indexed). Supported formats: JSON, TypeScript (`as const`), CSS variables (`--palette-h-Z-l-Y-c-X`), Python. Colors can be exported as hex or RGB.

### Technology Stack

- React 19 with TypeScript
- Vite build system with HMR configured for WSL environments
- TailwindCSS v4 for styling
- colorjs.io (v0.5.2) for color space operations
- ESLint for code quality
- Node.js 22.18.0 (Volta managed, pinned in `package.json`)

### Import Aliases

- `@/` maps to `src/` directory (configured in vite.config.ts)

### Performance

`ToneSheet`, `ColorGrid`, and `ColorCell` are all wrapped in `React.memo`. The expensive `generateColorGrid` call is memoized inside `ToneSheet` with `useMemo`, keyed on `hue`, `dimensions`, `chromaRange`, and `lightnessRange`. Changes to any of those four props triggers a full grid regeneration.

### Visual Effects

- **Active ToneSheet**: Brought to the front (z-index: 100); other sheets dim to 0.3 opacity
- **Stacking**: Z-index based layering; non-active sheets stack by reverse index
- **Smooth Transitions**: 300ms transitions for all interactive elements

### Color Interaction

- **Click**: Copy hex color to clipboard — **only works when the sheet is active** (`canCopy` is gated by `isActive` in `ColorCell`). Shows a brief "Copied!" overlay (`FEEDBACK.copyDisplayDuration` = 1000ms).
- **Hover**: Display color information tooltip (hex, RGB values). `ColorTooltip` is rendered inside `ToneSheetsContainer` and is fixed at the **bottom-left of the display area** — it does not follow the cursor.

### Default Sizing

- ToneSheet base size: 200×200px
- Grid spacing: 40px between ToneSheets (normal), 10px (compact when a sheet is active)
