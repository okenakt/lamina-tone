import { oklchToColor } from "@/lib/color-engine";
import { Color } from "@/types";

export const INITIAL_COLOR: Color = oklchToColor({ l: 0.7, c: 0.4, h: 30 });
