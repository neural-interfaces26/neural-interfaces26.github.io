# Promotion and readability correction loop

The user rejected the previous visual result. Automated checks missed oversized promotion, unbalanced logos, repetition, and difficult page scanning. This pass uses the supplied screenshots as concrete baseline failures.

Persona: a first-time researcher deciding whether to participate, then comparing rewards, checking rules, and finding the relevant team.

Luna max implements the four affected pages and shared CSS. Root reviews actual desktop/mobile renders, interacts with navigation/disclosures, checks retained facts and links, and requests corrections before completion. Existing UX Audit guidance is adapted to the local static site and isolated CDP driver as documented in UX_REVIEW_LOOP.md.

## Acceptance

- Homepage: historical 2025 participation directly after hero, clearly labeled historical. Four named choices remain usable. Promotion leads with awards and internships in San Francisco/Toronto, not an oversized cash total. Conditions remain accurate and linked.
- Sponsors: compact compute/track group; no empty four-column AWS row. Logos preserve aspect ratio with comparable optical weight. Institution marks wrap without an oversized orphan.
- Awards: one readable prize comparison, one set of internship conditions, useful track-specific entry links. No repeated full prize breakdown. Cash allocation is supporting information. Exact Alljoined threshold and negotiation wording retained.
- FAQ: one compact introduction, seven visible binding rules, five native questions, Discord support. Remove redundant summary/status panels; keep complete policy text and deep links.
- Organizers: compact introduction, clear team navigation, consistent portraits/name/affiliation placement, no special oversized lead layout. All 30 people, affiliation/project details and profile links retained.

## Validation

1. Capture baseline affected sections at desktop/mobile.
2. Review changes against each acceptance item, not just absence of overflow.
3. Run interaction/axe checks on affected pages and the full nine-page navigation suite; inspect screenshots at desktop/mobile and narrow widths.
4. Fix observed failures and repeat affected checks.
5. Record results and limits in UX_REVIEW_LOOP.md. No claim of user testing or production performance.
