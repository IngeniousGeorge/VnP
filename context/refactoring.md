# Refactoring Notes

## Dead code identified — pending removal

### 1. Three orphaned CSS variables in `Layout.astro`

`--color-facebook-hover`, `--color-facebook-text`, `--color-facebook-bg` — defined in `:root`
but consumed exclusively by the post card styles (`actu-card-link:hover`, `actu-card-date`,
`actu-card-image`) which were removed when the hardcoded Facebook post cards were stripped from
`NosActualites`. Confirmed unused by codebase-wide grep.

### 2. Dead mobile breakpoint rules in `HeroCircles.astro`

The entire `<section class="hero-circles">` is `display: none` on mobile. Yet the
`@media (max-width: 768px)` block contains 5 size-adjustment rules for `.circles-container`,
`.circle`, `.circle-image`, `.circle-title`, and `.circle-icon` — none of which can ever render.
Likely carried over from before the mobile-hide decision was made.

### 3. Dead `strong` rule in `LaBoutique.astro`

A scoped `strong { font-weight: 700; }` rule that can never match anything. All text content
is injected via `set:html`, which bypasses Astro's scoping (injected elements do not receive the
`data-astro-cid-*` attribute), and there are no literal `<strong>` elements in the template.
Astro compiles this to `strong[data-astro-cid-xxx]` — a selector with zero matches.

### 4. Same dead `strong` rule in `PhotoTextSection.astro`

Identical situation to `LaBoutique.astro` — same cause, same effect.
