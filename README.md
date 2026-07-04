# Lamina Tone

Lamina Tone is a layered color palette generator with a focus on perceptual uniformity.

## How it works

1. Pick a seed color with the color wheel and lightness/chroma pad, RGB
   sliders, hex input, or the random-color link.
2. The palette editor opens with a single hue sheet and a single sample
   point, seeded from a Hue/Lightness/Chroma range around the seed color.
3. Widen the Hue, Lightness, and Chroma axis ranges and sample counts to grow
   the grid; each sampled hue renders as its own tone sheet. Hover a cell to
   preview it, and click to copy its hex value.
4. Export the generated grids as a nested object, flat object, or 3D array,
   with hex or RGB values.

See [Color Model and Gamut Mapping](#color-model-and-gamut-mapping) for how
colors are generated and mapped to sRGB.

## Color Model and Gamut Mapping

Colors are authored and generated in [OKLCH](https://oklch.com/), a perceptually
uniform color space, then converted to sRGB for display and export.

- **Lightness (`l`)**: normalized 0–1, matching OKLCH's native range.
- **Chroma (`c`)**: normalized 0–1, where `1` maps to a fixed native OKLCH
  chroma of `0.4`. This keeps the Chroma axis a stable 0–100 range regardless
  of hue, instead of exposing OKLCH's hue-dependent native chroma ceiling.
- **Hue (`h`)**: degrees, 0–360, unchanged from OKLCH.

### Why gamut mapping is needed

Not every OKLCH color is representable in sRGB — high-chroma colors in
particular fall outside the display gamut, especially at very low or very high
lightness. For every requested color, the color engine:

1. Keeps Lightness and Hue fixed.
2. Tests whether the requested Chroma is representable in sRGB.
3. If it isn't, binary-searches Chroma downward until it lands on the sRGB
   boundary.
4. Converts the mapped OKLCH value to integer RGB and hex.

### Known side effect: color convergence

Because out-of-gamut colors are clipped down to the same sRGB boundary,
multiple distinct requested Chroma values can end up mapping to the same
displayable color once they're past the gamut edge. In the tone sheets, this
shows up as adjacent cells looking identical or nearly identical even though
their requested Chroma differs, and it breaks the otherwise-uniform spacing
between samples. The palette editor detects this and shows "⚠ Gamut mapping
may reduce perceptual uniformity." under the Chroma control whenever any
color in the visible grids has been clipped this way.

### Picker canvas vs. generated swatches

The seed color wheel/pad paints its gradients with a separate, faster
conversion that clips out-of-range RGB channels directly instead of
gamut-mapping. It is only used to render the picker canvas efficiently — every
generated and exported swatch goes through the gamut-mapped conversion above.

## Development

- `npm run dev` — start the Vite development server
- `npm run build` — run TypeScript project builds and create a production
  bundle
- `npm run lint` — run ESLint
- `npm run format` — format the repository with Prettier
- `npm run format:check` — check formatting without writing
- `npm run preview` — preview the production bundle
