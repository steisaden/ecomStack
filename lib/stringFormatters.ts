import { ProductCategory } from './enums';

// Format currency for product prices
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Format discount percentage
export const formatDiscount = (originalPrice: number, salePrice: number): string => {
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `${discount}% OFF`;
};

// Format product rating
export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)} ⭐`;
};

// Format category display name
export const formatCategoryName = (category: ProductCategory): string => {
  const categoryNames = {
    [ProductCategory.HAIR_CARE]: 'Hair Care',
    [ProductCategory.SKIN_CARE]: 'Skin Care',
    [ProductCategory.MAKEUP]: 'Makeup',
    [ProductCategory.WELLNESS]: 'Wellness',
    [ProductCategory.GIFT_SETS]: 'Gift Sets'
  };
  return categoryNames[category];
};