import { Button } from "@/components/ui/button";
import { Color } from "@/types";
import { useState } from "react";

type ColorExportModalProps = {
  onClose: () => void;
  grids: Color[][][]; // one generated color grid per hue sheet
};

type ExportFormat = "json" | "typescript" | "css" | "python";
type ColorFormat = "hex" | "rgb";

export const ColorExportModal = ({ onClose, grids }: ColorExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [selectedColorFormat, setSelectedColorFormat] =
    useState<ColorFormat>("hex");
  const [copied, setCopied] = useState(false);

  const formatColors = (format: ExportFormat): string => {
    // Create palette object with h-Z, l-Y, c-X indexing
    const createPaletteObject = () => {
      const palette: Record<
        string,
        Record<string, Record<string, string | [number, number, number]>>
      > = {};

      grids.forEach((sheet, hIndex) => {
        const hKey = `h-${hIndex}`;
        palette[hKey] = {};

        sheet.forEach((row, lIndex) => {
          const lKey = `l-${lIndex}`;
          palette[hKey][lKey] = {};

          row.forEach((color, cIndex) => {
            const cKey = `c-${cIndex}`;
            palette[hKey][lKey][cKey] =
              selectedColorFormat === "hex"
                ? color.hex
                : [color.rgb.r, color.rgb.g, color.rgb.b];
          });
        });
      });

      return palette;
    };

    switch (format) {
      case "json":
        return JSON.stringify(createPaletteObject(), null, 2);

      case "typescript": {
        const palette = createPaletteObject();
        let tsOutput = "const palette = {\n";

        Object.keys(palette).forEach((hKey) => {
          tsOutput += `  "${hKey}": {\n`;
          Object.keys(palette[hKey]).forEach((lKey) => {
            tsOutput += `    "${lKey}": {\n`;
            Object.keys(palette[hKey][lKey]).forEach((cKey) => {
              const value = palette[hKey][lKey][cKey];
              const formattedValue = Array.isArray(value)
                ? `[${value.join(", ")}]`
                : `'${value}'`;
              tsOutput += `      "${cKey}": ${formattedValue},\n`;
            });
            tsOutput += "    },\n";
          });
          tsOutput += "  },\n";
        });

        tsOutput += "} as const;";
        return tsOutput;
      }

      case "css": {
        const cssPalette = createPaletteObject();
        let cssOutput = ":root {\n";

        Object.keys(cssPalette).forEach((hKey) => {
          Object.keys(cssPalette[hKey]).forEach((lKey) => {
            Object.keys(cssPalette[hKey][lKey]).forEach((cKey) => {
              const value = cssPalette[hKey][lKey][cKey];
              const formattedValue = Array.isArray(value)
                ? `rgb(${value.join(", ")})`
                : value;
              cssOutput += `  --palette-${hKey}-${lKey}-${cKey}: ${formattedValue};\n`;
            });
          });
        });

        cssOutput += "}";
        return cssOutput;
      }

      case "python": {
        const pyPalette = createPaletteObject();
        let pyOutput = "palette = {\n";

        Object.keys(pyPalette).forEach((hKey) => {
          pyOutput += `    "${hKey}": {\n`;
          Object.keys(pyPalette[hKey]).forEach((lKey) => {
            pyOutput += `        "${lKey}": {\n`;
            Object.keys(pyPalette[hKey][lKey]).forEach((cKey) => {
              const value = pyPalette[hKey][lKey][cKey];
              const formattedValue = Array.isArray(value)
                ? `(${value.join(", ")})`
                : `"${value}"`;
              pyOutput += `            "${cKey}": ${formattedValue},\n`;
            });
            pyOutput += "        },\n";
          });
          pyOutput += "    },\n";
        });

        pyOutput += "}";
        return pyOutput;
      }

      default:
        return "";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatColors(selectedFormat));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800">Export Colors</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Format:
              </label>
              <select
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as ExportFormat)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="typescript">TypeScript</option>
                <option value="css">CSS Variables</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Color:
              </label>
              <select
                value={selectedColorFormat}
                onChange={(e) =>
                  setSelectedColorFormat(e.target.value as ColorFormat)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="relative h-full">
            <pre className="h-full overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm break-words whitespace-pre-wrap">
              <code>{formatColors(selectedFormat)}</code>
            </pre>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 p-6">
          <Button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm text-white ${
              copied
                ? "bg-green-400 hover:bg-green-500 focus:ring-green-400"
                : "bg-blue-400 hover:bg-blue-500 focus:ring-blue-400"
            }`}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      </div>
    </div>
  );
};
