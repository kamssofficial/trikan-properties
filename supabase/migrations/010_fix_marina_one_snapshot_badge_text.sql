-- Correct the inventory badge count in the live Marina One description.
-- The official SOBHA Kerala catalogue card shows 108 apartments available before Marina One.
update public.properties
set description = replace(
  description,
  '“8 Apartments Available”',
  '“108 Apartments Available”'
)
where source_url = 'https://www.instagram.com/reel/DL5C5BwT9Os/'
  and inventory_source_url = 'https://www.sobha.com/property-in-kerala-for-sale/';
