# FHE Traders — Solar, Electrical & Security

Static marketing and catalog site for FHE Traders. No build step, no framework,
no backend — plain HTML, CSS and JavaScript. Enquiries go out over WhatsApp
rather than through a cart or checkout.

## Running it locally

Any static file server works. A small threaded one is included:

```bash
python serve.py
# then open http://127.0.0.1:8899
```

Use this rather than `python -m http.server`, which is single-threaded and
leaves the home-page hero video queued behind the images. `serve.py` also sends
`Cache-Control: no-store` so edits show on refresh — it's a development helper
and is **not** needed on real hosting.

## Deploying

Upload the folder as-is to any static host (Netlify, Cloudflare Pages, shared
hosting). Nothing needs compiling. `serve.py` doesn't need to go up.

## Layout

```
*.html                     one file per page
css/style.css              all styling
js/products-data.js        the product catalog (single source of truth)
js/variants.js             per-variant descriptions and photos
js/main.js                 nav, filters, lightbox, WhatsApp links, share
js/search.js               header search
js/wishlist.js             wishlist (localStorage)
js/config.js               WhatsApp number, business name, hours
js/intro.js                home page brand intro (home page only)
images/products/           product photos, named <product-id>.jpg
images/products/variants/  per-variant photos (fittings items)
images/site/               page photography, hero video, logo files
```

## The home page

The landing page is a category chooser, not a product listing. The twelve
tiles in the hero link to `products.html#<category>`; `wireProductFilter()` in
`js/main.js` reads that hash and applies it as the active filter, so the tile
lands the visitor on a pre-filtered catalog. Adding or removing a category
means editing the tiles in `index.html` and the matching filter button in
`products.html` — nothing else.

## The brand intro

`js/intro.js` runs on the home page only. The logo draws itself centre-screen,
the finished artwork cross-fades in over the outline, then the whole thing
flies into the header while the hero copy rises behind it (~2.4s in total).

The drawing is an SVG outline traced from the logo's alpha channel, inlined in
`index.html`. Every path carries `pathLength="1"`, so one `stroke-dashoffset`
keyframe strokes them all at a matched speed regardless of their real length.
`images/site/logo-outline.svg` is the traced source those inline paths came
from — nothing loads it at runtime; it is kept so the outline can be
regenerated if the logo changes.

The page starts hidden (`class="intro-pending"` on `<body>`), so every exit
path has to clear it: the animation's own completion, an `error` handler on
the artwork, a 6s failsafe, a `prefers-reduced-motion` check, and a
`<noscript>` block in the head. Change the timings in the `BEATS` object at
the top of `js/intro.js`.

### Replacing the logo

`images/site/` holds `logo.png` (512px, the intro), `logo-mark.png` (96px,
header and footer) and `favicon-32.png`. All three are cut from one square
source with a transparent background. If you re-cut them, key on *saturation*
rather than brightness — the mark is a saturated red on a neutral plate, and a
brightness key keeps the grey drop shadow, which is invisible on white and
obvious on the navy footer.

## Editing the catalog

`js/products-data.js` drives the products grid, the detail pages and search.
Each entry is a brand- or type-level card; sizes and capacities live in
`models`, which render as selectable chips on the detail page.

Adding a product photo needs no code change — drop a file into
`images/products/` named after the product's `id` (e.g.
`images/products/inverex-inverter.jpg`). If the file is missing, the card falls
back to a colour-coded category icon.

## Contact details

`js/config.js` holds the WhatsApp number (`923397200213` — country code, no
`+` or dashes). Every enquiry button on the site is built from it at runtime
by `wireWhatsAppButtons()`, so it is the only place that number is written.

Note that `config.js` assigns to `window.SITE_CONFIG`, not a bare `const` — a
top-level `const` is not a window property, so `window.SITE_CONFIG` read back
as `undefined` and every link silently fell through to a hard-coded fallback.

Email, phone and the social profiles are plain hrefs in the page markup — they
work without JS and search engines can see them. They appear in the footer of
every page and in the contact card on `contact.html`:

- Email `fhepower04@gmail.com`
- Phone / WhatsApp `0339-7200213`
- Instagram [@futurehomeelect24](https://www.instagram.com/futurehomeelect24/)
- TikTok [@fhesolar24](https://www.tiktok.com/@fhesolar24)

The **Facebook** icon in the footer still points at `#` — no page URL has been
supplied yet. Either fill it in on all 14 pages or drop the link.

## Known placeholders

1. **Product photography** — catalog images are manufacturer/distributor shots
   where those exist, and representative photos of the product *type* where no
   official image could be sourced (Mekaal, Zec, Jee Kong, Skypower and several
   others have no usable online imagery). Page photography is stock. Your own
   photos of real jobs and shelf stock will outperform all of it; see
   `image-credits.html` for sourcing and licensing.

## Cache busting

CSS and JS are linked with a `?v=` stamp. Bump it across the HTML files when
you change either, or browsers will serve the old copy.
