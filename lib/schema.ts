import { ProductCategory, BentoItemSize, CardVariant, ContentPriority } from './enums';

// Props types for component data
export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImage: string;
}

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: ProductCategory;
  rating: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOrganic?: boolean;
  isCrueltyFree?: boolean;
  isHandcrafted?: boolean;
}

export interface CategoryProps {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  productCount: number;
}

export interface BentoItemProps {
  id: string;
  size: BentoItemSize;
  variant: CardVariant;
  priority: ContentPriority;
}

export interface BentoLayoutProps {
  heroItems: BentoItemProps[];
}

export interface SpecialOffersProps {
  freeShipping: boolean;
  bundleDiscount: number;
  newCustomerOffer: string;
}

export interface RootComponentProps {
  heroSection: HeroSectionProps;
  featuredProduct: ProductProps;
  products: ProductProps[];
  categories: CategoryProps[];
  bentoLayout: BentoLayoutProps;
  specialOffers: SpecialOffersProps;
}