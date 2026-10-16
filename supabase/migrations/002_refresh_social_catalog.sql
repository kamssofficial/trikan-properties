-- Refresh the public catalogue with source-attributed Trikan/Anseen posts.
-- Run after 001_initial_schema.sql. Existing seed rows linked to these post URLs are replaced.
-- Every new row remains status='verify': public advertising does not prove live inventory.
-- All photo URLs below are illustrative placeholders, not photographs of the specific units.

alter table public.properties
  add column if not exists related_source_url text,
  add column if not exists related_source_label text;

delete from public.properties
where source_url in (
  'https://www.instagram.com/reel/DL5C5BwT9Os/',
  'https://www.instagram.com/reel/DHlhcokzFtc/',
  'https://www.instagram.com/reel/DGdPTD8y0Mr/',
  'https://www.instagram.com/reel/Dam-vMoBqhZ/',
  'https://www.instagram.com/reel/DP5-HswEsQK/',
  'https://www.instagram.com/reel/C84oEumhfli/',
  'https://www.instagram.com/reel/DctJSH8h6NK/',
  'https://www.instagram.com/trikan__properties/',
  'https://www.instagram.com/trikan__properties/reel/Dc2-3r2sPiK/',
  'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/',
  'https://www.instagram.com/anseen_trikan/reel/DLrWCtBxj7s/',
  'https://www.instagram.com/anseen_trikan/reel/DL-DNefTuKH/',
  'https://www.instagram.com/reel/DGLJS9KTVaz/',
  'https://www.instagram.com/anseen_trikan/reel/DL4zIVkTDeS/',
  'https://www.instagram.com/anseen_trikan/reel/DQtwc9qCaaT/',
  'https://www.instagram.com/anseen_trikan/reel/DNS7CyAz6dT/',
  'https://www.instagram.com/trikan__properties/p/DVK-Xw4DzBi/',
  'https://www.instagram.com/trikan__properties/reel/DTDTj96D6FV/',
  'https://www.instagram.com/anseen_trikan/reel/DTrnbBRCu6I/'
);

insert into public.properties
  (title, category, bedrooms, area_sqft, location, price_label, status, description,
   image_url, source_url, source_label, featured, related_source_url, related_source_label)
