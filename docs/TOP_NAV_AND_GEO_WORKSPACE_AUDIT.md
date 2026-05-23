# Top Nav and Geo Workspace Audit

Date: 2026-05-23

## Scope
- Authenticated top navigation labels in the app shell.
- Geo Workspace and Geo Workspace Preview route copy.
- Live audit performed in the same authenticated shell session used for browser verification.

## Findings
- Top navigation now labels geo destinations as preview surfaces: `Map (Preview)` and `Map Portfolio (Preview)`.
- Geo Workspace now exposes a visible preview banner that states the surface is an internal beta preview and does not provide official GIS, municipality, zoning, TKGM, TUCBS, or CSB proof.
- The overlay panel copy was softened from a production-style claim to preview wording so the page no longer implies fully configured production overlays when the page is empty.
- The live map surface still shows empty layer groups and diagnostic panels, so the honest preview labels match the current runtime state.

## Verification
- Web build completed successfully with `npm run build --prefix apps/web`.
- Live authenticated browser checks earlier in the session confirmed the geo route, top nav, and empty layer-state behavior.

## Follow-up
- Keep the geo surfaces labeled as preview until real configured layers and production-grade evidence-backed overlays are implemented.
