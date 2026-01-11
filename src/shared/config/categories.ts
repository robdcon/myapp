export const ITEM_CATEGORIES = [
  'Fruit',
  'Vegetables',
  'Bakery',
  'Cereals, Grains and Pulses',
  'Tinned Food',
  'Dairy Products',
  'Meat',
  'Fish and Seafood',
  'Beverages',
  'Condiments',
  'Confectionery',
  'Domestic Supplies',
  'Oils and Vinegars',
  'Baking Supplies',
  'Snacks',
  'Toiletries',
  'Kitchen',
  'Other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const DEFAULT_CATEGORY = 'Other';
