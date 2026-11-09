# Torque Moulds Factory

The site builds to static HTML, CSS, JavaScript and images. The catalog supports quote enquiries through WhatsApp, with an optional email handoff.

## Local preview

Use Node.js 22.23.4 or later and npm 9.6.5 or later.

```sh
npm ci
npm run dev
```

Run `npm run build` to generate `dist/` and `npm run preview` to review that build.

## Production configuration

Set the following build environment variables on the static host before publishing:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | The confirmed HTTPS origin. Setting it enables canonical URLs, social sharing metadata and the sitemap. Without it, pages carry `noindex`. |
| `PUBLIC_SALES_EMAIL` | Optional verified sales mailbox. Setting it enables email on the contact and quote pages. |
| `PUBLIC_COUNTER_ADDRESS` | Optional confirmed street address. The default site gives the Al Quoz locality and links to Google. |

Publish `dist/` with directory-index URLs and configure the host to serve `404.html` with HTTP status 404 for unknown paths.

## Catalog and enquiries

The entries in `src/data/products.json` describe example configurations. Set a product's `verified` field to `true` only after replacing its sample specifications and part number with approved product data and confirming its availability. Existing URLs use the category and slug fields.

The quote form prepares a message in the browser. The customer reviews it and opens WhatsApp or the configured mail client to send it. Drawings are attached in the sending app. Confirm the counter number, WhatsApp destination and hours in `src/data/site.ts` before launch.
