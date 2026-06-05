import { Button } from "@/components/ui/button";
import { Color } from "@/types";
import { useState } from "react";
import { ColorExportModal } from "./color-export-modal";

type ColorExporterProps = {
  grids: Color[][][]; // one generated color grid per hue sheet
};

// Self-contained export concern: the trigger button plus the modal and its
// open/close state. Decoupled from tone-sheet editing — it only reads the
// already-generated color grids passed in.
export const ColorExporter = ({ grids }: ColorExporterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center md:ml-2 md:justify-end md:self-center">
        <Button onClick={() => setIsOpen(true)} variant="primary" size="md">
          Export Colors
        </Button>
      </div>
      <ColorExportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        grids={grids}
      />
    </>
  );
};
