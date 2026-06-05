import { Color } from "@/types";

export async function copyColorToClipboard(color: Color): Promise<void> {
  await navigator.clipboard.writeText(color.hex);
}
