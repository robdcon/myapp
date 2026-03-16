'use client';

import { useState, useCallback } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { ScannedProductPreview } from './ScannedProductPreview';
import { toaster } from '@/components/ui/toaster';
import type { ProductLookupResult } from '../api/product-lookup';

type ScannerState = 'idle' | 'scanning' | 'looking_up' | 'preview';

export interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (name: string, details: string, category: string) => Promise<void>;
}

export function BarcodeScannerModal({
  open,
  onClose,
  onAddItem,
}: BarcodeScannerModalProps) {
  const [state, setState] = useState<ScannerState>('idle');
  const [scanResult, setScanResult] = useState<ProductLookupResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Start scanning when modal opens
  const isScanning =
    open && (state === 'idle' || state === 'scanning' || state === 'looking_up');
  const isShowingPreview = state === 'preview' && scanResult !== null;

  const handleScan = useCallback(async (barcode: string) => {
    setState('looking_up');

    try {
      const response = await fetch(
        `/api/product-lookup?barcode=${encodeURIComponent(barcode)}`
      );
      const result: ProductLookupResult = await response.json();

      setScanResult(result);
      setState('preview');

      // Play success sound/vibration feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    } catch (error) {
      console.error('Product lookup failed:', error);
      // Show error but allow manual entry
      setScanResult({
        found: false,
        barcode,
        source: null,
        error: 'Failed to lookup product',
      });
      setState('preview');
    }
  }, []);

  const handleAddItem = async (name: string, details: string, category: string) => {
    setIsAdding(true);
    try {
      await onAddItem(name, details, category);

      toaster.create({
        title: 'Item Added',
        description: `"${name}" has been added to your list`,
        type: 'success',
        duration: 3000,
      });

      // Reset and go back to scanning
      setScanResult(null);
      setState('scanning');
    } catch (error) {
      console.error('Failed to add item:', error);
      toaster.create({
        title: 'Failed to Add Item',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleScanAnother = () => {
    setScanResult(null);
    setState('scanning');
  };

  const handleClose = () => {
    setState('idle');
    setScanResult(null);
    onClose();
  };

  const handlePreviewClose = () => {
    // Go back to scanning instead of closing entirely
    setScanResult(null);
    setState('scanning');
  };

  if (!open) return null;

  return (
    <>
      {/* Scanner view */}
      {isScanning && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={handleClose}
          isProcessing={state === 'looking_up'}
        />
      )}

      {/* Product preview modal */}
      <ScannedProductPreview
        open={isShowingPreview}
        result={scanResult}
        onAdd={handleAddItem}
        onScanAnother={handleScanAnother}
        onClose={handlePreviewClose}
        isAdding={isAdding}
      />
    </>
  );
}
