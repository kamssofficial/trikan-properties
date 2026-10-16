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
-- Correct both older descriptions and the intermediate catalogue revision.
update public.properties
set
  price_label = 'Official SOBHA page: from ₹2.9 Cr* · verify current quote',
  description = replace(
    replace(
      replace(
        description,
        'The K-RERA Phase 3 record, last modified 7 October 2026, marks the phase In Progress and lists a proposed completion of 30 April 2029, which differs from the developer page’s Phase 3 target; confirm the latest delivery schedule.',
        'The K-RERA Phase 3 record (K-RERA/PRJ/TSR/191/2023), last modified by the promoter on 7 October 2026 and reviewed 16 October 2026, lists the project In Progress, 154 of 160 units sold, and a proposed completion date of 30 April 2029. This differs from SOBHA’s December 2028 target; confirm the latest phase-specific completion and remaining inventory with both sources.'
      ),
      'The current K-RERA Phase 3 record (K-RERA/PRJ/TSR/191/2023), reviewed 16 October 2026, lists the project In Progress, 136 of 160 units sold, and a proposed completion date of 31 December 2028, matching the developer page’s Phase 3 target. Reconfirm the schedule and available units directly.',
      'The K-RERA Phase 3 record (K-RERA/PRJ/TSR/191/2023), last modified by the promoter on 7 October 2026 and reviewed 16 October 2026, lists the project In Progress, 154 of 160 units sold, and a proposed completion date of 30 April 2029. This differs from SOBHA’s December 2028 target; confirm the latest phase-specific completion and remaining inventory with both sources.'
    ),
    '₹2.16 Cr*',
    '₹2.9 Cr*'
  )
where source_url = 'https://www.instagram.com/trikan__properties/reel/DZ_9wqRPUu2/';
