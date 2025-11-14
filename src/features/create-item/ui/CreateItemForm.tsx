'use client';

import { useState, useMemo, useEffect } from 'react';
import { Box, Button, VStack, Input, createListCollection } from '@chakra-ui/react';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText, SelectLabel } from '@/components/ui/select';
import { useCreateItem } from '../api/create-item';
import { ITEM_CATEGORIES } from '@/src/shared';
import type { CreateItemFeatureProps } from '../model/types';
import type { ItemFormData } from '@/src/entities/item';

export function CreateItemForm({ 
  boardId, 
  onSuccess, 
  isOpen, 
  onClose,
  defaultCategory 
}: Readonly<CreateItemFeatureProps>) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    details: '',
    category: defaultCategory || '',
  });

  // Create collection for categories
  const categoryCollection = useMemo(() => {
    return createListCollection({
      items: ITEM_CATEGORIES.map(category => ({
        label: category,
        value: category,
      })),
    });
  }, []);

  // Update form when defaultCategory changes
  useEffect(() => {
    if (defaultCategory) {
      setFormData(prev => ({
        ...prev,
        category: defaultCategory,
      }));
    }
  }, [defaultCategory]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', details: '', category: defaultCategory || '' });
    }
  }, [isOpen, defaultCategory]);

  const { createItem, loading } = useCreateItem(boardId, () => {
    onSuccess?.();
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
    <Box p={6} bg="white" border="2px" borderColor="blue.200" rounded="lg" shadow="lg">
      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Box>
            <label htmlFor="item-name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
              Item Name *
            </label>
            <Input
              id="item-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Strawberries"
              autoFocus
              required
            />
          </Box>

          <Box>
            <label htmlFor="item-details" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
              Details (optional)
            </label>
            <Input
              id="item-details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="e.g., 2 packs"
            />
          </Box>

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
              <SelectLabel htmlFor="item-category" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                Category (optional)
              </SelectLabel>
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

          <Box display="flex" gap={3}>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              colorPalette="blue"
              flex={1}
              loading={loading}
            >
              Add Item
            </Button>
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
}