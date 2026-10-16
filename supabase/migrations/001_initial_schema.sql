-- Trikan Properties initial schema
-- Apply in Supabase SQL Editor. Requires Supabase Auth.

create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  category text not null default 'Apartment',
  bedrooms integer check (bedrooms is null or bedrooms between 0 and 30),
  area_sqft integer check (area_sqft is null or area_sqft > 0),
  location text not null,
  price_label text not null default 'Price on enquiry',
  status text not null default 'verify' check (status in ('verify', 'available', 'under_offer', 'sold')),
  description text not null default '',
  image_url text,
  source_url text,
  source_label text not null default 'Trikan listing',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  name text,
  email text,
  phone text,
  message text not null check (char_length(message) between 5 and 4000),
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  created_at timestamptz not null default now()
);

create index if not exists properties_status_featured_idx on public.properties(status, featured desc);
create index if not exists properties_location_idx on public.properties(location);
create index if not exists enquiries_created_at_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties
for each row execute function public.set_updated_at();

-- Admin authorization is based on a trusted claim set in auth.users.app_metadata.
-- Do not use user-editable user_metadata for roles.
create or replace function public.is_trikan_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.properties enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "Public can read property catalogue" on public.properties;
create policy "Public can read property catalogue"
on public.properties for select to anon, authenticated
using (status <> 'sold' or public.is_trikan_admin());

drop policy if exists "Admins can insert properties" on public.properties;
create policy "Admins can insert properties"
on public.properties for insert to authenticated
with check (public.is_trikan_admin());

drop policy if exists "Admins can update properties" on public.properties;
create policy "Admins can update properties"
on public.properties for update to authenticated
using (public.is_trikan_admin())
with check (public.is_trikan_admin());

drop policy if exists "Admins can delete properties" on public.properties;
create policy "Admins can delete properties"
on public.properties for delete to authenticated
using (public.is_trikan_admin());

-- Anyone may submit an enquiry, but public visitors cannot read or edit enquiries.
drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries"
on public.enquiries for insert to anon, authenticated
with check (
  char_length(message) between 5 and 4000
  and (email is null or char_length(email) <= 254)
  and (phone is null or char_length(phone) <= 40)
);

drop policy if exists "Admins can read enquiries" on public.enquiries;
create policy "Admins can read enquiries"
on public.enquiries for select to authenticated
using (public.is_trikan_admin());

drop policy if exists "Admins can update enquiries" on public.enquiries;
create policy "Admins can update enquiries"
on public.enquiries for update to authenticated
using (public.is_trikan_admin())
with check (public.is_trikan_admin());

-- Seed researched social-post references. All listings start as 'verify'.
-- Image URLs are illustrative only; replace with approved original media before launch.
insert into public.properties
  (title, category, bedrooms, area_sqft, location, price_label, status, description, image_url, source_url, source_label, featured)
values
  ('4 BHK at Marina One', 'Apartment', 4, null, 'Marine Drive, Kochi', 'Price on enquiry', 'verify',
   'A Trikan social post advertised a brand-new four-bedroom apartment at Marina One. Unit size, exact price and current availability need direct confirmation.',
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/DL5C5BwT9Os/', 'Instagram reel', true),
  ('4 BHK residence · 3,560 sq ft', 'Apartment', 4, 3560, 'Kochi', 'Price on enquiry', 'verify',
   'A separate Trikan reel advertised a brand-new 4 BHK residence measuring 3,560 sq ft. The project name and current availability require confirmation.',
   'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/DHlhcokzFtc/', 'Instagram reel', false),
  ('3 BHK on M.G. Road', 'Apartment', 3, 1817, 'M.G. Road, Ernakulam', 'Price on enquiry', 'verify',
   'A Trikan post describes a 3 BHK apartment of approximately 1,817 sq ft in a premium residential project on M.G. Road. Price and availability unconfirmed.',
   'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/DGdPTD8y0Mr/', 'Instagram reel', true),
  ('4.5 BHK furnished penthouse', 'Penthouse', 4, 3500, 'Thrikkakara, Kochi', 'Historical post: ₹2.5 Cr negotiable', 'verify',
   'A public profile excerpt described an unused fully furnished 4.5 BHK penthouse of around 3,500 sq ft. Original direct post not independently resolved; reconfirm advertised price.',
   'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/trikan__properties/', 'Instagram profile excerpt', true),
  ('Kent Eco Sanctum', 'Apartment', 2, null, 'Edappally, Kochi', 'Historical post: ₹1.20 Cr+', 'verify',
   'A Trikan reel promoted 2 and 3 BHK homes at Kent Eco Sanctum with historical starting pricing of ₹1.20 Cr+. Not live pricing or confirmation of inventory.',
   'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/Dam-vMoBqhZ/', 'Instagram reel', false),
  ('2 & 3 BHK residences', 'Apartment', 2, 1300, 'Elamakkara, Kochi', 'Price on enquiry', 'verify',
   'A Trikan promotion referenced 2 and 3 BHK apartments and a 1,300 sq ft figure. Confirm which configuration the area refers to.',
   'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/DP5-HswEsQK/', 'Instagram reel', false),
  ('3 & 4 BHK residences', 'Apartment', 3, null, 'Thrissur, Kerala', 'Price on enquiry', 'verify',
   'Older Trikan post advertised 3 and 4 BHK apartments with stated sizes from 1,762 to 2,842 sq ft. Project, pricing and availability unverified.',
   'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/C84oEumhfli/', 'Instagram reel', false),
  ('Luxury riverfront residences', 'Apartment', 3, null, 'Feroke, Kozhikode', 'Historical post: ₹3.5 Cr+', 'verify',
   'A Trikan reel promoted luxury 3 and 4 BHK riverfront residences, referring to twin towers and 44 floors. Project name, pricing and inventory need confirmation.',
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', 'https://www.instagram.com/reel/DctJSH8h6NK/', 'Instagram reel', false)
on conflict do nothing;