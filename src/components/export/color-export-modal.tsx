import { Button } from "@/components/ui/button";
import { Color } from "@/types";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape and move initial focus to the close control.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[640px] max-h-[90vh] w-[720px] max-w-[95vw] flex-col rounded-[12px] border border-rule bg-paper shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-rule p-6">
          <h2
            id={titleId}
            className="font-display text-xl font-medium tracking-[-0.01em] text-ink"
          >
            Export Colors
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close export dialog"
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-2xl text-ink-3 outline-none transition-colors duration-200 ease-out hover:bg-paper-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
          >
            ×
          </button>
        </div>

        <div className="border-b border-rule p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`${titleId}-structure`}
                className="text-sm font-medium text-ink-2"
              >
                Structure:
              </label>
              <select
                id={`${titleId}-structure`}
                value={selectedStructure}
                onChange={(e) =>
                  setSelectedStructure(e.target.value as ExportStructure)
                }
                className="rounded-[8px] border border-rule bg-paper px-4 py-2 text-ink outline-none transition-colors duration-200 ease-out hover:border-ink-3 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus"
              >
                <option value="nested">Nested Object</option>
                <option value="flat">Flat Object</option>
                <option value="array">3D Array</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor={`${titleId}-format`}
                className="text-sm font-medium text-ink-2"
              >
                Color:
              </label>
              <select
                id={`${titleId}-format`}
                value={selectedColorFormat}
                onChange={(e) =>
                  setSelectedColorFormat(e.target.value as ColorFormat)
                }
                className="rounded-[8px] border border-rule bg-paper px-4 py-2 text-ink outline-none transition-colors duration-200 ease-out hover:border-ink-3 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-auto rounded-[12px] border border-rule bg-paper-2 p-4">
            <div className="w-full font-mono text-sm">
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span className="whitespace-pre text-ink-2">{line.text}</span>
                  {line.color && (
                    <span
                      className="ml-auto h-4 w-16 rounded-[4px] border border-rule"
                      style={{ backgroundColor: line.color.hex }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-rule p-6">
          <Button
            onClick={handleCopy}
            aria-live="polite"
            className={`px-4 py-2 text-sm ${
              copied
                ? "bg-success text-paper"
                : "bg-accent text-accent-ink hover:bg-accent-strong"
            }`}
          >
            {copied ? "Copied ✓" : "Copy to Clipboard"}
          </Button>
        </div>
      </div>
    </div>
  );
};
