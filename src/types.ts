export type Language = 'fr' | 'ar';

export interface Product {
  id: string;
  name: { fr: string; ar: string };
  tagline: { fr: string; ar: string };
  description: { fr: string; ar: string };
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  colors?: { name: { fr: string; ar: string }; hex: string; image?: string }[];
  specs: {
    fr: { label: string; value: string }[];
    ar: { label: string; value: string }[];
  };
  benefits: {
    fr: string[];
    ar: string[];
  };
  ingredients?: {
    fr: string[];
    ar: string[];
  };
  themeColor: string; // Tailwind class like "from-mint-50 to-emerald-100"
  accentColor: string; // Tailwind bg-emerald-600, etc.
  textColor: string; // Tailwind text-emerald-800
  isBundle?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Testimonial {
  id: string;
  name: { fr: string; ar: string };
  avatar: string;
  rating: number;
  text: { fr: string; ar: string };
  product: { fr: string; ar: string };
  verified: boolean;
}

export interface FAQItem {
  id: string;
  question: { fr: string; ar: string };
  answer: { fr: string; ar: string };
}
