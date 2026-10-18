<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep dispatch history in the shared MineWatch state and pass it into the reporting view so tab changes never discard submitted reports; this is a simulated session-only console.
- Apply accessibility theme overrides through semantic CSS tokens on the document root so every workspace and floating control uses the same theme.
- Animate trend values with cancelable browser animation frames, respecting reduced motion, to preserve smooth transitions during rapid ZIP changes.
- Keep regional profiles and government resource definitions in a browser-safe mining-fields module, with the selected field and area in shared MineWatch state so all views derive the same regional context.
- Scope submitted dispatches by field in shared session state and derive regional samples separately so region changes preserve reports without mislabeling their locations.
- Keep USGS telemetry and report transmission simulated in the browser with cancelable timers; never imply that pilot interactions deliver data to government services.
- Render a dedicated analytical print view regardless of the selected tab so homeowner briefings always include the current regional model.
- Keep the public favicon separate from the CDN-hosted header logo so browser-only artwork changes do not alter page branding.
