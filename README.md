# Trikan Properties

Premium real-estate website and enquiry-management starter for Trikan Realtors, built by KAMSS Digital Solutions.

## Status

The project is a working React/Vite frontend with a researched property catalogue, enquiry capture, responsive design, and an optional Supabase-powered admin area. Social-media advertisements are historical references; listing availability and prices must be confirmed before publication. Images currently used in the site are illustrative architectural imagery, not verified original property photos.

## Stack

- React 18 + TypeScript + Vite
- Lucide icons
- Supabase Auth + PostgreSQL (optional until configured)
- SQL schema with row-level security

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase URL and anon key if using the live database/admin.
5. Run `npm run dev`.

The public catalogue can run without Supabase using the bundled research seed data. Enquiries are sent to WhatsApp when no backend is configured; the UI makes the handoff explicit.

## Configure Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Create an admin user through Supabase Auth, then assign `app_metadata.role = admin` using a trusted server/admin environment. Never place a service-role key in frontend variables.
5. Test public read, admin edit, and enquiry flows before launch.

## Deployment

Build with `npm run build`; output is in `dist/`. Deploy to Cloudflare Pages, Netlify, or another static host. Add the two `VITE_SUPABASE_*` environment variables in the host dashboard. Add SPA fallback/rewrite support so routes load directly. For Cloudflare Pages, connect this GitHub repository, set build command `npm run build`, output directory `dist`, and Node version 20+.

## Research and source notes

Listings originate from public Trikan social posts and should be reconfirmed with the business before appearing as available inventory:

- [Trikan Realtors Instagram](https://www.instagram.com/trikan__properties/)
- [Trikan Realtors Facebook](https://www.facebook.com/p/Trikan-Realtors-61560009638447/)
- [Marina One 4 BHK reel](https://www.instagram.com/reel/DL5C5BwT9Os/)
- [4 BHK, 3,560 sq ft reel](https://www.instagram.com/reel/DHlhcokzFtc/)
- [M.G. Road 3 BHK, 1,817 sq ft reel](https://www.instagram.com/reel/DGdPTD8y0Mr/)
- [Kent Eco Sanctum reel](https://www.instagram.com/reel/Dam-vMoBqhZ/)
- [Elamakkara 2/3 BHK reel](https://www.instagram.com/reel/DP5-HswEsQK/)
- [Thrissur 3/4 BHK reel](https://www.instagram.com/reel/C84oEumhfli/)
- [Feroke riverfront project reel](https://www.instagram.com/reel/DctJSH8h6NK/)

The penthouse offer (4.5 BHK, approx. 3,500 sq ft, ₹2.5 Cr negotiable) was found in a public profile excerpt; the original direct post was not independently resolved. Do not imply current availability. The advertised ₹1.20 Cr+ Kent Eco Sanctum pricing and penthouse pricing are reproduced as historical promotional claims, not verified live prices.

## Before launch

- Confirm phone number, contact name, email and K-RERA details with the owner.
- Reconfirm every listing's project name, size, price, photos, availability and source media permissions.
- Add a real business email and privacy policy.
- Test Supabase Auth/RLS and form validation.
- Connect any AI/WhatsApp API only after approved credentials and templates are supplied.

© Trikan Properties. Built by KAMSS Digital Solutions. Brand ownership, image rights and listing details must be approved by Trikan before production launch.
