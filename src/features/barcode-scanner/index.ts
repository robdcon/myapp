// Barcode Scanner Feature
// Provides camera-based barcode scanning with product lookup

export { BarcodeScannerModal } from './ui/BarcodeScannerModal';
export { BarcodeScanner } from './ui/BarcodeScanner';
export { ScannedProductPreview } from './ui/ScannedProductPreview';
export { ScanButton } from './ui/ScanButton';

export { lookupProduct } from './api/product-lookup';
export type { ProductLookupResult } from './api/product-lookup';

export { mapProductCategory } from './lib/category-mapper';
