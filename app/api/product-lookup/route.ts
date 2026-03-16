import { NextRequest, NextResponse } from 'next/server';
import { lookupProduct } from '@/src/features/barcode-scanner/api/product-lookup';
import { mapProductCategory } from '@/src/features/barcode-scanner/lib/category-mapper';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode parameter is required' }, { status: 400 });
  }

  try {
    const result = await lookupProduct(barcode);

    // If product found, map the category to app category
    if (result.found && result.product) {
      result.product.category = mapProductCategory(result.product.category);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Product lookup error:', error);
    return NextResponse.json(
      {
        found: false,
        barcode,
        source: null,
        error: 'Failed to lookup product',
      },
      { status: 500 }
    );
  }
}
