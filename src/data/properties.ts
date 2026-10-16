export type ListingStatus = 'verify' | 'available' | 'under_offer' | 'sold';

export type Property = {
  id: string;
  title: string;
  category: string;
  bedrooms: number | null;
  areaSqft: number | null;
  location: string;
  priceLabel: string;
  status: ListingStatus;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  featured: boolean;
  sourceLabel: string;
};

export const seedProperties: Property[] = [
  {
    id: 'marina-one-4bhk',
    title: '4 BHK at Marina One',
    category: 'Apartment',
    bedrooms: 4,
    areaSqft: null,
    location: 'Marine Drive, Kochi',
    priceLabel: 'Price on enquiry',
    status: 'verify',
    description: 'A Trikan social post advertised a brand-new four-bedroom apartment at Marina One. Unit size, exact price and current availability need direct confirmation.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/DL5C5BwT9Os/',
    featured: true,
    sourceLabel: 'Instagram reel',
  },
  {
    id: 'kochi-4bhk-3560',
    title: '4 BHK residence · 3,560 sq ft',
    category: 'Apartment',
    bedrooms: 4,
    areaSqft: 3560,
    location: 'Kochi',
    priceLabel: 'Price on enquiry',
    status: 'verify',
    description: 'A separate Trikan reel advertised a brand-new 4 BHK residence measuring 3,560 sq ft. The original caption did not clearly confirm the project name or current availability.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/DHlhcokzFtc/',
    featured: false,
    sourceLabel: 'Instagram reel',
  },
  {
    id: 'mg-road-3bhk-1817',
    title: '3 BHK on M.G. Road',
    category: 'Apartment',
    bedrooms: 3,
    areaSqft: 1817,
    location: 'M.G. Road, Ernakulam',
    priceLabel: 'Price on enquiry',
    status: 'verify',
    description: 'A Trikan post describes a three-bedroom apartment of approximately 1,817 sq ft in a premium residential project on M.G. Road. Price and availability are not confirmed.',
    imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/DGdPTD8y0Mr/',
    featured: true,
    sourceLabel: 'Instagram reel',
  },
  {
    id: 'thrikkakara-penthouse',
    title: '4.5 BHK furnished penthouse',
    category: 'Penthouse',
    bedrooms: 4,
    areaSqft: 3500,
    location: 'Thrikkakara, Kochi',
    priceLabel: 'Historical post: ₹2.5 Cr negotiable',
    status: 'verify',
    description: 'A public profile excerpt described an unused, fully furnished 4.5 BHK penthouse of around 3,500 sq ft. The original direct post was not independently resolved and the advertised price must be reconfirmed.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/trikan__properties/',
    featured: true,
    sourceLabel: 'Instagram profile excerpt',
  },
  {
    id: 'kent-eco-sanctum',
    title: 'Kent Eco Sanctum',
    category: 'Apartment',
    bedrooms: 2,
    areaSqft: null,
    location: 'Edappally, Kochi',
    priceLabel: 'Historical post: ₹1.20 Cr+',
    status: 'verify',
    description: 'A Trikan reel promoted 2 and 3 BHK homes at Kent Eco Sanctum with starting pricing of ₹1.20 Cr+. This is a historical promotional claim, not live pricing or confirmation of inventory.',
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/Dam-vMoBqhZ/',
    featured: false,
    sourceLabel: 'Instagram reel',
  },
  {
    id: 'elamakkara-2-3bhk',
    title: '2 & 3 BHK residences',
    category: 'Apartment',
    bedrooms: 2,
    areaSqft: 1300,
    location: 'Elamakkara, Kochi',
    priceLabel: 'Price on enquiry',
    status: 'verify',
    description: 'A Trikan promotion referenced 2 and 3 BHK apartments in Elamakkara and a 1,300 sq ft figure. Confirm which configuration the area refers to, along with price and availability.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/DP5-HswEsQK/',
    featured: false,
    sourceLabel: 'Instagram reel',
  },
  {
    id: 'thrissur-3-4bhk',
    title: '3 & 4 BHK residences',
    category: 'Apartment',
    bedrooms: 3,
    areaSqft: null,
    location: 'Thrissur, Kerala',
    priceLabel: 'Price on enquiry',
    status: 'verify',
    description: 'An older Trikan post advertised 3 and 4 BHK apartments with stated sizes ranging from 1,762 to 2,842 sq ft. Project identity, pricing and availability are unverified.',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/C84oEumhfli/',
    featured: false,
    sourceLabel: 'Instagram reel',
  },
  {
    id: 'feroke-riverfront',
    title: 'Luxury riverfront residences',
    category: 'Apartment',
    bedrooms: 3,
    areaSqft: null,
    location: 'Feroke, Kozhikode',
    priceLabel: 'Historical post: ₹3.5 Cr+',
    status: 'verify',
    description: 'A Trikan reel promoted luxury 3 and 4 BHK riverfront residences, referencing twin towers and 44 floors. The project name, current pricing and inventory need confirmation.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://www.instagram.com/reel/DctJSH8h6NK/',
    featured: false,
    sourceLabel: 'Instagram reel',
  },
];