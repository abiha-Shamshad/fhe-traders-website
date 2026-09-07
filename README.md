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
images/products/           product photos, named <product-id>.jpg
images/products/variants/  per-variant photos (fittings items)
images/site/               page photography + hero video
```

## Editing the catalog

`js/products-data.js` drives the products grid, the detail pages and search.
Each entry is a brand- or type-level card; sizes and capacities live in
`models`, which render as selectable chips on the detail page.

Adding a product photo needs no code change — drop a file into
`images/products/` named after the product's `id` (e.g.
`images/products/inverex-inverter.jpg`). If the file is missing, the card falls
back to a colour-coded category icon.

## Known placeholders

Two things to replace before going live:

1. **WhatsApp number** — `js/config.js` still holds `923001234567`, a
   placeholder. Every enquiry button on the site reads from it.
2. **Product photography** — catalog images are manufacturer/distributor shots
   where those exist, and representative photos of the product *type* where no
   official image could be sourced (Mekaal, Zec, Jee Kong, Skypower and several
   others have no usable online imagery). Page photography is stock. Your own
   photos of real jobs and shelf stock will outperform all of it; see
   `image-credits.html` for sourcing and licensing.

## Cache busting

CSS and JS are linked with a `?v=` stamp. Bump it across the HTML files when
you change either, or browsers will serve the old copy.
