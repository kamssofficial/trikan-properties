-- Add official project-source links and enrich identified projects from builder/K-RERA sources.
-- Run after 001_initial_schema.sql and 002_refresh_social_catalog.sql.
-- The social-media source remains attached to every record; official project media are renders, not unit-specific photos.

alter table public.properties
  add column if not exists official_source_url text,
  add column if not exists rera_source_url text;

update public.properties
set
  title = 'Queen’s Gateway by Varma Homes',
  location = 'Cheranalloor, near Edappally, Kochi',
  price_label = 'Historical Trikan-related post: from ₹99 lakh · current price on enquiry',
  description = $q$Anseen Anil’s July 4 and July 16, 2025 public reels promoted Queen’s Gateway by Varma Homes in Cheranalloor near Edappally. The older posts advertised 2, 3 and 4 BHK apartments, sizes from 1,289 to 3,420 sq ft and a historical starting price of ₹99 lakh; these are not a current quote. The official Varma Homes page describes a 98.37-cent site, one B+G+18 tower and 96 apartments across 2, 3 and 4 BHK configurations, and lists amenities including a swimming pool, open garden, party area, multi-purpose hall and health club. The official project page gives K-RERA registration K-RERA/PRJ/ERN/226/2024. The K-RERA record was last modified 7 October 2026 and marks the project In Progress, with 65 of 96 units sold and a proposed completion date of 31 July 2031. The Varma Homes page separately lists 31 March 2031, so the proposed completion date differs between the two sources and must be confirmed. The developer page does not publish a current price. Confirm exact unit, current pricing, inventory and delivery schedule with Varma Homes/Trikan.$q$,
  image_url = 'https://www.varmahomes.com/images/projects/queensgateway/gallery/1.jpg',
  related_source_url = 'https://www.instagram.com/anseen_trikan/reel/DMKxolQTqZH/',
  related_source_label = 'Related Cheranalloor project post · 16 Jul 2025',
  official_source_url = 'https://www.varmahomes.com/queensgateway.html',
  rera_source_url = 'https://reraonline.kerala.gov.in/PrintPreview/PrintPreview?q=l6rliEWXEAw8hZb2fri6ZeSUu%2BNUNgcGTC9iplPOLWakuiop0BzGJn%2Fruyors4Ru%2F813ihsOtq0U5S2g%2FZ%2BIJO6o32uLHexDhneJeOd336Ch7s2yTvcjTchVtKylBNYxFEwlDr3Jie0XfHCdd4k%2FQ9xv9YiqX88z6sAauQ1JZdNCCrVHPAJ%2BgA%3D%3D'
where source_url = 'https://www.instagram.com/anseen_trikan/reel/DLrWCtBxj7s/';

update public.properties
set
  title = 'SOBHA Metropolis · 3 & 4 bed residences',
  location = 'Ollur Road, Kuttanellur, Thrissur',
  price_label = 'Official SOBHA page: from ₹2.9 Cr* · verify current quote',
  description = $q$Trikan introduced SOBHA Metropolis in a June 24, 2026 post. The official SOBHA project page, reviewed October 16, 2026, lists the location as Ollur Road, Kuttanellur, Thrissur; an 8.41-acre site; 504 apartments; and a starting price of ₹2.9 Cr* as currently displayed on the official page reviewed 16 October 2026; the page footnotes starred figures as of June 2026, so treat this as an indicative published price rather than a unit quote. It presents 3 & 4 bed residences sized 1,779–2,814 sq ft, while the FAQ also references 2, 3 & 4 BHK configurations; confirm exact configurations with SOBHA. The official page lists phase completion targets of December 2026, June 2028 and December 2028. The K-RERA Phase 3 record, last modified 7 October 2026, marks the phase In Progress and lists a proposed completion of 30 April 2029, which differs from the developer page’s Phase 3 target; confirm the latest delivery schedule. The older Trikan post for 1,762–2,842 sq ft Thrissur apartments does not explicitly identify this project and has not been merged into these specifications. Live unit-level pricing and availability require direct confirmation.$q$,
  image_url = 'https://www.sobha.com/wp-content/uploads/2021/03/Metropolis-500x500-03.webp',
  related_source_url = 'https://www.instagram.com/reel/C84oEumhfli/',
  related_source_label = 'Older Thrissur 3 & 4 BHK post (project not named)',
  official_source_url = 'https://www.sobha.com/thrissur/sobha-metropolis/',
  rera_source_url = 'https://reraonline.kerala.gov.in/PrintPreview/PrintPreview?q=SSaTmXk488IeIy3yl80ww6s2t%2FCPS2bB2SxYXUfSiDQ%2Bz1bNouuK41T1Ycn2Ijbi%2Fx8U77sW6IrxsQHWUPPuBffdb0N%2Beg8DapeTlnejWIDUG6Tg8FKkvXtV5pAUHAflqkPmOEZkwFQZM%2FbMX2MGlqhAbewpu4Fqol207PavCNflldUkKYIAiw%3D%3D'
where source_url = 'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/';

update public.properties
set
  location = 'Marine Drive, Kochi',
  price_label = 'Unit price on enquiry · historical project post from ₹2.6 Cr*',
  description = $q$Anseen Anil’s July 9, 2025 reel advertised a brand-new 4 BHK apartment for sale at Marina One; the specific unit size, exact asking price and present availability were not stated. The official Marina One website confirms the development is at Marine Drive, Kochi, describes 3 & 4 BHK residences and lists newly launched E7 and S10 towers. The website shows five K-RERA registrations across phases: K-RERA/PRJ/251/2020, K-RERA/PRJ/252/2020, K-RERA/PRJ/253/2020, K-RERA/PRJ/ERN/076/2023 and K-RERA/PRJ/ERN/064/2025. An older Trikan-related reel mentioned a project starting price of ₹2.6 Cr; treat that as historical, not a current price or a quote for this 4 BHK unit. The image is an official Marina One project render, not a photograph of the specific unit. Confirm phase, tower, unit details, current price and availability with Trikan and the project’s authorised sales team.$q$,
  image_url = 'https://marinaone.in/wp-content/uploads/2025/04/MarinaOne_2550x1440.webp',
  official_source_url = 'https://marinaone.in/',
  rera_source_url = null
where source_url = 'https://www.instagram.com/reel/DL5C5BwT9Os/';

-- All listing status values remain 'verify'. The official and social-source details do not establish live unit inventory.
