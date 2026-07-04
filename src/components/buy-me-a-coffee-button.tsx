import { useEffect, useRef } from "react";

/**
 * Builds the official Buy Me a Coffee button markup. Exposed on `window` by the
 * widget script once it loads. Argument order mirrors the official snippet's
 * `data-*` attributes.
 */
type BmcBtnWidget = (
  text: string,
  slug: string,
  color: string,
  emoji: string,
  font: string,
  fontColor: string,
  outlineColor: string,
  coffeeColor: string,
) => string;

declare global {
  interface Window {
    bmcBtnWidget?: BmcBtnWidget;
  }
}

const BMC_SCRIPT_SRC =
  "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";

// Mirrors the official widget snippet. The script's trailing document.writeln()
// only runs for a <script data-name="bmc-button"> tag, so we load it without
// that attribute to obtain window.bmcBtnWidget without wiping the document, then
// render its returned HTML ourselves.
const BMC_CONFIG = {
  text: "Buy me a coffee",
  color: "#FFDD00",
  emoji: "",
  font: "Cookie",
  fontColor: "#000000",
  outlineColor: "#000000",
  coffeeColor: "#ffffff",
} as const;

let widgetScriptPromise: Promise<void> | null = null;

const loadBmcWidget = (): Promise<void> => {
  if (window.bmcBtnWidget) {
    return Promise.resolve();
  }
  if (widgetScriptPromise) {
    return widgetScriptPromise;
  }

  widgetScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = BMC_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      widgetScriptPromise = null;
      reject(new Error("Failed to load the Buy Me a Coffee widget script"));
    };
    document.head.appendChild(script);
  });

  return widgetScriptPromise;
};

/**
 * Renders the official Buy Me a Coffee button in the footer, driven by the
 * `VITE_BMC_USERNAME` environment variable. Returns `null` when the username is
 * unset so the button is simply omitted.
 */
export const BuyMeACoffeeButton = () => {
  const username = import.meta.env.VITE_BMC_USERNAME;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    let cancelled = false;
    loadBmcWidget()
      .then(() => {
        if (cancelled || !containerRef.current || !window.bmcBtnWidget) {
          return;
        }
        containerRef.current.innerHTML = window.bmcBtnWidget(
          BMC_CONFIG.text,
          username,
          BMC_CONFIG.color,
          BMC_CONFIG.emoji,
          BMC_CONFIG.font,
          BMC_CONFIG.fontColor,
          BMC_CONFIG.outlineColor,
          BMC_CONFIG.coffeeColor,
        );
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!username) {
    return null;
  }

  return (
    <>
      {/* The widget's own script injects a fixed-size `.bmc-btn` <style> block;
          override it here since we can't pass a size option through the API. */}
      <style>{`
        .bmc-compact .bmc-btn {
          height: 38px;
          min-width: 0;
          padding: 0 14px;
          font-size: 14px;
          line-height: 18px;
          border-radius: 8px;
        }
        .bmc-compact .bmc-btn svg {
          height: 18px !important;
          transform: none;
        }
        .bmc-compact .bmc-btn-text {
          margin-left: 6px;
        }
      `}</style>
      <div ref={containerRef} className="bmc-compact" />
    </>
  );
};
