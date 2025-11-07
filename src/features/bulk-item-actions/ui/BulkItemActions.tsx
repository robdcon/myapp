'use client';

import { Button, HStack } from '@chakra-ui/react';
import type { BulkItemActionsProps } from '../model/types';

export function BulkItemActions({ 
  hasCheckedItems, 
  hasUncheckedItems, 
  onCheckAll, 
  onUncheckAll 
}: Readonly<BulkItemActionsProps>) {
  if (!hasCheckedItems && !hasUncheckedItems) {
    return null;
  }

  return (
    <HStack gap={2}>
      {hasUncheckedItems && (
        <Button
          onClick={onCheckAll}
          colorPalette="green"
          size="sm"
          variant="outline"
        >
          Check All
        </Button>
      )}
      {hasCheckedItems && (
        <Button
          onClick={onUncheckAll}
          colorPalette="orange"
          size="sm"
          variant="outline"
        >
          Reset Checks
        </Button>
      )}
    </HStack>
  );
}