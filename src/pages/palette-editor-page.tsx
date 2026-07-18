import {
  SliderAxisControl,
  WheelAxisControl,
} from "@/components/axis-controls";
import { ColorExportModal } from "@/components/export";
import { ToneSheetsContainer } from "@/components/tone-sheet";
import { Button } from "@/components/ui/button";
import { useColorCube } from "@/hooks";
import {
  generateColorGrid,
  isOklchInSrgbGamut,
  oklchToColor,
  sampleAxis,
} from "@/lib/color-engine";
import { Color, ColorAxis } from "@/types";
import { useMemo, useState } from "react";

type PaletteEditorPageProps = {
  seedColor: Color;
  onReset: () => void;
};

const toEngineAxis = (axis: ColorAxis): ColorAxis => ({
  range: { min: axis.range.min / 100, max: axis.range.max / 100 },
  num: axis.num,
});

// Only Chroma shows this; every SliderAxisControl reserves the row regardless,
// so the card never resizes when the warning toggles.
const GAMUT_WARNING = "⚠ Gamut mapping may reduce perceptual uniformity.";

export const PaletteEditorPage = ({
  seedColor,
  onReset,
}: PaletteEditorPageProps) => {
  const { cube, resizeAxis, setRange } = useColorCube(seedColor);
  const [activeSheetIndex, setActiveSheetIndex] = useState(-1);

  const activeIndex = Math.min(activeSheetIndex, cube.hue.num - 1);
  const hues = sampleAxis(cube.hue, true);

  const grids = useMemo(() => {
    const lightness = toEngineAxis(cube.lightness);
    const chroma = toEngineAxis(cube.chroma);
    return hues.map((hue) => generateColorGrid(hue, lightness, chroma));
  }, [hues, cube.lightness, cube.chroma]);

  const hasOutOfGamutColors = useMemo(() => {
    const lightnesses = sampleAxis(toEngineAxis(cube.lightness));
    const chromas = sampleAxis(toEngineAxis(cube.chroma));
    return hues.some((hue) =>
      lightnesses.some((l) =>
        chromas.some((c) => !isOklchInSrgbGamut({ l, c, h: hue })),
      ),
    );
  }, [hues, cube.lightness, cube.chroma]);

  const hueGradient = useMemo(() => {
    const lCenter = (cube.lightness.range.min + cube.lightness.range.max) / 200;
    const cCenter = (cube.chroma.range.min + cube.chroma.range.max) / 200;
    return (v: number) => oklchToColor({ l: lCenter, c: cCenter, h: v }).hex;
  }, [cube.lightness.range, cube.chroma.range]);

  const lightnessStrips = useMemo(() => {
    const cCenter = (cube.chroma.range.min + cube.chroma.range.max) / 200;
    return hues.map(
      (hue) => (v: number) =>
        oklchToColor({ l: v / 100, c: cCenter, h: hue }).hex,
    );
  }, [hues, cube.chroma.range]);

  const chromaStrips = useMemo(() => {
    const lCenter = (cube.lightness.range.min + cube.lightness.range.max) / 200;
    return hues.map(
      (hue) => (v: number) =>
        oklchToColor({ l: lCenter, c: v / 100, h: hue }).hex,
    );
  }, [hues, cube.lightness.range]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="shrink-0">
        <Button
          onClick={onReset}
          className="border border-rule px-3 py-1.5 text-sm text-ink-2 hover:border-ink-3 hover:text-ink"
        >
          ← Back
        </Button>
      </div>

      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden">
        <ToneSheetsContainer
          grids={grids}
          activeSheetIndex={activeIndex}
          onSheetClick={setActiveSheetIndex}
          onContainerClick={() => setActiveSheetIndex(-1)}
        />
      </div>

      <div className="flex flex-col items-stretch gap-2 md:flex-row">
        <WheelAxisControl
          title="Hue (Depth)"
          size={cube.hue.num}
          range={cube.hue.range}
          onSizeChange={(change) => resizeAxis("hue", change)}
          onRangeChange={(min, max) => setRange("hue", min, max)}
          createGradient={hueGradient}
        />

        <SliderAxisControl
          title="Lightness (Vertical)"
          size={cube.lightness.num}
          range={cube.lightness.range}
          onSizeChange={(change) => resizeAxis("lightness", change)}
          onRangeChange={(min, max) => setRange("lightness", min, max)}
          createStrips={lightnessStrips}
        />

        <SliderAxisControl
          title="Chroma (Horizontal)"
          size={cube.chroma.num}
          range={cube.chroma.range}
          onSizeChange={(change) => resizeAxis("chroma", change)}
          onRangeChange={(min, max) => setRange("chroma", min, max)}
          createStrips={chromaStrips}
          message={GAMUT_WARNING}
          messageStyle={{
            color: "var(--color-warn)",
            visibility: hasOutOfGamutColors ? "visible" : "hidden",
          }}
        />
      </div>

      <div className="flex justify-center">
        <Button
          className="bg-accent text-accent-ink hover:bg-accent-strong"
          onClick={() => setIsModalOpen(true)}
        >
          Export
        </Button>
        {isModalOpen && (
          <ColorExportModal
            onClose={() => setIsModalOpen(false)}
            grids={grids}
          />
        )}
      </div>
    </div>
  );
};
