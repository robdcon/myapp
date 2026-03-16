// Product lookup types
export interface ProductLookupResult {
  found: boolean;
  barcode: string;
  source: 'open_food_facts' | 'upcitemdb' | null;
  product?: {
    name: string;
    brand?: string;
    category?: string;
    imageUrl?: string;
    quantity?: string;
  };
  error?: string;
}

// Open Food Facts API response types
interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  quantity?: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

// UPCitemdb API response types
interface UPCitemdbItem {
  title?: string;
  brand?: string;
  category?: string;
  images?: string[];
}

interface UPCitemdbResponse {
  code: string;
  total: number;
  items?: UPCitemdbItem[];
}

/**
 * Lookup product from Open Food Facts API
 * Primary source - free, no auth required, best for food items
 */
async function lookupOpenFoodFacts(barcode: string): Promise<ProductLookupResult> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'MyApp/1.0 (contact@example.com)',
        },
      }
    );

    if (!response.ok) {
      return { found: false, barcode, source: null };
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status === 1 && data.product?.product_name) {
      return {
        found: true,
        barcode,
        source: 'open_food_facts',
        product: {
          name: data.product.product_name,
          brand: data.product.brands,
          category: data.product.categories?.split(',')[0]?.trim(),
          imageUrl: data.product.image_url,
          quantity: data.product.quantity,
        },
      };
    }

    return { found: false, barcode, source: null };
  } catch (error) {
    console.error('Open Food Facts lookup error:', error);
    return { found: false, barcode, source: null };
  }
}

/**
 * Lookup product from UPCitemdb API
 * Fallback source - 100 requests/day free tier, covers non-food items
 */
async function lookupUPCitemdb(barcode: string): Promise<ProductLookupResult> {
  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return { found: false, barcode, source: null };
    }

    const data: UPCitemdbResponse = await response.json();

    if (data.total > 0 && data.items?.[0]?.title) {
      const item = data.items[0];
      return {
        found: true,
        barcode,
        source: 'upcitemdb',
        product: {
          name: item.title ?? '',
          brand: item.brand,
          category: item.category,
          imageUrl: item.images?.[0],
        },
      };
    }

    return { found: false, barcode, source: null };
  } catch (error) {
    console.error('UPCitemdb lookup error:', error);
    return { found: false, barcode, source: null };
  }
}

/**
 * Main product lookup function
 * Tries Open Food Facts first, then falls back to UPCitemdb
 */
export async function lookupProduct(barcode: string): Promise<ProductLookupResult> {
  // Validate barcode format (should be numeric, typically 8-14 digits)
  const cleanBarcode = barcode.replace(/\D/g, '');
  if (cleanBarcode.length < 8 || cleanBarcode.length > 14) {
    return {
      found: false,
      barcode,
      source: null,
      error: 'Invalid barcode format',
    };
  }

  // Try Open Food Facts first (better for food items)
  const offResult = await lookupOpenFoodFacts(cleanBarcode);
  if (offResult.found) {
    return offResult;
  }

  // Fallback to UPCitemdb
  const upcResult = await lookupUPCitemdb(cleanBarcode);
  if (upcResult.found) {
    return upcResult;
  }

  // Product not found in any database
  return {
    found: false,
    barcode: cleanBarcode,
    source: null,
    error: 'Product not found',
  };
}
