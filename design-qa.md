# Trikan Realtors — UI/UX QA

**Build:** `main` · UI pass deployed on 16 October 2026  
**Live implementation:** https://trikan-properties.onrender.com  
**Source repository:** https://github.com/kamssofficial/trikan-properties

## Result

**Functional/responsive QA: PASS. Visual screenshot comparison: PARTIAL.**

The redesign is grounded in the existing production site and Trikan's established ink, ivory and gold identity. No separate Figma/mockup source was supplied. A pre-change browser capture was initiated, but its image binary could not be archived locally in the available environment; this report does not claim a pixel-diff or full visual-match pass.

- Pre-change production capture reference: `01a14520-31db-7129-b84b-06928c197ac2`
- Current desktop homepage capture (1440 × 1100 CSS viewport; temporary hosted screenshot): [Open capture](https://storage.googleapis.com/firecrawl-scrape-media/screenshot-ed82e186-2700-4343-bf35-3c80aef4ec6b.png?GoogleAccessId=scrape-bucket-accessor%40firecrawl.iam.gserviceaccount.com&Expires=1792766671&Signature=FqPZusWWPIvAv%2F4geN2EWnXVpQuvEI8uOWG8fFr%2F0fPFtG7la5Ab%2Fqm47l0wEUUIlRM2O%2BJYFwGRuHBtd%2FVO1gXA2hCcwkpHUq7GIt1iFzx5WPaOzbt0o4RuQCXE0sWwpANL%2BBF3%2FCzJLNmjPZE1EYtzF3WSCa5VaUWVes7W8RFpLuKXLiiT7rpJU4VroTat5aZJRbxKP1W%2BfImPwLm60zS4B3zMeEhBUgy46PcbSOcJtZbOGek16AK6vWsgg5WgsEaDUOvmVj9b%2FoehCh%2FvDHOCFGvTXg4x04AH2dLC2GQHSxwxW0P9x%2BaRDi7Abslj%2BXBgLyar5W5RY0HH8%2BJESw%3D%3D)

## Implemented

- Added `src/design-system.css` and load it after the legacy styles so the entire existing site shares a consistent light, warm, premium real-estate system.
- Refined the header, hero, CTA hierarchy, property cards, images/disclosure labels, catalogue toolbar, result summary, source list, business-profile section, forms, dialogs, footer, admin controls and chat widget.
- Made search/filter controls clearer, changed the CTA wording to **Featured only**, removed the redundant single-category tab row (the current catalogue contains Apartment listings only), and changed the result summary to report **Showing 6 of 15** until the user opens all results.
- Added keyboard skip navigation to the main content and made the main element focusable for that link.
- Aligned the browser theme color with the warm ivory page background.
- Preserved source links, privacy notice, explicit image disclaimers, enquiry consent, current verification status and no-external-LLM chat behavior.

## Browser checks

| Surface / task | Test result |
|---|---|
| Production homepage | HTTP 200; expected page title and hero heading |
| Desktop 1440 px | Three-column property grid, 6 initial cards, one chatbot launcher; no horizontal overflow |
| Tablet 768 px | Two-column grid; no horizontal overflow |
| Mobile 360, 375, 390, 430 px | Single-column grid; no horizontal overflow; CTA, menu, and chat available |
| Search for Kochi | 10 matching references reported; first 6 rendered, with a “View all 10 references” control |
| No-match search | Clear empty state displayed; Clear filters resets the query |
| Featured only | Toggle state changes and narrows the visible cards |
| View all | Expands from 6 to all 15 references |
| Property modal | Opens for Marina One, provides its project-specific official inventory link and retains “Enquire to verify” |
| Modal keyboard handling | Escape closes the property dialog |
| Enquiry dialog | Opens with 3 required inputs including contact consent; test did not submit a real enquiry |
| Mobile navigation | Opens and exposes `aria-expanded=true`; clicking a section closes the menu |
| Mobile chatbot | Opens and closes; no horizontal overflow |
| Images | After scrolling through the page, 17/17 image elements loaded; no broken image URLs reported |
| Skip navigation | Keyboard Tab reveals Skip to content; Enter focuses `main#main-content` |
| Accessible labels | Search, navigation toggle and chatbot have labels; browser check found no unlabeled icon-only buttons |
| Build/CI | Successful: https://github.com/kamssofficial/trikan-properties/actions/runs/38917433870 |
| Latest small UX copy commit | Successful: https://github.com/kamssofficial/trikan-properties/actions/runs/38918306615 |

## Contrast spot checks

Ratios below use the stated foreground/background token pairs, not transparent computed backgrounds:

- Main text `#1c1d1b` on `#fbfaf7`: **16.21:1**
- Muted text `#66655e` on `#fbfaf7`: **5.61:1**
- Primary gold `#8a6a32` on `#fbfaf7`: **4.80:1**
- White text on gold button `#8a6a32`: **5.01:1**
- Navigation text `#575852` on `#fbfaf7`: **6.88:1**

These are focused palette spot checks, not a complete WCAG conformance audit.

## Open launch items outside visual design

- Owner email-link verification and Supabase Auth URL allowlist still require the owner's verified account/dashboard session.
- All 15 property records remain **Needs verification**. Do not mark individual units available from project-wide developer inventory counts.
- Trikan still needs to confirm unit-level prices/inventory and approve the images/media for ongoing commercial use.
