# MineWatch civic dashboard

## Build
- Replace the placeholder with a single-page dashboard for Pennsylvania's 8th Congressional District.
- Add the three requested ZIP-code profiles with dynamic risk levels, mining depth, soil stability, insurance guidance, and local vein context.
- Build an animated risk dial, responsive metric cards, and an authoritative charcoal/slate/safety-orange visual system.
- Add the heavy-rainfall simulator, including the +12 score change and groundwater warning.
- Add ZIP-aware congressional/state action guidance with official PA DEP insurance application links.
- Add a print-ready homeowner briefing triggered from the dashboard.

## Validation
- Verify switching ZIP codes and rainfall mode updates all related information.
- Verify print behavior, metadata, build health, and desktop/mobile layouts.

## Technical details
- Use the existing React, TanStack, Tailwind, and shared interface components.
- Keep data local and deterministic; no account, database, or external API is required.
- Use semantic design tokens and accessible controls with reduced-motion support.
