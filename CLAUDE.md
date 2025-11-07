# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LaminaTone is a React + TypeScript application for generating layered color palettes using CAM16-JMH and OkLCh color spaces for perceptually uniform color generation. The name comes from "lamination + tone" - representing stacked ToneSheet components that create a 3D layered color palette interface.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

## Core Architecture

### Application Layout Structure

The app uses a **3-section vertical layout**:

1. **ToneSheets Display Area** (flexible height): Containerized 3D stack visualization with `skewY(45deg)` transformation
2. **Axis Controls Section** (fixed height): 3-axis controls combining size adjustment and dual-range sliders for Hue/Lightness/Chroma
3. **Export Section** (fixed height): Export button at bottom for color palette export functionality

### Key Components

- **App** (`src/App.tsx`) - Main layout with 3-section structure and conditional ColorPicker rendering
- **useAppState** (`src/hooks/useAppState.ts`) - Centralized state management hook with all business logic

### Tone Sheet Components
- **ToneSheetsContainer** (`src/components/tone-sheet/tone-sheets-container.tsx`) - 3D positioning and stacking logic
- **ToneSheet** (`src/components/tone-sheet/tone-sheet.tsx`) - Individual color grid with active state styling
- **ColorGrid** (`src/components/tone-sheet/color-grid.tsx`) - 2D color cell grid with skewY transformation
- **ColorCell** (`src/components/tone-sheet/color-cell.tsx`) - Individual color display with click-to-copy functionality

### Control Components
- **AxisControl** (`src/components/controls/axis-control.tsx`) - 3-axis control with dual-range sliders
- **DualRangeSlider** (`src/components/controls/dual-range-slider.tsx`) - Range slider for min/max value selection

### Other Components
- **ColorPicker** (`src/components/color-picker/color-picker.tsx`) - Initial color selection interface
- **ColorExportModal** (`src/components/export/color-export-modal.tsx`) - Export functionality for color palettes
- **AppHeader** (`src/components/header/app-header.tsx`) - Application header component
- **ErrorBoundary** (`src/components/error-boundary.tsx`) - Error boundary component
- **ColorTooltip** (`src/components/ui/color-tooltip.tsx`) - Hover tooltip showing color information
- **useHover** (`src/hooks/useHover.ts`) - Reusable hover state management hook

### State Management Pattern

All state is managed through the `useAppState` hook which returns:
- `appState` - Current application state
- Action handlers: `handleColorSelect`, `handleAxisResize`, `handleSheetClick`, `resetApp`, `updateRange`

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

### 3D Visualization System

**skewY(45°) Transformation**: All ToneSheets are visually skewed to create parallelogram shapes representing the 3D color space.

**Positioning Logic**:
- Container dimensions account for skew expansion: `width = W + (sheetCount-1) * spacing + H`
- Height calculation: `(H + W) * 1.1` for skew accommodation
- Centering offsets: `vertical = (H+W)*1.1/2`, `horizontal = (W + spacing*N)/2`

**Active State Indication**: Selected ToneSheet displays a white outline with glow that follows the skewY transformation.

### Color Space Implementation

**Actual Implementation** (differs from original spec):
- Uses **CAM16-JMH** for hue extraction and grid generation
- Uses **OkLCh** as substitute for CAM16-UCS (stored in `cam16ucs` field)
- Primary dependency: `colorjs.io` for color space conversions

**Color Generation Flow**:
1. Start with CAM16-JMH values (J=lightness, M=chroma, H=hue)
2. Generate grid by interpolating chroma (horizontal) and lightness (vertical)
3. Convert back to sRGB for display
4. Store OkLCh values for perceptual distance calculations

### Axis Control System

**3-Axis Unified Controls** - Each axis control combines size adjustment (+/-) with dual-range sliders:
- **Hue Axis** (depth): Add/remove ToneSheets, auto-distribute hues within hue range
- **Lightness Axis** (vertical): Adjust grid rows, control lightness range (0-100)
- **Chroma Axis** (horizontal): Adjust grid columns, control chroma range (0-100)

**Range Synchronization**: When hue range changes, all existing ToneSheets redistribute evenly within the new range.

**Interactive Workflow**: 
1. Start with ColorPicker to select initial color
2. Use axis controls to expand grid dimensions and adjust ranges
3. Click ToneSheets to make them active
4. Export color palettes in various formats

### Technology Stack

- React 19 with TypeScript
- Vite build system with HMR configured for WSL environments
- TailwindCSS v4 for styling
- colorjs.io (v0.5.2) for color space operations
- ESLint for code quality
- Node.js 22.18.0 (Volta managed)

### Project Structure

The codebase follows a **unified component-based organization**:

- `src/components/` - All UI components organized by functionality
  - `tone-sheet/` - Color grid and tone sheet related components (ToneSheet, ColorGrid, ColorCell)
  - `controls/` - Control components (AxisControl, DualRangeSlider)
  - `color-picker/` - Color selection components
  - `export/` - Export functionality components
  - `header/` - Header components
  - `ui/` - Basic UI components (Button, ColorTooltip)
  - `error-boundary.tsx` - Error boundary component
- `src/hooks/` - Custom React hooks (useAppState, useHover)
- `src/utils/` - Utility functions (color-space calculations, grid calculations)
- `src/types/` - TypeScript type definitions
- `src/constants/` - Application constants (UI limits, etc.)

### Import Aliases

- `@/` maps to `src/` directory (configured in vite.config.ts)

### Layout and Responsive Design

**Container Containment**: ToneSheets are displayed within a dedicated white container with `overflow-hidden` to prevent visual overflow.

**Mobile Considerations**: The 3-axis controls and range sliders are designed to work on mobile devices with appropriate touch targets.

### Visual Effects

- **Active ToneSheet**: White outline with glow effect that transforms with skewY
- **Stacking**: Z-index based layering with active sheet at front (z-index: 100)
- **Smooth Transitions**: 300ms transitions for all interactive elements

### Color Interaction

- **Click**: Copy hex color to clipboard
- **Hover**: Display color information tooltip (hex, RGB values)

### Default Sizing

- ToneSheet base size: 200×200px
- Container expansion accounts for skewY transformation
- Grid spacing: 40px between ToneSheets