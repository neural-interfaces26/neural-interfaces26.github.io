# Google Analytics and indexing setup

Site: https://neural-interfaces26.github.io/
Audit date: September 8, 2026.

## Current state

Live checks: all eight content pages return HTTP 200 and matching canonical URLs. `robots.txt` and `sitemap.xml` return 200; a nonexistent page returns 404. The recovery page carries `noindex, follow` and is excluded from the sitemap. Content is available in static HTML, and navigation links connect the pages.

The organizer supplied GA4 Measurement ID `G-X6NYQJMNJ9`. Its Google tag is installed once on each of the nine HTML pages. Search Console verification remains pending because no verification token has been supplied. GA4 reporting must be confirmed in the account Realtime report.

Included in this deployment: sitemap last-modified dates reflect the September 8 content revisions; removed Google-ignored priority/change-frequency fields; added homepage WebSite structured data for the site name. These changes do not guarantee indexing or rankings.

## Google Analytics 4

No npm package, server, WordPress plugin, or Google Tag Manager container is necessary. Use Google's direct website tag once a property exists.

1. Sign in at https://analytics.google.com/ using an organizer-controlled account.
2. Create a GA4 property named `EEG/EMG Foundation Challenge 2026`. Choose the team's reporting time zone and currency. Review the account data-sharing settings and terms.
3. Add a **Web** data stream for `https://neural-interfaces26.github.io/`.
4. Copy the Measurement ID (`G-…`) from stream details and provide it for installation. This identifier is public; do not share account passwords or recovery codes.
5. Install one Google tag per page. The supplied tag uses standard GA4 configuration. No consent manager or advertising configuration is included in this installation.
6. Confirm collection using the GA4 Realtime report and browser network inspection after deployment. The supplied direct tag also runs on local previews; exclude developer traffic in the GA4 property when reviewing reports.

Useful initial measurements: page views, outbound clicks to Codabench and track documentation, and Discord clicks. Treat a Codabench click as an outbound visit, not a completed registration: completion happens on a separately operated website. Enhanced measurement can cover outbound clicks without a custom event framework.

Sources: [Google's GA4 setup instructions](https://support.google.com/analytics/answer/14183469?hl=en), [consent configuration](https://developers.google.com/tag-platform/security/guides/consent).

## Google Search Console

This is the service for indexing status and Google Search visibility; installing Analytics does not submit the site to Search Console.

1. Open https://search.google.com/search-console/ using the organizer account.
2. Add a **URL-prefix** property with the exact value `https://neural-interfaces26.github.io/`. This avoids needing control of GitHub's parent-domain DNS.
3. Choose **HTML tag** verification. Provide the complete `google-site-verification` meta tag so it can be inserted in the homepage head. Alternatively, provide Google's verification HTML file for deployment at the site root.
4. After deployment, click **Verify**. Keep the verification tag/file in place.
5. Under **Sitemaps**, submit `sitemap.xml`.
6. Use **URL inspection** to test the homepage, Start kit and awards page, and request indexing after the final version is deployed. Review **Page indexing** for exclusions and **Performance** for impressions, queries, clicks and CTR.

Sources: [property types](https://support.google.com/webmasters/answer/34592?hl=en), [verification methods](https://support.google.com/webmasters/answer/9008080?hl=en), [sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Improve visibility next

- Obtain descriptive links to this exact canonical site from the workshop, NeuralBench documentation, the previous challenge and organizer/sponsor pages. Coordinate with their maintainers; no messages were sent during this audit.
- Keep release dates, prize details and submission instructions current. Update sitemap `lastmod` only when a page changes meaningfully, not on every deployment or stylesheet cache bump.
- Use Search Console evidence to improve page titles and descriptions for actual relevant searches. The existing pages already have distinct titles, descriptions and canonical URLs.
- Review field Core Web Vitals once sufficient traffic exists. Local browser timings are not field performance.
- Do not add keyword-stuffed pages, speculative event dates, or FAQ rich-result markup merely to chase rankings.

Sources: [site-name structured data](https://developers.google.com/search/docs/appearance/site-names), [sitemap lastmod and ignored fields](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping).
