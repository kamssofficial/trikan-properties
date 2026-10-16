-- Correct the Marina One availability badge association in the refreshed official inventory snapshot.
-- The SOBHA Kerala catalogue displays 108 apartments available immediately before the Marina One card.
-- This remains a project-wide marketing snapshot, not confirmation of an individual Trikan-offered unit.
update public.properties
set description = replace(
  description,
  'and 8 apartments available',
  'and 108 apartments available'
)
where source_url = 'https://www.instagram.com/reel/DL5C5BwT9Os/'
  and inventory_source_url = 'https://www.sobha.com/property-in-kerala-for-sale/';
