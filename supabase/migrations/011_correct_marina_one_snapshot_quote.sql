-- The source inventory badge has a period inside its typographic quotation marks.
-- Replace the exact historic text with the current official catalogue count for Marina One.
update public.properties
set description = replace(
  description,
  '“8 Apartments Available.”',
  '“108 Apartments Available.”'
)
where source_url = 'https://www.instagram.com/reel/DL5C5BwT9Os/'
  and inventory_source_url = 'https://www.sobha.com/property-in-kerala-for-sale/';
