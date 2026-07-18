import { BuyMeACoffeeButton, ErrorBoundary } from "@/components";
import { GitHubLink } from "@/components/ui/github-link";
import "@/index.css";
import { ColorPickerPage, PaletteEditorPage } from "@/pages";
import { Color } from "@/types";
import { useState } from "react";

export const App = () => {
  const [seedColor, setSeedColor] = useState<Color | null>(null);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-paper">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-rule bg-paper p-4">
          <div />
          <div className="text-center">
            <h1 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink sm:text-3xl">
              Lamina Tone
            </h1>
            <p className="text-xs text-ink-3">Layered Color Palette Generator</p>
          </div>
          <div className="flex justify-end">
            <GitHubLink />
          </div>
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
          <span className="text-xs text-ink-3">
            © 2026 Lamina Tone — made for building palettes in OKLCH
          </span>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
