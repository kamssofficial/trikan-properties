# Trikan Properties

Premium real-estate website and enquiry-management starter for Trikan Realtors, built by KAMSS Digital Solutions.

## Status

The project is a React/Vite frontend with a researched property catalogue, enquiry capture, responsive design, an optional Supabase-powered admin area, and a property-aware local chat assistant. The chat assistant uses deterministic rules and the local/catalogue data without any LLM API key or external model request. Social-media advertisements are historical references; listing availability and prices must be confirmed before publication. Images currently used in the site are illustrative architectural imagery, not verified original property photos.

## Stack

- React 18 + TypeScript + Vite
- Lucide icons
- Supabase Auth + PostgreSQL (optional until configured)
- Local property-aware chat responses requiring no AI provider API
- SQL schema with row-level security

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase URL and anon key if using the live database/admin.
5. Run `npm run dev`.

The public catalogue and guided property assistant can run without Supabase using the bundled research seed data. When Supabase is configured, the widget loads the managed catalogue and records chatbot leads in the existing enquiry inbox with source `website_chat`. Chat responses themselves are generated locally in the browser and make no Gemini/OpenAI/OpenRouter API calls. WhatsApp opens with a prepared message, and the visitor must press Send.

## API-free chat (default)

The website chat uses local deterministic logic in `src/components/PropertyChatWidget.tsx` to match the visitor's message to the property catalogue and choose a relevant response. The chat does not call an LLM endpoint and does not require Gemini, OpenAI, OpenRouter, or another AI-provider key. This avoids model API charges and provider quotas; responses are rule-based, not generative AI.

The existing Supabase Edge Function `property-chat` is retained as an optional server-side experiment but the live widget does not invoke it. Do not add any AI-provider secret unless you intentionally decide to re-enable external model responses later.

## Lead capture and automation

The chat qualifies enquiries by collecting a visitor's name, phone, optional email, budget range and buying timeline after explicit consent. With Supabase enabled, it records a concise enquiry summary and source in the existing `enquiries` table, where the admin inbox can triage it; it does not store the full chat transcript. It also prepares a contextual WhatsApp handoff. Automated outbound WhatsApp/email follow-ups are not enabled by this change: they require approved provider credentials and appropriate opt-in.

## Configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/migrations/001_initial_schema.sql`, `002_refresh_social_catalog.sql`, `003_enrich_official_project_sources.sql`, and `004_secure_public_enquiries_and_refresh_price.sql` in numeric order.
3. Run migrations `005_ai_rate_limits.sql` through `011_correct_marina_one_snapshot_quote.sql` in numeric order after 001–004. Migrations 008–011 add official developer inventory snapshot links for SOBHA Metropolis and Marina One and correct the inventory count text from SOBHA’s catalogue.
4. If migrations 001 and 002 were already applied, run migrations 003–011 in numeric order. Migration 004 reasserts the official SOBHA price label and restricts public enquiry inserts to new enquiries with bounded field lengths. Migration 006 hardens helper functions; migration 007 allowlists the temporary owner email; migrations 008–009 add/correct the official inventory snapshot data.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the frontend host.
6. In **Supabase → Authentication → URL Configuration**, set **Site URL** to `https://trikan-properties.onrender.com` and add `https://trikan-properties.onrender.com/**` to **Redirect URLs**. This is required because the owner magic link returns to `/?admin=1`.
7. In **Supabase → Authentication → Password Security**, enable leaked-password protection. The website admin UI uses passwordless email links, but this hardens the project in case password auth is later enabled.
8. The temporary owner email `kamssofficial@gmail.com` is allowlisted by `007_temporary_owner_email_allowlist.sql`. Owner sign-in uses a one-time email link (no password form is exposed). Open the live site, choose **Admin access**, and request the secure sign-in link. Complete the link from the same browser and then test listing edits and the enquiry inbox. Other admin accounts should use a trusted server/admin environment to set `app_metadata.role = admin`; never put a service-role key in frontend variables.
9. The site does not need the optional `property-chat` Edge Function for normal chat operation; the widget's local response path is API-free.
10. Test public catalogue reads, denied public enquiry reads, owner-only listing edits, enquiry writes, and source links before launch.

## Deployment

Build with `npm run build`; output is in `dist/`. Deploy to Cloudflare Pages, Netlify, or another static host. Add the two `VITE_SUPABASE_*` environment variables in the host dashboard. Add SPA fallback/rewrite support so routes load directly. For Cloudflare Pages, connect this GitHub repository, set build command `npm run build`, output directory `dist`, and Node version 20+.

## Research and source notes