values
  (
    'Premium 2 & 3 BHK community', 'Apartment', null, null, 'Edappally, Kochi',
    'Historical post: from ₹1.20 Cr+', 'verify',
    $$Trikan’s September 4, 2026 post promoted 2 & 3 BHK homes in an unnamed premium residential community in Edappally. The post states approximately 16 acres, 60%+ open spaces, 40+ amenities and an approximately 20,000 sq ft clubhouse. Location distances claimed in that post: Oberon Mall 300 m; Lulu Mall 1 km; Edappally Metro 1 km; MAJ Hospital 1 km; Edappally Church 1 km; CUSAT 4 km; Cochin International Airport 24 km. The project name is not stated in the caption. ₹1.20 Cr+ is the historical advertised starting price, not a live quote. Confirm the project, unit details and availability directly.$$,
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/trikan__properties/reel/Dc2-3r2sPiK/',
    'Trikan Instagram · 04 Sep 2026', true, null, null
  ),
  (
    'Luxury riverfront 3 & 4 BHK residences', 'Apartment', null, null, 'Feroke, Kozhikode',
    'Historical pre-launch: from ₹3.5 Cr*', 'verify',
    $$Trikan’s August 31, 2026 pre-launch post advertised luxury 3 & 4 BHK residences on the banks of the Chaliyar River in Feroke, Kozhikode. The post claims 100 m of exclusive river frontage, twin towers with 44 floors and a 4.3-acre site. The project name and current inventory were not stated in the caption. ₹3.5 Cr* was the advertised pre-launch starting price; the post notes terms and conditions apply. Confirm the developer/project name, RERA project status, price and availability before relying on this offer.$$,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/trikan__properties/reel/DctJSH8h6NK/',
    'Trikan Instagram · 31 Aug 2026', true, null, null
  ),
  (
    'Sobha Metropolis', 'Apartment', null, null, 'Thrissur, Kerala',
    'Brochure and price on enquiry', 'verify',
    $$In a June 24, 2026 reel, Trikan Realtors introduced Sobha Metropolis and invited viewers to DM “Thrissur” for the full brochure. That caption does not state unit sizes, prices or present availability. A separate older Trikan reel advertised 3 & 4 BHK apartments in Thrissur at 1,762–2,842 sq ft, but it does not explicitly identify the project as Sobha Metropolis; do not assume those specifications belong to this project without confirmation.$$,
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/',
    'Trikan Instagram · 24 Jun 2026', true,
    'https://www.instagram.com/reel/C84oEumhfli/',
    'Older Trissur 3 & 4 BHK post (project not named)'
  ),
  (
    'Queen’s Gateway by Varma Homes', 'Apartment', null, null, 'Cheranalloor, near Edappally, Kochi',
    'Historical post: from ₹99 lakh', 'verify',
    $$Anseen Anil’s public Instagram reel dated July 4, 2025 promoted Queen’s Gateway by Varma Homes in Cheranalloor, near Edappally. The post advertised 2, 3 and 4 BHK apartments, stated sizes from 1,289 to 3,420 sq ft and a starting price of ₹99 lakh. These are historical marketing claims, not confirmed current prices or inventory. Confirm unit-specific pricing, the developer’s current offer and availability directly.$$,
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/anseen_trikan/reel/DLrWCtBxj7s/',
    'Anseen Anil Instagram · 04 Jul 2025', false, null, null
  ),
  (
    'Marina One · 4 BHK apartment', 'Apartment', 4, null, 'Kochi, Kerala',
    'Related project post: historical starting price ₹2.6 Cr', 'verify',
    $$A July 9, 2025 reel on Anseen Anil’s public Instagram account advertised a brand-new 4 BHK apartment for sale at Marina One in Kochi. A separate reel dated July 11, 2025 described Marina One as a waterfront development with 3 & 4 BHK apartments, backwater views, sky villas, premium amenities and waterfront walkways, with a historical project starting price of ₹2.6 Cr. That starting price is not a confirmed price for this specific 4 BHK unit. Confirm the exact unit, price, developer information and current availability.$$,
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/reel/DL5C5BwT9Os/',
    'Anseen Anil Instagram · 09 Jul 2025', true,
    'https://www.instagram.com/anseen_trikan/reel/DL-DNefTuKH/',
    'Marina One project overview · 11 Jul 2025'
  ),
  (
    '3 BHK apartment · 1,817 sq ft', 'Apartment', 3, 1817, 'M.G. Road, Ernakulam, Kochi',
    'Price on enquiry', 'verify',
    $$Trikan’s February 24, 2025 post described a 3 BHK, 1,817 sq ft apartment in an unnamed premium residential project on M.G. Road, Ernakulam. The caption listed Cochin Shipyard at 450 m, Medical Trust Hospital at 350 m, Marine Drive at 2.3 km, Subhash Bose Park at 1.4 km, the metro station at 1.5 km, Ernakulam South railway station at 1.1 km, Centre Square Mall at 2 km and Cochin International Airport at 31.4 km, among other nearby destinations. Project name, asking price and current availability are not stated.$$,
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/reel/DGdPTD8y0Mr/',
    'Trikan Instagram · 24 Feb 2025', false, null, null
  ),
  (
    'Brand-new 4 BHK residence · 3,560 sq ft', 'Apartment', 4, 3560, 'Kochi, Kerala',
    'Price on enquiry', 'verify',
    $$A March 24, 2025 Trikan reel advertised a brand-new 4 BHK residence measuring 3,560 sq ft and used the Kochi hashtag. The project name, exact neighbourhood, price and current availability were not stated in the caption; confirm all details directly before treating this as active inventory.$$,
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/reel/DHlhcokzFtc/',
    'Trikan Instagram · 24 Mar 2025', false, null, null
  ),
  (
    'Waterfront 3 & 4 BHK apartments', 'Apartment', null, null, 'Marine Drive, Kochi',
    'Price on enquiry', 'verify',
    $$A February 17, 2025 Trikan reel promoted an unnamed 3 & 4 BHK ultra-luxury apartment project at the corner of Marine Drive in Kochi. The caption describes waterfront on two sides and panoramic Arabian Sea views and lists nearby hospitals, colleges, shopping and transport. The caption does not name the project or state unit sizes and prices. This is kept separate from Marina One because the source does not explicitly identify it as that project.$$,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/reel/DGLJS9KTVaz/',
    'Trikan Instagram · 17 Feb 2025', false, null, null
  ),
  (
    '3 & 4 BHK luxury apartments', 'Apartment', null, null, 'Thrissur, Kerala',
    'Price on enquiry', 'verify',
    $$A July 1, 2024 Trikan post advertised 3 & 4 BHK apartments in Thrissur, with stated sizes from 1,762 to 2,842 sq ft. The project name and price were not included in the caption. Nearby points listed included St. Jude Public School at 1 km, proposed HiLite Mall at 1 km, National Highway at 700 m, Jubilee Mission Medical College at 4.6 km and Thrissur Railway Station at 7 km. A newer Trikan post separately names Sobha Metropolis, but the captions do not explicitly prove the two posts describe the same project.$$,
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/reel/C84oEumhfli/',
    'Trikan Instagram · 01 Jul 2024', false, null, null
  ),
  (
    'Brand-new 3 BHK apartment', 'Apartment', 3, null, 'Edappally, Kochi',
    'Price on enquiry', 'verify',
    $$A July 9, 2025 reel on Anseen Anil’s public Instagram account advertised a brand-new 3 BHK apartment for sale in Edappally. The caption did not state the project name, built-up area or price. This may be a different unit from the larger Edappally community promotion; the source does not establish a link between them. Confirm current availability and all unit details.$$,
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/anseen_trikan/reel/DL4zIVkTDeS/',
    'Anseen Anil Instagram · 09 Jul 2025', false, null, null
  ),
  (
    'Private-island apartment', 'Apartment', null, null, 'Kochi, Kerala',
    'Details on enquiry', 'verify',
    $$A November 6, 2025 reel on Anseen Anil’s public Instagram account said “Own an apartment in a private island, Kochi.” The post does not state the project name, BHK configuration, size or price. This is a lead reference only; ask Trikan to identify the project and confirm all facts before presenting it as a specific available unit.$$,
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/anseen_trikan/reel/DQtwc9qCaaT/',
    'Anseen Anil Instagram · 06 Nov 2025', false, null, null
  ),
  (
    'Bengaluru township apartment opportunity', 'Apartment', null, null, 'Bengaluru, Karnataka',
    'Payment-plan claim in historical post; details on enquiry', 'verify',
    $$An August 13, 2025 reel on Anseen Anil’s public Instagram account stated, “Paying just 20% now, own an apartment in one of the largest township project in Banglore,” and gave the Trikan contact number. The project name, developer, unit sizes, full payment schedule, legal details, price and current availability are not disclosed in the caption. Do not treat the 20% statement as an independently verified payment plan.$$,
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/anseen_trikan/reel/DNS7CyAz6dT/',
    'Anseen Anil Instagram · 13 Aug 2025', false, null, null
  
  ,
  (
    'Unnamed Kakkanad project · pre-launch enquiry', 'Apartment', null, null, 'Kakkanad, Kochi',
    'Price and brochure on enquiry', 'verify',
    $q$In a February 24, 2026 post, Trikan described Kakkanad as a fast-growing corridor, advertised direct Seaport–Airport Road access, said the metro was right in front, and mentioned limited-time pre-launch benefits. The caption does not name the project or state BHK options, area, price or current availability. Trikan also published a separate January 3, 2026 post about a newly launched project in Kakkanad, but the posts do not establish that they refer to the same development. Treat this as a source reference and ask Trikan to identify the project.$q$,
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/trikan__properties/p/DVK-Xw4DzBi/',
    'Trikan Instagram · 24 Feb 2026', false,
    'https://www.instagram.com/trikan__properties/reel/DTDTj96D6FV/',
    'Separate Kakkanad new-launch post · 03 Jan 2026'
  ),
  (
    'Newly launched project · Kakkanad', 'Apartment', null, null, 'Kakkanad, Kochi',
    'Details on enquiry', 'verify',
    $q$A January 3, 2026 reel from Trikan Realtors states “Newly Launched Project in Kakkanad” and invites enquiries. The public caption does not state the project name, developer, BHK configuration, unit sizes, price or current availability. A separate February 24, 2026 post also refers to an unnamed Kakkanad pre-launch offer; no source confirms that both posts concern the same project.$q$,
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/trikan__properties/reel/DTDTj96D6FV/',
    'Trikan Instagram · 03 Jan 2026', false,
    'https://www.instagram.com/trikan__properties/p/DVK-Xw4DzBi/',
    'Separate Kakkanad pre-launch post · 24 Feb 2026'
  ),
  (
    'Newly launched project · Thiruvananthapuram', 'Apartment', null, null, 'Thiruvananthapuram, Kerala',
    'Details on enquiry', 'verify',
    $q$Anseen Anil’s January 18, 2026 public reel says “Newly Launched || Thiruvananthapuram.” The caption does not provide a project name, developer, BHK configuration, area, price or current availability. Comments mention a mock-up flat, but this is user-comment text rather than an independently verified listing specification. Ask Trikan to identify the project and confirm all current details.$q$,
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    'https://www.instagram.com/anseen_trikan/reel/DTrnbBRCu6I/',
    'Anseen Anil Instagram · 18 Jan 2026', false, null, null
  );

-- Keep all public listing rows as 'verify' until Trikan confirms each project's current inventory.
