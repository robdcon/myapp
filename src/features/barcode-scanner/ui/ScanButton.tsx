'use client';

import { IconButton } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { LuScanBarcode } from 'react-icons/lu';

export interface ScanButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ScanButton({ onClick, disabled = false }: ScanButtonProps) {
  return (
    <Tooltip content="Scan barcode">
      <IconButton
        aria-label="Scan barcode"
        onClick={onClick}
        disabled={disabled}
        colorPalette="appPrimary"
        variant="outline"
        size="md"
      >
        <LuScanBarcode size={20} />
      </IconButton>
    </Tooltip>
  );
}