The public catalogue was reviewed on **2026-10-16** against posts from the brand's Instagram profile and the linked Anseen Anil profile. All current entries are marked for verification because a social post does not establish live inventory. The site deliberately keeps unnamed projects unnamed and does not infer the project identity of similarly worded posts.

### Business identity and contact

- Public brand name: **Trikan Realtors**
- Brand Instagram: https://www.instagram.com/trikan__properties/
- Facebook page: https://www.facebook.com/p/Trikan-Realtors-61560009638447/
- Related agent profile: https://www.instagram.com/anseen_trikan/
- Public business contact on Trikan property posts: **+91 89215 36717**
- Email listed in the K-RERA agent record: **anseen1995@gmail.com**
- K-RERA agent register lists **Anseen Thundathil Anil**, individual agent, **K-RERA/AG/0114/2024**, phone **8921536717**: https://rera.kerala.gov.in/agents?page=21
- The linked public Instagram profile **@anseen_trikan** also publishes **+91 73060 47257**. The site shows both numbers with source context instead of silently assuming they are interchangeable.

The public register gives an individual agent's address; it has **not** been presented as a Trikan office address. No official business website or office address was established from the reviewed profiles. The registry listing is not a claim that every property promoted by the agent is a K-RERA-registered project.

### Current source-backed property references

- Edappally 2 & 3 BHK residential community; historic advertised starting price ₹1.20 Cr+, ~16 acres, 60%+ open space, 40+ amenities and ~20,000 sq ft clubhouse (project name absent from caption): https://www.instagram.com/trikan__properties/reel/Dc2-3r2sPiK/
- Feroke/Kozhikode pre-launch 3 & 4 BHK riverfront residences; post claims 100 m river frontage, twin 44-floor towers on 4.3 acres, price from ₹3.5 Cr*: https://www.instagram.com/trikan__properties/reel/DctJSH8h6NK/
- Sobha Metropolis in Thrissur; the cited June 2026 caption asks for a DM to receive the brochure but does not state pricing or unit sizes: https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/
- Marina One 4 BHK apartment offer (Anseen Anil profile): https://www.instagram.com/reel/DL5C5BwT9Os/
- Marina One project overview; caption advertises 3 & 4 BHK waterfront apartments and an historic starting price of ₹2.6 Cr: https://www.instagram.com/anseen_trikan/reel/DL-DNefTuKH/
- 3 BHK, 1,817 sq ft on M.G. Road, Ernakulam, with nearby-location distances: https://www.instagram.com/reel/DGdPTD8y0Mr/
- Unnamed 4 BHK, 3,560 sq ft, Kochi: https://www.instagram.com/reel/DHlhcokzFtc/
- Queen's Gateway by Varma Homes, Cheranalloor near Edappally; historic offer for 2, 3 & 4 BHK, 1,289–3,420 sq ft, from ₹99 lakh: https://www.instagram.com/anseen_trikan/reel/DLrWCtBxj7s/
- Unnamed 3 & 4 BHK waterfront project at Marine Drive; source caption does not explicitly name it as Marina One: https://www.instagram.com/reel/DGLJS9KTVaz/
- Unnamed 3 & 4 BHK Thrissur apartment offer, 1,762–2,842 sq ft; project name and price are not stated: https://www.instagram.com/reel/C84oEumhfli/
- Unspecified brand-new 3 BHK in Edappally: https://www.instagram.com/anseen_trikan/reel/DL4zIVkTDeS/
- “Private island” apartment lead in Kochi; project name and unit details are not stated: https://www.instagram.com/anseen_trikan/reel/DQtwc9qCaaT/
- Bengaluru township apartment payment-plan claim; project, unit and price details are not stated: https://www.instagram.com/anseen_trikan/reel/DNS7CyAz6dT/
- Unnamed Kakkanad pre-launch reference; the caption mentions direct Seaport–Airport Road access, metro frontage and limited-time benefits, but no project or unit details: https://www.instagram.com/trikan__properties/p/DVK-Xw4DzBi/
- Separate unnamed Kakkanad new-launch reference; no project identity, BHK configuration, size or price is stated: https://www.instagram.com/trikan__properties/reel/DTDTj96D6FV/
- Unnamed newly launched project in Thiruvananthapuram; no project name, BHK configuration, size or price is stated: https://www.instagram.com/anseen_trikan/reel/DTrnbBRCu6I/


### Official project source cross-checks

