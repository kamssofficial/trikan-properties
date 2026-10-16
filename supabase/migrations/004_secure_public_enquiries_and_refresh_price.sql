-- Security/accuracy follow-up migration. Apply after migrations 001-003.
-- Public visitors may submit new enquiries only. They cannot insert pre-closed records
-- to hide them from the inbox, and field lengths are bounded before reaching the inbox.

drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries"
on public.enquiries for insert to anon, authenticated
with check (
  status = 'new'
  and char_length(message) between 5 and 4000
  and (name is null or char_length(name) <= 120)
  and (email is null or char_length(email) <= 254)
  and (phone is null or char_length(phone) <= 40)
);

-- Keep the database seed aligned with the official SOBHA page now reviewed.
-- This also corrects an earlier price if migrations 001-003 had already been applied.
update public.properties
set
  price_label = 'Official SOBHA page: from ₹2.9 Cr* · verify current quote',
  description = replace(description, '₹2.16 Cr*', '₹2.9 Cr*')
where source_url = 'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/';
