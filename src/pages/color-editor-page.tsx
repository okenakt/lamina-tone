import { HueAxisControl, SliderAxisControl } from "@/components/axis-controls";
import { ColorExporter } from "@/components/export";
import { ToneSheetsContainer } from "@/components/tone-sheet";
import { useColorCube } from "@/hooks";
import {
  generateColorGrid,
  oklchToColor,
  sampleAxis,
} from "@/lib/color-engine";
import { Color, ColorAxis } from "@/types";
import { useMemo, useState } from "react";

type ColorEditorPageProps = {
  seedColor: Color;
  onReset: () => void;
};

// 0-100 slider scale → engine-normalized 0-1 range, keeping num.
const toEngineAxis = (axis: ColorAxis): ColorAxis => ({
  range: { min: axis.range.min / 100, max: axis.range.max / 100 },
  num: axis.num,
});

export const ColorEditorPage = ({
  seedColor,
  onReset,
}: ColorEditorPageProps) => {
  const { cube, resizeAxis, setRange } = useColorCube(seedColor);
  // Selection is a view concern over the rendered tone sheets, not part of the cube model.
  const [activeSheetIndex, setActiveSheetIndex] = useState(-1);

  // Clamp selection to the current sheet count (hue.num may have shrunk).
  const activeIndex = Math.min(activeSheetIndex, cube.hue.num - 1);
  const hues = sampleAxis(cube.hue, true);

  // Single source of truth for generated colors: one grid per hue sheet.
  // Both the tone-sheet display and the exporter read from this — no double generation.
  const grids = useMemo(() => {
    const l = toEngineAxis(cube.lightness);
    const c = toEngineAxis(cube.chroma);
    return hues.map((hue) => generateColorGrid(hue, l, c));
  }, [hues, cube.lightness, cube.chroma]);

  // Gradient strip functions for lightness/chroma sliders.
  // Lightness strips: vary L, fix C at chroma center, use each sheet's hue.
  // Chroma strips:    vary C, fix L at lightness center, use each sheet's hue.
  const lightnessStrips = useMemo(() => {
    const cCenter = (cube.chroma.range.min + cube.chroma.range.max) / 200;
    return hues.map(
      (hue) => (v: number) => oklchToColor(v / 100, cCenter, hue).hex,
    );
  }, [hues, cube.chroma.range]);

  const chromaStrips = useMemo(() => {
    const lCenter = (cube.lightness.range.min + cube.lightness.range.max) / 200;
    return hues.map(
      (hue) => (v: number) => oklchToColor(lCenter, v / 100, hue).hex,
    );
  }, [hues, cube.lightness.range]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-4">
      {/* Reset / back to color picker */}
      <div className="flex-shrink-0 px-2 pb-1">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      {/* ToneSheets display area */}
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div className="h-full w-full overflow-hidden">
          <ToneSheetsContainer
            grids={grids}
            activeSheetIndex={activeIndex}
            onSheetClick={setActiveSheetIndex}
            onContainerClick={() => setActiveSheetIndex(-1)}
          />
        </div>
      </div>

      {/* Controls + Export bar */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3">
        <div className="flex flex-col items-stretch gap-3 md:flex-row">
          <HueAxisControl
            count={cube.hue.num}
            hueRange={cube.hue.range}
            onCountChange={(change) => resizeAxis("hue", change)}
            onRangeChange={(min, max) => setRange("hue", min, max)}
          />

          <SliderAxisControl
            title="Lightness (Vertical)"
            size={cube.lightness.num}
            range={cube.lightness.range}
            onSizeChange={(change) => resizeAxis("lightness", change)}
            onRangeChange={(min, max) => setRange("lightness", min, max)}
            strips={lightnessStrips}
          />

          <SliderAxisControl
            title="Chroma (Horizontal)"
            size={cube.chroma.num}
            range={cube.chroma.range}
            onSizeChange={(change) => resizeAxis("chroma", change)}
            onRangeChange={(min, max) => setRange("chroma", min, max)}
            strips={chromaStrips}
          />

          <ColorExporter grids={grids} />
        </div>
      </div>
    </div>
  );
};
