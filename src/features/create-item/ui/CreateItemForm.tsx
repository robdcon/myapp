'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Input,
  createListCollection,
  Heading,
  Field,
} from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
  SelectLabel,
} from '@/components/ui/select';
import { useCreateItem } from '../api/create-item';
import { ITEM_CATEGORIES } from '@/src/shared';
import type { CreateItemFeatureProps } from '../model/types';
import type { ItemFormData } from '@/src/entities/item';

export function CreateItemForm({
  boardId,
  onSuccess,
  isOpen,
  onClose,
  defaultCategory,
}: Readonly<CreateItemFeatureProps>) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    details: '',
    category: defaultCategory || '',
  });

  const categoryCollection = useMemo(() => {
    return createListCollection({
      items: ITEM_CATEGORIES.map((category) => ({
        label: category,
        value: category,
      })),
    });
  }, []);

  useEffect(() => {
    if (defaultCategory) {
      setFormData((prev) => ({ ...prev, category: defaultCategory }));
    }
  }, [defaultCategory]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', details: '', category: defaultCategory || '' });
    }
  }, [isOpen, defaultCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const { createItem, loading } = useCreateItem(boardId, () => {
    onSuccess?.(formData.category || undefined);
    onClose();
    setFormData({ name: '', details: '', category: '' });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createItem(formData);
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
      onClick={onClose}
    >
      <Box
        bg="white"
        rounded="lg"
        shadow="2xl"
        maxW="500px"
        w="90%"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Box p={6} borderBottom="1px" borderColor="appPrimary.100" bg="appPrimary.50">
          <Heading size="lg" color="appPrimary.700">
            Add New Item
            {defaultCategory && ` to ${defaultCategory}`}
          </Heading>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box p={6}>
            <VStack gap={4} align="stretch">
              <Field.Root required>
                <Field.Label>
                  Item Name <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Strawberries"
                  autoFocus
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Details (optional)</Field.Label>
                <Input
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="e.g., 2 packs"
                />
              </Field.Root>

              <Box>
                <SelectRoot
                  collection={categoryCollection}
                  value={formData.category ? [formData.category] : []}
                  onValueChange={(details) => {
                    const selectedValue = details.value[0] || '';
                    setFormData({ ...formData, category: selectedValue });
                  }}
                  size="sm"
                >
                  <SelectLabel>Category (optional)</SelectLabel>
                  <SelectTrigger clearable>
                    <SelectValueText placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryCollection.items.map((category) => (
                      <SelectItem key={category.value} item={category}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Box>
            </VStack>
          </Box>

          <Box
            p={6}
            borderTop="1px"
            borderColor="gray.200"
            display="flex"
            gap={3}
            justifyContent="flex-end"
          >
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              colorPalette="appPrimary"
              loading={loading}
            >
              Add Item
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
