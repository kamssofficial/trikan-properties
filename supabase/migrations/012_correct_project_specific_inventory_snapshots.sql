-- Correct Marina One count and link to the project-specific official source.
-- SOBHA's Marine Drive page shows 8 Apartments Available; 108 is the listing count for SOBHA Atlantis.
update public.properties
set
  description = replace(description, '“108 Apartments Available.”', '“8 Apartments Available.”'),
  inventory_source_url = 'https://www.sobha.com/flats-in-marine-drive-kochi-for-sale/'
where source_url = 'https://www.instagram.com/reel/DL5C5BwT9Os/';

-- Link the SOBHA Metropolis entry to the Thrissur-specific official listing page.
update public.properties
set inventory_source_url = 'https://www.sobha.com/city/flats-in-thrissur/'
where source_url = 'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/';
