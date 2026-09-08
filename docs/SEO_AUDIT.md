# SEO audit and implementation — September 8, 2026

Scope: the eight indexable challenge pages and the 404 recovery page. Goal: help researchers discover the EEG/EMG challenge, choose a task, understand prizes, and find baselines/registration. No Search Console or GA4 reporting access is available, so query volume, index coverage and conversion rates cannot be established.

## Guidance

Used the supplied `find-skills` and `seo` skills. Checked the skills.sh leaderboard and CLI search, then installed `coreyhaines31/marketingskills@seo-audit` globally for Codex (203.4K installs reported by CLI; GitHub repository 48,731 stars). Reviewed the installed skill before applying it. This is a community skill, not official Google guidance. No website runtime package was added.

Installation: `npx skills add coreyhaines31/marketingskills --skill seo-audit -g -y --agent codex`.

[Skill listing](https://skills.sh/coreyhaines31/marketingskills/seo-audit) · [Repository](https://github.com/coreyhaines31/marketingskills).

## Findings and fixes

| Priority | Evidence | Implementation |
| --- | --- | --- |
| High: mobile layout instability | Production Lighthouse measured CLS 0.531 and identified the entire main content shifting. The mobile no-JavaScript navigation occupied document flow until deferred JS added `menu-ready`. | Detect JavaScript in the head before layout. Apply expanded fallback navigation only when JavaScript is unavailable. Keep the existing toggle/Escape/focus behavior. Candidate CLS is 0. |
| Medium: verbose homepage search presentation | Homepage description was over 200 characters; title carried a long subtitle. | Concise topic-focused title and description, retaining the exact workshop identity and submission dates. |
| Medium: awards search copy did not match the revised page | Description led with $18,000; keywords still mentioned travel grants. | Promote cash awards and internships, matching visible content. Remove obsolete keyword tags site-wide. |
| Medium: favicon lacked a crawlable URL | All nine pages embedded the favicon in a data URI. | Export the existing brand artwork to a 96px PNG at `/favicon.png`; all pages reference that stable URL. |
| Low: vague task snippets | Start kit and leaderboard metadata lacked the concrete decoding tasks. | Unique task-specific descriptions and titles synchronized with Open Graph and Twitter metadata. |

## Search intent by page

| Page | Primary intent |
| --- | --- |
| Home | EEG/EMG challenge at the Brain and Body Workshop at NeurIPS 2026 |
| Start kit | NeuralBench EEG/EMG baselines and Codabench registration |
| Awards | Challenge cash awards and San Francisco/Toronto internships |
| Leaderboard | EEG, BCI, sleep and EMG metrics and standings |
| FAQ | Eligibility, submission caps, external data and audit rules |
| Organizers | Track teams and verified affiliations |
| Ethics | Consent, dataset controllers and decoding limits |
| Track record | BEETL/EEG competition history and continuity |

No invented search-volume estimates, thin keyword pages, translations, event dates, or FAQ rich-result promises were added. Existing canonical URLs, permissive robots file, sitemap, static content, clear authorship/team profiles and WebSite structured data remain in place. Historical results and current preview boards remain distinguished.

## Validation

Before: production Lighthouse mobile performance 78/100, SEO 100/100, LCP 1.7s, CLS 0.531. Candidate on local server: performance 89/100, SEO 100/100, LCP 3.6s, CLS 0. These are separate lab samples, not field Core Web Vitals or a controlled speed comparison. Reports: `/tmp/neural-seo-before.json`, `/tmp/neural-seo-candidate.json`.

All nine mobile route checks passed, including four-track round trips, menu/Escape focus, malformed fragments and no-JavaScript navigation. Full design and coverage checks passed (nine pages, 58 anchors, 15 categories). Production recheck follows deployment.

## Account-dependent follow-up

Search Console property verification and sitemap submission still require organizer account access or the verification token. See [setup instructions](ANALYTICS_AND_INDEXING.md). Once verified, inspect the homepage, Start kit and awards URLs; monitor actual query impressions and indexing exclusions before changing content strategy. GA4 is installed, but its Realtime reporting must be checked in the account.

Links from the workshop, NeuralBench, previous challenge and partner sites are a useful next distribution step. No outreach, directory submissions or messages to other people were performed. Google ultimately decides what to index and how to display snippets.

## Primary sources

- [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link)
- [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)
- [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google-supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Google site-name structured data](https://developers.google.com/search/docs/appearance/site-names)
