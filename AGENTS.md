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
