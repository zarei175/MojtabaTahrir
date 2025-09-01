// Export all product components
export { default as ProductCard } from './ProductCard';
export { default as ProductGrid } from './ProductGrid';
export { default as ProductFilter } from './ProductFilter';
export { default as CategoryFilter } from './CategoryFilter';
export { default as BrandFilter } from './BrandFilter';
export { default as ProductSearch } from './ProductSearch';

// Re-export types for convenience
export type {
  Product,
  ProductPrice,
  Inventory,
  Category,
  Brand
} from '@/types';