- Queen’s Gateway by Varma Homes: official builder details, layouts/amenities and project information: https://www.varmahomes.com/queensgateway.html; K-RERA project record K-RERA/PRJ/ERN/226/2024: https://reraonline.kerala.gov.in/PrintPreview/PrintPreview?q=l6rliEWXEAw8hZb2fri6ZeSUu%2BNUNgcGTC9iplPOLWakuiop0BzGJn%2Fruyors4Ru%2F813ihsOtq0U5S2g%2FZ%2BIJO6o32uLHexDhneJeOd336Ch7s2yTvcjTchVtKylBNYxFEwlDr3Jie0XfHCdd4k%2FQ9xv9YiqX88z6sAauQ1JZdNCCrVHPAJ%2BgA%3D%3D. K-RERA last-modified date in the reviewed record: 7 October 2026; project is in progress. Its proposed completion date conflicts with the builder page, so the catalogue calls this out.
- SOBHA Metropolis: the official page lists 1,779–2,814 sq ft 3 & 4 bed residences, 8.41 acres, 504 apartments, and a displayed starting price of ₹2.9 Cr*; its footnote says starred figures are as of June 2026. SOBHA’s separate Kerala inventory catalogue displayed 34 apartments available when reviewed on 16 October 2026; treat this as a changeable project-wide snapshot, not unit-level availability. It lists Phase 1/2/3 targets of December 2026/June 2028/December 2028 and registrations K-RERA/PRJ/TSR/002/2021, K-RERA/PRJ/TSR/101/2023, and K-RERA/PRJ/TSR/191/2023: https://www.sobha.com/thrissur/sobha-metropolis/. The K-RERA Phase 3 record, last modified by the promoter on 7 October 2026 and reviewed 16 October 2026, shows In Progress, 154 of 160 units sold, and proposed completion 30 April 2029: https://reraonline.kerala.gov.in/PrintPreview/PrintPreview?q=SSaTmXk488IeIy3yl80ww6s2t%2FCPS2bB2SxYXUfSiDQ%2Bz1bNouuK41T1Ycn2Ijbi%2Fx8U77sW6IrxsQHWUPPuBffdb0N%2Beg8DapeTlnejWIDUG6Tg8FKkvXtV5pAUHAflqkPmOEZkwFQZM%2FbMX2MGlqhAbewpu4Fqol207PavCNflldUkKYIAiw%3D%3D. That differs from SOBHA’s December 2028 Phase 3 target, so confirm the latest timeline and inventory with both sources.
- Marina One: official project page https://marinaone.in/. The official SOBHA Kerala inventory catalogue page https://www.sobha.com/property-in-kerala-for-sale/ was reviewed on 16 October 2026; it lists Marina One as 3 & 4 bed residences sized 2,294–3,061 sq ft and displays 108 apartments available. These are developer catalogue facts and a project-wide snapshot, not confirmation that an individual Trikan-offered unit is available. The official Marina One site identifies five K-RERA phases and states that images are artist’s impressions unless indicated otherwise.

### Attribution, media and availability rules

- The site has excluded the previously referenced Kent Eco Sanctum reel and Elamakkara reel because those specific posts are authored by other accounts, not Trikan. They should not be presented as Trikan inventory without separate confirmation.
- A previously noted 4.5 BHK penthouse offer could not be connected to a resolved original post, so it is not in the public catalogue.
- Prices in cards are explicitly labelled historical when sourced from old promotional posts. All cards currently use “Enquire to verify” status; no card asserts live availability.
- Instagram's public-page retrieval did not expose downloadable original Trikan property photos/reels through the available research route. The three identified projects—Queen’s Gateway, SOBHA Metropolis and Marina One—use **official developer project renders**. These are marketing renders, not unit-specific photographs; verify rights/permission before commercial reuse. Other cards use clearly labelled illustrative stock imagery, not photos of the listed units. Replace generic images with Trikan-approved original photos/reels when supplied.
- Post descriptions preserve only details supported by the public captions. Do not present captions as independent verification of project registration, legal/title status, current inventory or builder-authorized pricing.

## Before launch

- Confirm phone number, contact name, email and K-RERA details with the owner.
- Reconfirm every listing's project name, size, price, photos, availability and source media permissions.
- Review the published Privacy & Data Use notice and confirm that the public phone numbers and agent email are the right contacts for incoming enquiries. The website does not currently claim a general office inbox.
- Set Supabase Auth's Site URL to `https://trikan-properties.onrender.com` and add `https://trikan-properties.onrender.com/**` to allowed redirect URLs. Enable leaked-password protection under Password Security. Then complete the verified email-link owner login for `kamssofficial@gmail.com` through the live Admin access screen; the link redirects to `/?admin=1`. Test owner-only listing edits and the enquiry inbox; public users must not read enquiries.
- External AI replies are intentionally disabled in the live widget. No AI-provider API key is required for chat.
- Connect any AI/WhatsApp API only after approved credentials and templates are supplied.

© Trikan Properties. Built by KAMSS Digital Solutions. Brand ownership, image rights and listing details must be approved by Trikan before production launch.
