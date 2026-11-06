# Portfolio site

Live at https://jasminekst.github.io (GitHub Pages, deploys from `main`).

- `index.html` — all page content. Each project is an `<article class="project">`; add it to the index list near the top too.
- `assets/style.css` — colors and fonts are tokens at the top (`:root`), with dark-mode values below.
- Plain HTML/CSS, no build step. Push to `main` and the site updates in about a minute.

Preview locally: `python3 -m http.server 8000`, then open http://localhost:8000.

After changing CSS/JS, bump the `?v=` stamp on the asset links in `index.html` so browsers fetch the new files instead of a cached copy (GitHub Pages caches for 10 minutes).
