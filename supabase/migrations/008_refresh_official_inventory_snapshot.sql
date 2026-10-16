-- Refresh the two identified developer projects with the latest official project-catalogue snapshot.
-- The source count is informational only; it does not establish availability of a specific Trikan-offered unit.
alter table public.properties
  add column if not exists inventory_source_url text;

update public.properties
set
  description = $q$Trikan introduced SOBHA Metropolis in a June 24, 2026 post. The official SOBHA project page, reviewed October 16, 2026, lists the location as Ollur Road, Kuttanellur, Thrissur; an 8.41-acre site; 504 apartments; 3 & 4 bed residences sized 1,779–2,814 sq ft; and a displayed starting price of ₹2.9 Cr*. SOBHA footnotes starred price information as of June 2026, so treat it as indicative and not a unit quote. The official page lists phase completion targets of December 2026, June 2028 and December 2028. The K-RERA Phase 3 record (K-RERA/PRJ/TSR/191/2023), last modified by the promoter on 7 October 2026, lists the project In Progress, 154 of 160 units sold, and a proposed completion date of 30 April 2029; that differs from SOBHA’s December 2028 target. The separate SOBHA Kerala inventory catalogue, checked 16 October 2026, displayed “34 Apartments Available” for SOBHA Metropolis. That is a developer-site project snapshot, can change, and does not confirm any particular Trikan-offered unit or phase-level inventory. The older Trikan post for 1,762–2,842 sq ft Thrissur apartments does not explicitly identify this project and has not been merged into these specifications. Confirm the exact unit, price, phase, availability and delivery schedule directly with SOBHA and Trikan.$q$,
  inventory_source_url = 'https://www.sobha.com/property-in-kerala-for-sale/'
where source_url = 'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/';

update public.properties
set
  description = $q$Anseen Anil’s July 9, 2025 reel advertised a brand-new 4 BHK apartment at Marina One; the specific unit size, asking price and present availability were not stated. The official Marina One site confirms Marine Drive, Kochi, describes 3 & 4 BHK residences and highlights its E7 and S10 towers. SOBHA’s Kerala project catalogue, checked 16 October 2026, lists Marina One with 3 & 4 bed residences sized 2,294–3,061 sq ft and displayed “8 Apartments Available.” That is the developer’s project-wide marketing inventory snapshot, may change, and does not establish that the unit advertised by Trikan is available. A related older Trikan reel mentioned a historical starting price of ₹2.6 Cr; this is neither current pricing nor a quote for the specific 4 BHK. The image is an official project render, not a photograph of this unit. Confirm the tower, phase, unit size, current price and availability with Trikan and the authorised sales team.$q$,
  inventory_source_url = 'https://www.sobha.com/property-in-kerala-for-sale/'
where source_url = 'https://www.instagram.com/reel/DL5C5BwT9Os/';

-- Intentionally do not change status: social posts and project-wide marketing counts do not confirm an individual unit's current availability.
