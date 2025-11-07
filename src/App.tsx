import React, { useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { ErrorBoundary } from "@/components";
import { AppHeader } from "@/components/header";
import { ToneSheetsContainer } from "@/components/tone-sheet";
import { AxisControl } from "@/components/controls";
import { ColorExportModal } from "@/components/export";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks";
import "@/index.css";

const App: React.FC = () => {
  const {
    appState,
    handleColorSelect,
    handleAxisResize,
    handleSheetClick,
    handleContainerClick,
    updateRange,
  } = useAppState();
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Show color picker if no sheets exist
  if (appState.toneSheets.length === 0) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <AppHeader />
          <div className="flex items-center justify-center p-2 sm:p-4" style={{minHeight: 'calc(100vh - 120px)'}}>
            <div className="bg-white border border-gray-300">
              <ColorPicker onColorSelect={handleColorSelect} />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AppHeader />

        {/* Main layout: 2 vertical sections */}
        <div className="h-full flex flex-col p-2 sm:p-4">
          {/* Section 1: ToneSheets display area - flexible height with container */}
          <div className="flex-1 flex justify-center items-center p-4 min-h-0">
            <div className="w-full h-full overflow-hidden">
              <ToneSheetsContainer
                toneSheets={appState.toneSheets}
                activeSheetIndex={appState.activeSheetIndex}
                dimensions={appState.dimensions}
                chromaRange={appState.globalChromaRange}
                lightnessRange={appState.globalLightnessRange}
                onSheetClick={handleSheetClick}
                onContainerClick={handleContainerClick}
              />
            </div>
          </div>

          {/* Section 2: Axis controls - fixed height at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="w-full">
              {/* Desktop: Horizontal layout, Mobile: Vertical layout */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Hue Axis (Depth) */}
                <AxisControl
                  title="Hue (Depth)"
                  currentSize={appState.toneSheets.length}
                  currentRange={appState.globalHueRange}
                  maxRange={{ min: 0, max: 360 }}
                  onSizeChange={(change) => handleAxisResize("hue", change)}
                  onRangeChange={(min, max) => updateRange('hue', min, max)}
                  disabled={appState.toneSheets.length === 0}
                />

                {/* Lightness Axis (Vertical) */}
                <AxisControl
                  title="Lightness (Vertical)"
                  currentSize={appState.dimensions.lightness}
                  currentRange={appState.globalLightnessRange}
                  maxRange={{ min: 0, max: 100 }}
                  onSizeChange={(change) => handleAxisResize("lightness", change)}
                  onRangeChange={(min, max) => updateRange('lightness', min, max)}
                />

                {/* Chroma Axis (Horizontal) */}
                <AxisControl
                  title="Chroma (Horizontal)"
                  currentSize={appState.dimensions.chroma}
                  currentRange={appState.globalChromaRange}
                  maxRange={{ min: 0, max: 100 }}
                  onSizeChange={(change) => handleAxisResize("chroma", change)}
                  onRangeChange={(min, max) => updateRange('chroma', min, max)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Export button at bottom */}
          <div className="flex-shrink-0 p-4 text-center">
            <Button
              onClick={() => setIsExportModalOpen(true)}
              variant="primary"
              size="md"
            >
              Export Colors
            </Button>
          </div>
        </div>

        {/* Export Modal */}
        <ColorExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          toneSheets={appState.toneSheets}
          dimensions={appState.dimensions}
          chromaRange={appState.globalChromaRange}
          lightnessRange={appState.globalLightnessRange}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
