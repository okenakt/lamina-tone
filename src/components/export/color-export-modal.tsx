import { Button } from "@/components/ui/button";
import { Color } from "@/types";
import { useMemo, useState } from "react";

type ColorExportModalProps = {
  onClose: () => void;
  grids: Color[][][]; // one generated color grid per hue sheet
};

type ExportStructure = "nested" | "flat" | "array";
type ColorFormat = "hex" | "rgb";
// A single rendered line of output; `color` is set only on lines that carry a
// color value, so the preview swatch can be aligned to that exact row.
type Line = { text: string; color?: Color };

export const ColorExportModal = ({ onClose, grids }: ColorExportModalProps) => {
  const [selectedStructure, setSelectedStructure] =
    useState<ExportStructure>("nested");
  const [selectedColorFormat, setSelectedColorFormat] =
    useState<ColorFormat>("hex");
  const [copied, setCopied] = useState(false);

  const lines = useMemo<Line[]>(() => {
    const valueLiteral = (color: Color): string =>
      selectedColorFormat === "hex"
        ? `"${color.hex}"`
        : `[${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}]`;

    const comma = (index: number, length: number): string =>
      index < length - 1 ? "," : "";

    switch (selectedStructure) {
      case "nested": {
        const out: Line[] = [{ text: "{" }];
        grids.forEach((sheet, h) => {
          out.push({ text: `  "h${h}": {` });
          sheet.forEach((row, l) => {
            out.push({ text: `    "l${l}": {` });
            row.forEach((color, c) => {
              out.push({
                text: `      "c${c}": ${valueLiteral(color)}${comma(c, row.length)}`,
                color,
              });
            });
            out.push({ text: `    }${comma(l, sheet.length)}` });
          });
          out.push({ text: `  }${comma(h, grids.length)}` });
        });
        out.push({ text: "}" });
        return out;
      }

      case "flat": {
        const out: Line[] = [{ text: "{" }];
        const entries = grids.flatMap((sheet, h) =>
          sheet.flatMap((row, l) =>
            row.map((color, c) => ({ key: `h${h}-l${l}-c${c}`, color })),
          ),
        );
        entries.forEach(({ key, color }, i) => {
          out.push({
            text: `  "${key}": ${valueLiteral(color)}${comma(i, entries.length)}`,
            color,
          });
        });
        out.push({ text: "}" });
        return out;
      }

      case "array": {
        const out: Line[] = [{ text: "[" }];
        grids.forEach((sheet, h) => {
          out.push({ text: "  [" });
          sheet.forEach((row, l) => {
            out.push({ text: "    [" });
            row.forEach((color, c) => {
              out.push({
                text: `      ${valueLiteral(color)}${comma(c, row.length)}`,
                color,
              });
            });
            out.push({ text: `    ]${comma(l, sheet.length)}` });
          });
          out.push({ text: `  ]${comma(h, grids.length)}` });
        });
        out.push({ text: "]" });
        return out;
      }
    }
  }, [grids, selectedStructure, selectedColorFormat]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lines.map((l) => l.text).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[640px] max-h-[90vh] w-[720px] max-w-[95vw] flex-col rounded-lg bg-white shadow-xl">
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Structure:
              </label>
              <select
                value={selectedStructure}
                onChange={(e) =>
                  setSelectedStructure(e.target.value as ExportStructure)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="nested">Nested Object</option>
                <option value="flat">Flat Object</option>
                <option value="array">3D Array</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
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
          <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="w-full font-mono text-sm">
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span className="whitespace-pre text-gray-700">
                    {line.text}
                  </span>
                  {line.color && (
                    <span
                      className="ml-auto h-4 w-16 rounded border border-gray-200"
                      style={{ backgroundColor: line.color.hex }}
                    />
                  )}
                </div>
              ))}
            </div>
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
