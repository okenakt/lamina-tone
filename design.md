# Design — Lamina Tone

A locked design system for this app. Every page/component redesign reads this
file before emitting code. Do not regenerate per view — extend or amend this
file when the system needs to grow.

## Genre

modern-minimal — a colour tool. The chrome stays deliberately quiet so the
generated palette is the only saturated thing on screen. Single restrained
accent, near-neutral surfaces, confident but calm typography.

## Vibe

"Calm & refined." Restraint carries the design: one accent, generous
whitespace, hairline borders, no gradients, no chromatic floods.

## Macrostructure family

This is a two-view application, not a marketing site.

- App views: **Workbench** — a fixed header (wordmark centred), a central work
  surface (picker, then the tone-sheet stack), and grouped controls beneath.
  The two views (picker / editor) share the header, footer, type, colour, and
  control voice; they differ only in the work surface.

## Theme

Custom OKLCH palette. Neutrals are cool-tinted (hue 250) so they never fight a
warm generated colour. The accent is a restrained slate-blue (hue 250, shared
with the neutrals), so one token serves both as a solid fill (white text) and as
accent text/borders on paper. A warm marker (hue 45) marks the "max" end of a
directed range opposite the cool "min".

- `--color-paper`    oklch(98.5% 0.003 250)
- `--color-paper-2`  oklch(96.5% 0.004 250)
- `--color-paper-3`  oklch(93.5% 0.006 250)
- `--color-rule`     oklch(89% 0.006 250)
- `--color-ink`      oklch(27% 0.012 250)
- `--color-ink-2`    oklch(45% 0.012 250)
- `--color-ink-3`    oklch(56% 0.01 250)
- `--color-accent`        oklch(52% 0.1 250)   (fill + accent text on paper)
- `--color-accent-strong` oklch(46% 0.11 250)  (fill hover)
- `--color-accent-ink`    oklch(99% 0 0)       (text on the accent fill)
- `--color-accent-warm`   oklch(56% 0.16 45)   (warm "max" endpoint)
- `--color-focus`    oklch(58% 0.13 250)
- `--color-warn`     oklch(52% 0.12 65)
- `--color-success`  oklch(52% 0.09 155)

## Typography

- Display: Fraunces, weight 500, style normal (roman). Wordmark + headings.
- Body:    Inter, weight 400/500.
- Mono:    JetBrains Mono, weight 400/500. Hex values, numeric readouts, code.
- Display tracking: -0.01em.

## Spacing

4-point named scale (see `tokens.css`). In-app this maps to Tailwind's own
4-point utilities (`gap-4`, `p-6`, …). Use named tokens / utilities, not raw px.

## Motion

- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); `--ease-in-out`
  cubic-bezier(0.65, 0, 0.35, 1). Never the browser default.
- Durations: 200 ms (state), 300 ms (spatial, e.g. sheet reveal).
- Animate `transform` / `opacity` only.
- Reduced-motion: spatial motion collapses to <= 150 ms opacity crossfade.

## Microinteractions stance

- Silent success (a copy confirms with a brief inline label change, no toast).
- Focus rings appear instantly (never animated), tokenised on `--color-focus`.
- Hover tooltips follow the cursor; the colour tooltip is the one exception and
  is intentional to the tool.

## CTA voice

- Primary CTA: solid `--color-accent` fill, `--color-accent-ink` text, 8 px
  radius, `hover:--color-accent-strong`. Verb-led copy ("Start", "Export").
- Secondary CTA: hairline `--color-rule` border, `--color-ink-2` text,
  border/text darken on hover. ("Back".)
- Steppers / neutral controls: `--color-paper-3` surface (one step darker than
  the `--color-paper-2` card so they read as controls), `--color-ink-2` glyph,
  `hover:--color-rule`. Never semantic red/green for non-destructive actions.

## Accessibility floor

- Every interactive element ships all relevant states incl. `:focus-visible`.
- Pointer-driven controls (slider / wheel / pad) also carry `role`, ARIA value
  metadata, `tabIndex`, and arrow-key operation.
- The export dialog is a real `role="dialog"` (aria-modal, Esc, backdrop
  close, initial focus, labelled close control).
- Body text >= 4.5:1; UI boundaries and large text >= 3:1.

## What views MUST share

The wordmark (Fraunces), the single accent and its placement (chrome only,
<= ~5% of any viewport), the display/body/mono fonts, the CTA voice, and the
control voice (handle shape, focus ring, hairline surfaces).

## Exports

See `tokens.css` for the portable `:root` mirror of every token above.
