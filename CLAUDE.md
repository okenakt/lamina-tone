# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

Lamina Tone is a React + TypeScript palette generator built around OKLCH. Users
pick a seed color, then explore a layered Hue × Lightness × Chroma color cube.
Generated colors are displayed and exported as sRGB.

## Development Commands

- `npm run dev` — start the Vite development server
- `npm run build` — run TypeScript project builds and create a production bundle
- `npm run lint` — run ESLint
- `npm run format` — format the repository with Prettier
- `npm run format:check` — check formatting without writing
- `npm run preview` — preview the production bundle

There is currently no automated test suite.

## Application Flow

`App` owns the selected seed color:

1. With no seed, `ColorPickerPage` renders the OKLCH picker, RGB sliders, hex
   input, and random-color action.
2. Selecting a seed opens `PaletteEditorPage`.
3. The palette editor owns its `ColorCube` through `useColorCube`, generates one
   grid per sampled hue, displays the stacked tone sheets, and passes the same
   grids to the export modal.
4. Back/reset clears the seed and returns to the picker.

## Key Modules

- `src/lib/color-engine/` — color conversion, gamut mapping, axis sampling, and
  grid generation
- `src/components/geometry-controls/` — generic pointer-driven line, wheel, and
  rectangular controls
- `src/components/color-editor/` — seed color picker, RGB controls, and hex input
- `src/components/axis-controls/` — palette axis size/range controls
- `src/components/tone-sheet/` — skewed palette sheets, cell interaction, and
  tooltip state
- `src/components/export/` — JSON, TypeScript, CSS, and Python export modal
- `src/hooks/use-color-cube.ts` — color-cube range and dimension state

## Color Model

The UI-facing color type is:

```typescript
type Color = {
  hex: string;
  rgb: { r: number; g: number; b: number };
  oklch: { l: number; c: number; h: number };
};
```

- `l`: normalized Lightness, 0–1
- `c`: normalized Chroma, 0–1, where 1 maps to native OKLCH C = 0.4
- `h`: Hue in degrees, 0–360

Lightness and Chroma sliders display 0–100 and are divided by 100 before color
generation. Hue remains in degrees.

### Grid Generation

`generateColorGrid` independently samples the requested Lightness and Chroma
ranges at equal intervals. Hue sheets are sampled clockwise with wrap-around
support through `sampleAxis`.

For every requested OKLCH color, `oklchToColor`:

1. Keeps Lightness and Hue fixed.
2. Tests whether the requested Chroma is representable in sRGB.
3. If it is out of gamut, binary-searches Chroma downward to the sRGB boundary.
4. Converts the mapped value to integer RGB and hex.

This preserves independent L/C/H controls and requested range sampling. Colors
can converge near the sRGB gamut boundary because multiple requested Chroma
values may map to the same displayable Chroma.

`oklchToRgb` is a faster unclamped-coordinate helper used to paint the picker
canvas. It clips RGB channels and should not replace `oklchToColor` for palette
generation.

## Control Architecture

`Track` owns pointer capture, nearest-handle selection, and dragging. Geometry
objects provide:

- pointer position → coordinate conversion
- coordinate → handle position conversion
- nearest-point distance
- optional pointer hit testing

`Slider`, `Wheel`, and `Pad` adapt that mechanism to their respective shapes.
`RangeSlider` and `RangeWheel` compose those primitives for axis controls.

Hue ranges are directed clockwise arcs and may wrap through 0°. Lightness and
Chroma ranges are ordinary ordered linear ranges. Axis sizes are limited by
`AXIS_LIMITS` in `src/constants/tone-sheet.ts`.

## Tone-Sheet Rendering

Each hue produces a `Color[][]`. `ToneSheet` renders that grid with
`skewY(45deg)`. `ToneSheetsContainer` positions the sheets, expands the active
sheet, dims inactive sheets, and owns the cursor-following tooltip state.

Only the active sheet enables cell hover/copy interaction. Clicking a color
copies its hex value.

## Export

`ColorExportModal` receives the already-generated grids. It does not regenerate
colors. Palette keys use `h-{index}`, `l-{index}`, and `c-{index}`. Supported
outputs are JSON, TypeScript, CSS variables, and Python, with hex or RGB values.

## Technology

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- colorjs.io 0.6
- Node.js 24.16.0 via Volta

`@/` maps to `src/`.

## Spacing Convention

Each box declares only its own interior; parents own spacing between children.

- Use parent `padding` for edge gutters and parent `gap` for sibling spacing.
- Transparent grouping roots should fill the space they are given and avoid
  outer padding.
- Avoid margins except deliberate self-centering or full-bleed cases.
- Root padding is appropriate when the root is itself a visual surface such as
  a card, button, border, or hit area.
