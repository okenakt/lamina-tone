import iconUrl from "@/assets/lamina-tone.png";
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
        <header className="flex items-center justify-between border-b border-rule bg-paper p-4">
          <div className="flex items-center gap-3">
            <img
              src={iconUrl}
              alt=""
              className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
            />
            <div>
              <h1 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink sm:text-3xl">
                Lamina Tone
              </h1>
              <p className="text-xs text-ink-3">
                Layered Color Palette Generator
              </p>
            </div>
          </div>
          <GitHubLink />
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
          <span className="text-xs text-ink-3">© 2026 Lamina Tone</span>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
