import React, { useState, useMemo } from "react";
import { ToneSheetData } from "@/types";
import { generateColorGrid } from "@/utils/color-space";
import { Button } from "@/components/ui/button";

interface ColorExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  toneSheets: ToneSheetData[];
  dimensions: { lightness: number; chroma: number };
  chromaRange: { min: number; max: number };
  lightnessRange: { min: number; max: number };
}

type ExportFormat = 'json' | 'typescript' | 'css' | 'python';
type ColorFormat = 'hex' | 'rgb';

export const ColorExportModal: React.FC<ColorExportModalProps> = ({
  isOpen,
  onClose,
  toneSheets,
  dimensions,
  chromaRange,
  lightnessRange,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [selectedColorFormat, setSelectedColorFormat] = useState<ColorFormat>('hex');
  const [copied, setCopied] = useState(false);

  // Generate all colors for all sheets in 3D array structure
  const allColors = useMemo(() => {
    const gridSize = { rows: dimensions.lightness, cols: dimensions.chroma };
    
    return toneSheets.map(sheet => 
      generateColorGrid(sheet.hue, gridSize, chromaRange, lightnessRange)
    );
  }, [toneSheets, dimensions, chromaRange, lightnessRange]);

  const formatColors = (format: ExportFormat): string => {
    // Create palette object with h-Z, l-Y, c-X indexing
    const createPaletteObject = () => {
      const palette: Record<string, Record<string, Record<string, string>>> = {};
      
      allColors.forEach((sheet, hIndex) => {
        const hKey = `h-${hIndex}`;
        palette[hKey] = {};
        
        sheet.forEach((row, lIndex) => {
          const lKey = `l-${lIndex}`;
          palette[hKey][lKey] = {};
          
          row.forEach((color, cIndex) => {
            const cKey = `c-${cIndex}`;
            palette[hKey][lKey][cKey] = selectedColorFormat === 'hex' ? color.hex : color.rgb;
          });
        });
      });
      
      return palette;
    };

    switch (format) {
      case 'json':
        return JSON.stringify(createPaletteObject(), null, 2);

      case 'typescript': {
        const palette = createPaletteObject();
        let tsOutput = 'const palette = {\n';
        
        Object.keys(palette).forEach((hKey) => {
          tsOutput += `  "${hKey}": {\n`;
          Object.keys(palette[hKey]).forEach((lKey) => {
            tsOutput += `    "${lKey}": {\n`;
            Object.keys(palette[hKey][lKey]).forEach((cKey) => {
              const value = palette[hKey][lKey][cKey];
              const formattedValue = selectedColorFormat === 'hex' 
                ? `'${value}'` 
                : `[${value.join(', ')}]`;
              tsOutput += `      "${cKey}": ${formattedValue},\n`;
            });
            tsOutput += '    },\n';
          });
          tsOutput += '  },\n';
        });
        
        tsOutput += '} as const;';
        return tsOutput;
      }

      case 'css': {
        const cssPalette = createPaletteObject();
        let cssOutput = ':root {\n';
        
        Object.keys(cssPalette).forEach((hKey) => {
          Object.keys(cssPalette[hKey]).forEach((lKey) => {
            Object.keys(cssPalette[hKey][lKey]).forEach((cKey) => {
              const value = cssPalette[hKey][lKey][cKey];
              const formattedValue = selectedColorFormat === 'hex' 
                ? value 
                : `rgb(${value.join(', ')})`;
              cssOutput += `  --palette-${hKey}-${lKey}-${cKey}: ${formattedValue};\n`;
            });
          });
        });
        
        cssOutput += '}';
        return cssOutput;
      }

      case 'python': {
        const pyPalette = createPaletteObject();
        let pyOutput = 'palette = {\n';
        
        Object.keys(pyPalette).forEach((hKey) => {
          pyOutput += `    "${hKey}": {\n`;
          Object.keys(pyPalette[hKey]).forEach((lKey) => {
            pyOutput += `        "${lKey}": {\n`;
            Object.keys(pyPalette[hKey][lKey]).forEach((cKey) => {
              const value = pyPalette[hKey][lKey][cKey];
              const formattedValue = selectedColorFormat === 'hex' 
                ? `"${value}"` 
                : `(${value.join(', ')})`;
              pyOutput += `            "${cKey}": ${formattedValue},\n`;
            });
            pyOutput += '        },\n';
          });
          pyOutput += '    },\n';
        });
        
        pyOutput += '}';
        return pyOutput;
      }

      default:
        return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatColors(selectedFormat));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Export Colors</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Format Selection */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Format:</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="json">JSON</option>
                <option value="typescript">TypeScript</option>
                <option value="css">CSS Variables</option>
                <option value="python">Python</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Color:</label>
              <select
                value={selectedColorFormat}
                onChange={(e) => setSelectedColorFormat(e.target.value as ColorFormat)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
              </select>
            </div>
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="relative h-full">
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full overflow-auto text-sm font-mono whitespace-pre-wrap break-words">
              <code>{formatColors(selectedFormat)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button
            onClick={handleCopy}
            variant={copied ? 'success' : 'primary'}
            size="md"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};