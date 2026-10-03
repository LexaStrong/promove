# SEO and Search Operations

## Current implementation

- The root layout provides the default title template, description, Open Graph site metadata, Twitter summary metadata, icons, and a canonical `metadataBase`.
- `NEXT_PUBLIC_SITE_URL` controls the public origin used by canonical URLs, sitemap, and robots output. It defaults to `https://promove.gh`; set it to the real canonical HTTPS origin in each deployed environment.
- `/` has a page-specific title, description, canonical URL, and Open Graph title/description.
- `/privacy` has a page-specific title, description, canonical URL, and Open Graph metadata.
- `/sitemap.xml` lists only `/` and `/privacy`.
- `/robots.txt` allows public crawling and disallows app, account, and API paths.
- Login, registration, driver-app, and dashboard route layouts set `noindex, nofollow`. The sitemap never includes these routes.

`robots.txt` is a crawler directive, not access control. Do not rely on it to protect private data. Production authorization must be enforced by the application and APIs.

## Public URL configuration

Set the public URL at build and runtime to the canonical origin, including `https://` and no path, for example:

```env
NEXT_PUBLIC_SITE_URL=https://promove.gh
```

If the production domain changes, update the environment configuration and verify canonical tags, `robots.txt`, and `sitemap.xml` after redeployment. Avoid publishing localhost, preview, or staging origins as canonical URLs.

## Current indexation scope

| URL | Index policy | Sitemap |
| --- | --- | --- |
| `/` | Index, follow | Yes |
| `/privacy` | Index, follow | Yes |
| `/login` | Noindex, nofollow | No |
| `/register` | Noindex, nofollow | No |
| `/driver-app` | Noindex, nofollow | No |
| Dashboard pages | Noindex, nofollow | No |
| `/api/*` | Disallowed in robots | No |

Only expose public pages with useful, stable content. Do not submit demo dashboards or user-specific route state to search engines.

## Page metadata standards

- Keep one descriptive H1 per public page and use headings in content order.
- Write unique titles and descriptions that explain the actual operator outcome; do not keyword-stuff.
- Keep canonical URLs absolute through the configured metadata base.
- Maintain accessible image alt text and meaningful link labels.
- Do not add review/rating, price, address, or customer structured data unless the values are real and verifiable.
- The current Open Graph and Twitter preview uses the supplied desktop fleet splash. Check its crop in social preview tools; replace it with a dedicated 1200×630 export if platforms crop the vehicle/logo composition poorly.

## Release checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin.
2. Run `npm exec next typegen`, `npm exec tsc -- --noEmit`, and `npm run build`.
3. Request `/robots.txt` and confirm it names the expected absolute `/sitemap.xml` URL.
4. Request `/sitemap.xml` and confirm it contains only public, canonical URLs on the deployed host.
5. Inspect rendered HTML for title, description, canonical, Open Graph, Twitter, and `noindex` tags on the intended routes.
6. Confirm preview/staging deployments do not advertise production canonical URLs unless intentionally configured.
7. Submit the production sitemap in Google Search Console and Bing Webmaster Tools after DNS/domain verification.

## Next SEO work

Prioritize useful, accurate public content before adding more metadata: distinct product pages for fleet tracking, financial ledger, maintenance/documents, and the driver workflow; FAQs based on real customer questions; and approved customer evidence. Add performance and search-console monitoring only after the production domain and analytics/privacy approach are finalized.
