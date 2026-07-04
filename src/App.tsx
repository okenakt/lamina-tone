import { BuyMeACoffeeButton, ErrorBoundary } from "@/components";
import "@/index.css";
import { ColorPickerPage, PaletteEditorPage } from "@/pages";
import { Color } from "@/types";
import { useState } from "react";

export const App = () => {
  const [seedColor, setSeedColor] = useState<Color | null>(null);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-linear-to-br from-gray-50 to-gray-100">
        <header className="border-b border-gray-200 bg-white p-4 text-center">
          <h1
            className="text-2xl text-gray-800 sm:text-3xl"
            style={{ fontFamily: "'Sacramento', cursive", fontWeight: 400 }}
          >
            Lamina Tone
          </h1>
          <p className="text-xs text-gray-500">
            Layered Color Palette Generator
          </p>
        </header>

        <div className="flex flex-1 justify-center p-8">
          {seedColor === null ? (
            <ColorPickerPage onColorSelect={setSeedColor} />
          ) : (
            <PaletteEditorPage
              seedColor={seedColor}
              onReset={() => setSeedColor(null)}
            />
          )}
        </div>

        <footer className="flex flex-col items-center gap-2 p-4">
          <BuyMeACoffeeButton />
          <span className="text-xs text-gray-400">
            © 2026 Lamina Tone. All rights reserved.
          </span>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
