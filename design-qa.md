# Trikan Realtors — UI/UX QA

**Result:** Responsive and interaction checks **PASS**. Final desktop/mobile screenshot sanity check **PASS**. A pixel-diff against an external Figma/mockup is not claimed because no separate reference design was supplied.

**Live product:** https://trikan-properties.onrender.com  
**Source:** https://github.com/kamssofficial/trikan-properties  
**UI implementation commit:** `057270f` — https://github.com/kamssofficial/trikan-properties/actions/runs/38919237612

## Final screenshots

Captures from the live implementation on 16 October 2026 (hosted screenshots are temporary links):

- [Desktop homepage, 1280 × 900](https://storage.googleapis.com/firecrawl-scrape-media/screenshot-62c4925d-0e0e-427b-84ac-b9ceb3b46427.png?GoogleAccessId=scrape-bucket-accessor%40firecrawl.iam.gserviceaccount.com&Expires=1792767252&Signature=bxWIYYf1XVsdBCxPoDGWu%2BKClEo5AgLtgWdvRoLN7kxmu%2BiZUSgGJaxq9sHhhnkm0LrTT%2FULdHDhtl3rNE%2FnL9vexqbOl8hlFxNJcIoqon75jdnb156wXW%2FcTTZGKTS9HoBq%2FgIX%2BUqpHhZie5Wkthd2lniNxR8adCKLKwPknPCQHDKGH7uTaSaA1yK9BL%2B9FgykcasaYl%2Bd5kxCKdPe5bvRo3ZkyC8ZqY3jsVNABrMtaBDZqOFP3QSsp4LvkriBhSq33BzRROX%2B0FmQ516A6O0aNR6vR8c9bpIe1jRVtKhrPwiVZ0t8Vvd4yBnVfxcT9Oj078nPfdXzFbMXbBrUEQ%3D%3D)
- [Mobile homepage, 390 × 844](https://storage.googleapis.com/firecrawl-scrape-media/screenshot-f4a241cf-9270-4eb6-8944-23dd279514dd.png?GoogleAccessId=scrape-bucket-accessor%40firecrawl.iam.gserviceaccount.com&Expires=1792767258&Signature=woS5q6oh6oCJFAm4ykJ1cN9Z0L54J51g%2Bh5o7%2FFeT6%2BN2KA2B3xUOV8t5bSRKT2O8ir3bkXq3SNIgqNjFhHUZX8iWdo%2F1isp2Zj509UZxXrtthvsSqWc3HCZods30vv5mJuA1O8EzbRf%2Fi4UT3Xxq5vMB2kfBaeCnWvXDFNOQHcOQ%2Fkjk5XYY8al6PDyIbAt2mwHqEer1vZFsmoVKceX7OZsU7x%2Bfju62SDf714z6EOMveotTNoq7cxsZp4jrVlpAcFgCXgyOdo9Cz0e%2FrcZVzEScTtH2KsBoGOR5a4EXMNaRR2zgY646xTGsty2fgxJSthCAEI8PRqxzTh9fMJDhg%3D%3D)

## What changed

- Added `src/design-system.css`, loaded last after the existing app styles to create a consistent premium, light ivory / ink / restrained-gold design system.
- Refined hero hierarchy, primary/secondary calls to action, header and responsive menu, property cards, search and filter toolbar, property modal, source list, business profile, contact/privacy forms, footer, admin dashboard, and chat widget.
- Removed the redundant single-category filter row because every current listing is categorized as an apartment; the toolbar now explains that context.
- Renamed the filter **Featured only** and clarified result counts (e.g. **Showing 6 of 15 property references**).
- Added a keyboard skip link to focus the main content, aligned browser theme color to the page background, and strengthened focus rings, touch targets, reduced-motion support, and modal usability.
- Kept listing verification status, source links, privacy notice, consent requirement, illustrative-image disclaimers and API-free chatbot behavior intact.
- Fixed floating-chat overlaps with the desktop hero footer and the mobile image disclaimer. On mobile, the launcher is a compact round button.

## Live browser validation

| Test | Result |
|---|---|
| Production homepage | HTTP 200; expected title and hero |
| Desktop 1280 × 900 / 1440 × 1000 | 3-column grid; no horizontal overflow; chat launcher no longer covers hero footer |
| Responsive widths 360, 375, 390, 430, 768, 1024 and 1440 px | No horizontal overflow; grid adapts to 1/2/3 columns |
| Search for Kochi | 10 references reported; first 6 shown; “View all 10 references” available |
| Clear search with no matches | Empty state appears; Clear filters returns to 6 visible / 15 total |
| Featured only | Toggle updates pressed state and narrows results to 4 |
| View all references | Expands to all 15 records |
| Property detail | Marina One modal opens, links to its project-specific SOBHA inventory page, keeps “Enquire to verify” status, and closes on Escape |
| Enquiry dialog | Opens; three required fields present, consent unchecked by default; no test enquiry submitted in final QA |
| Mobile navigation | Menu opens, sets `aria-expanded=true`, and closes after navigation |
| Mobile chatbot | Circular launcher; opens and closes; no content/disclaimer overlap; no horizontal overflow |
| Keyboard navigation | Tab exposes Skip to content; Enter focuses `main#main-content` |
| Accessible labels | Search, menu and chat launcher labeled; no unlabeled icon-only buttons detected in the checked page |
| Images | All 17 images loaded when all references were shown; no broken URLs detected. Final initial page load: 8/8 image elements loaded |
| Build / CI | Passed: https://github.com/kamssofficial/trikan-properties/actions/runs/38919237612 |
| Render deployment | Live deployment commit `057270f`, deploy `dep-db93k3rbc2fs7393tf70` |

## Contrast spot checks

Token-pair calculations (not a complete WCAG audit):

- Main text `#1c1d1b` on ivory `#fbfaf7`: **16.21:1**
- Muted text `#66655e` on ivory `#fbfaf7`: **5.61:1**
- Gold `#8a6a32` on ivory `#fbfaf7`: **4.80:1**
- White on the gold button `#8a6a32`: **5.01:1**
- Navigation `#575852` on ivory `#fbfaf7`: **6.88:1**

## Separate launch dependencies

These aren't visual-design issues, so they remain explicit instead of being hidden by the redesign:

- The owner account `kamssofficial@gmail.com` still needs its emailed verification/sign-in link completed; no verification bypass was made.
- All 15 property records stay **Needs verification** until Trikan confirms current unit-level availability/pricing and approves the actual media rights.
- Supabase's leaked-password-protection warning remains a Free-plan limitation; no billing change was made.
