'use client';

import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Image, Badge } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { createListCollection } from '@chakra-ui/react';
import { ITEM_CATEGORIES, DEFAULT_CATEGORY } from '@/src/shared';
import { LuScanLine, LuPackage } from 'react-icons/lu';
import type { ProductLookupResult } from '../api/product-lookup';

const categoryCollection = createListCollection({
  items: ITEM_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  })),
});

export interface ScannedProductPreviewProps {
  open: boolean;
  result: ProductLookupResult | null;
  onAdd: (name: string, details: string, category: string) => void;
  onScanAnother: () => void;
  onClose: () => void;
  isAdding?: boolean;
}

export function ScannedProductPreview({
  open,
  result,
  onAdd,
  onScanAnother,
  onClose,
  isAdding = false,
}: ScannedProductPreviewProps) {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<string[]>([DEFAULT_CATEGORY]);

  // Reset form when result changes
  useEffect(() => {
    if (result?.found && result.product) {
      setName(result.product.name);
      // Combine brand and quantity for details
      const detailParts: string[] = [];
      if (result.product.brand) detailParts.push(result.product.brand);
      if (result.product.quantity) detailParts.push(result.product.quantity);
      setDetails(detailParts.join(' - '));
      setCategory([result.product.category || DEFAULT_CATEGORY]);
    } else if (result && !result.found) {
      setName('');
      setDetails('');
      setCategory([DEFAULT_CATEGORY]);
    }
  }, [result]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), details.trim(), category[0]);
  };

  const productFound = result?.found && result?.product;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => !isAdding && e.open === false && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {productFound ? 'Product Found' : 'Product Not Found'}
          </DialogTitle>
          <DialogCloseTrigger disabled={isAdding} />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Product image and info */}
            {productFound && (
              <HStack gap={4} align="start">
                {result.product?.imageUrl ? (
                  <Image
                    src={result.product.imageUrl}
                    alt={result.product.name}
                    boxSize="80px"
                    objectFit="contain"
                    borderRadius="md"
                    bg="gray.100"
                  />
                ) : (
                  <Box
                    boxSize="80px"
                    bg="gray.100"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <LuPackage size={32} color="gray" />
                  </Box>
                )}
                <VStack align="start" gap={1} flex={1}>
                  <Badge colorPalette="green" size="sm">
                    {result.source === 'open_food_facts'
                      ? 'Open Food Facts'
                      : 'UPCitemdb'}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    Barcode: {result.barcode}
                  </Text>
                </VStack>
              </HStack>
            )}

            {!productFound && result && (
              <Box
                p={4}
                bg="orange.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="orange.200"
              >
                <Text color="orange.700" fontSize="sm">
                  No product found for barcode: {result.barcode}
                </Text>
                <Text color="orange.600" fontSize="xs" mt={1}>
                  You can still add this item manually below.
                </Text>
              </Box>
            )}

            {/* Editable fields */}
            <Field label="Item Name" required>
              <Input
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAdding}
                autoFocus={!productFound}
              />
            </Field>

            <Field label="Details (optional)">
              <Input
                placeholder="e.g., 500g, 2 pack, Brand name"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isAdding}
              />
            </Field>

            <Field label="Category">
              <SelectRoot
                collection={categoryCollection}
                value={category}
                onValueChange={(e) => setCategory(e.value)}
                disabled={isAdding}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryCollection.items.map((cat) => (
                    <SelectItem key={cat.value} item={cat}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack gap={2} width="100%" justifyContent="space-between">
            <Button variant="outline" onClick={onScanAnother} disabled={isAdding}>
              <LuScanLine />
              Scan Another
            </Button>
            <HStack gap={2}>
              <Button variant="ghost" onClick={onClose} disabled={isAdding}>
                Cancel
              </Button>
              <Button
                colorPalette="appPrimary"
                onClick={handleAdd}
                disabled={isAdding || !name.trim()}
                loading={isAdding}
              >
                Add to List
              </Button>
            </HStack>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
