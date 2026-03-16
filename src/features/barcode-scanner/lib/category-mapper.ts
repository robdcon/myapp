import { ITEM_CATEGORIES, DEFAULT_CATEGORY } from '@/src/shared';
import type { ItemCategory } from '@/src/shared/config/categories';

/**
 * Mapping of common product category keywords to app categories
 * Keys are lowercase for case-insensitive matching
 */
const CATEGORY_MAPPINGS: Record<string, ItemCategory> = {
  // Fruit
  fruit: 'Fruit',
  fruits: 'Fruit',
  apple: 'Fruit',
  banana: 'Fruit',
  orange: 'Fruit',
  citrus: 'Fruit',
  berries: 'Fruit',

  // Vegetables
  vegetable: 'Vegetables',
  vegetables: 'Vegetables',
  veggie: 'Vegetables',
  salad: 'Vegetables',
  greens: 'Vegetables',
  tomato: 'Vegetables',
  potato: 'Vegetables',

  // Bakery
  bakery: 'Bakery',
  bread: 'Bakery',
  baked: 'Bakery',
  pastry: 'Bakery',
  cake: 'Bakery',
  muffin: 'Bakery',

  // Cereals, Grains and Pulses
  cereal: 'Cereals, Grains and Pulses',
  cereals: 'Cereals, Grains and Pulses',
  grain: 'Cereals, Grains and Pulses',
  grains: 'Cereals, Grains and Pulses',
  rice: 'Cereals, Grains and Pulses',
  pasta: 'Cereals, Grains and Pulses',
  oat: 'Cereals, Grains and Pulses',
  pulses: 'Cereals, Grains and Pulses',
  beans: 'Cereals, Grains and Pulses',
  lentils: 'Cereals, Grains and Pulses',

  // Tinned Food
  tinned: 'Tinned Food',
  canned: 'Tinned Food',
  can: 'Tinned Food',
  preserved: 'Tinned Food',

  // Dairy Products
  dairy: 'Dairy Products',
  milk: 'Dairy Products',
  cheese: 'Dairy Products',
  yogurt: 'Dairy Products',
  yoghurt: 'Dairy Products',
  butter: 'Dairy Products',
  cream: 'Dairy Products',
  egg: 'Dairy Products',
  eggs: 'Dairy Products',

  // Meat
  meat: 'Meat',
  beef: 'Meat',
  pork: 'Meat',
  chicken: 'Meat',
  poultry: 'Meat',
  lamb: 'Meat',
  turkey: 'Meat',
  sausage: 'Meat',

  // Fish and Seafood
  fish: 'Fish and Seafood',
  seafood: 'Fish and Seafood',
  salmon: 'Fish and Seafood',
  tuna: 'Fish and Seafood',
  shrimp: 'Fish and Seafood',
  prawn: 'Fish and Seafood',

  // Beverages
  beverage: 'Beverages',
  beverages: 'Beverages',
  drink: 'Beverages',
  drinks: 'Beverages',
  juice: 'Beverages',
  soda: 'Beverages',
  water: 'Beverages',
  coffee: 'Beverages',
  tea: 'Beverages',
  alcohol: 'Beverages',
  beer: 'Beverages',
  wine: 'Beverages',

  // Condiments
  condiment: 'Condiments',
  condiments: 'Condiments',
  sauce: 'Condiments',
  sauces: 'Condiments',
  ketchup: 'Condiments',
  mustard: 'Condiments',
  mayonnaise: 'Condiments',
  dressing: 'Condiments',
  spice: 'Condiments',
  spices: 'Condiments',
  seasoning: 'Condiments',

  // Confectionery
  confectionery: 'Confectionery',
  candy: 'Confectionery',
  chocolate: 'Confectionery',
  sweet: 'Confectionery',
  sweets: 'Confectionery',
  dessert: 'Confectionery',

  // Domestic Supplies
  domestic: 'Domestic Supplies',
  cleaning: 'Domestic Supplies',
  detergent: 'Domestic Supplies',
  laundry: 'Domestic Supplies',
  household: 'Domestic Supplies',

  // Oils and Vinegars
  oil: 'Oils and Vinegars',
  oils: 'Oils and Vinegars',
  vinegar: 'Oils and Vinegars',
  olive: 'Oils and Vinegars',

  // Baking Supplies
  baking: 'Baking Supplies',
  flour: 'Baking Supplies',
  sugar: 'Baking Supplies',
  yeast: 'Baking Supplies',

  // Snacks
  snack: 'Snacks',
  snacks: 'Snacks',
  chips: 'Snacks',
  crisps: 'Snacks',
  nuts: 'Snacks',
  popcorn: 'Snacks',
  crackers: 'Snacks',

  // Toiletries
  toiletries: 'Toiletries',
  toiletry: 'Toiletries',
  soap: 'Toiletries',
  shampoo: 'Toiletries',
  toothpaste: 'Toiletries',
  hygiene: 'Toiletries',
  cosmetic: 'Toiletries',
  cosmetics: 'Toiletries',

  // Kitchen
  kitchen: 'Kitchen',
  utensil: 'Kitchen',
  cookware: 'Kitchen',

  // Pharmacy
  pharmacy: 'Pharmacy',
  medicine: 'Pharmacy',
  health: 'Pharmacy',
  vitamin: 'Pharmacy',
  vitamins: 'Pharmacy',
  supplement: 'Pharmacy',
};

/**
 * Map a product category string from external APIs to app category
 * Uses keyword matching against the category string
 */
export function mapProductCategory(externalCategory?: string): ItemCategory {
  if (!externalCategory) {
    return DEFAULT_CATEGORY;
  }

  const lowerCategory = externalCategory.toLowerCase();

  // First, check for exact or partial matches in mapping
  for (const [keyword, appCategory] of Object.entries(CATEGORY_MAPPINGS)) {
    if (lowerCategory.includes(keyword)) {
      return appCategory;
    }
  }

  // Check if the external category matches any app category directly
  for (const appCategory of ITEM_CATEGORIES) {
    if (lowerCategory.includes(appCategory.toLowerCase())) {
      return appCategory;
    }
  }

  return DEFAULT_CATEGORY;
}

/**
 * Check if a category string is a valid app category
 */
export function isValidCategory(category: string): category is ItemCategory {
  return (ITEM_CATEGORIES as readonly string[]).includes(category);
}
