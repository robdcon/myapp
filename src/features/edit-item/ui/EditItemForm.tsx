'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Button, VStack, Input, createListCollection, Heading } from '@chakra-ui/react';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText, SelectLabel } from '@/components/ui/select';
import { useEditItem } from '../api/edit-item';
import { ITEM_CATEGORIES } from '@/src/shared';
import type { EditItemFeatureProps } from '../model/types';
import type { ItemFormData } from '@/src/entities/item';

export function EditItemForm({ 
  itemId,
  boardId, 
  onSuccess, 
  isOpen, 
  onClose,
  initialValues 
}: Readonly<EditItemFeatureProps>) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialValues?.name || '',
    details: initialValues?.details || '',
    category: initialValues?.category || '',
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

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        details: initialValues.details || '',
        category: initialValues.category || '',
      });
    }
  }, [initialValues]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const { editItem, loading } = useEditItem(boardId, () => {
    onSuccess?.();
    onClose();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !itemId) return;
    editItem({
      itemId,
      name: formData.name,
      details: formData.details,
      category: formData.category,
    });
  };

  if (!isOpen || !itemId) return null;

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
        <Box
          p={6}
          borderBottom="1px"
          borderColor="appSecondary.100"
          bg="appSecondary.50"
        >
          <Heading size="lg" color="appSecondary.700">
            Edit Item
          </Heading>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Box p={6}>
            <VStack gap={4} align="stretch">
              <Box>
                <label htmlFor="edit-item-name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                  Item Name *
                </label>
                <Input
                  id="edit-item-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Strawberries"
                  autoFocus
                  required
                />
              </Box>

              <Box>
                <label htmlFor="edit-item-details" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
                  Details (optional)
                </label>
                <Input
                  id="edit-item-details"
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
                  <SelectLabel htmlFor="edit-item-category" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
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
              colorPalette="appSecondary"
              loading={loading}
            >
              Update Item
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}