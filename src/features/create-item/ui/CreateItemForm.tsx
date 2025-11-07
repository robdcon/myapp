'use client';

import { useState } from 'react';
import { Box, Button, VStack, Input } from '@chakra-ui/react';
import { useCreateItem } from '../api/create-item';
import type { CreateItemFeatureProps } from '../model/types';
import type { ItemFormData } from '@/src/entities/item';

export function CreateItemForm({ 
  boardId, 
  onSuccess, 
  existingCategories = [], 
  isOpen, 
  onClose 
}: Readonly<CreateItemFeatureProps>) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    details: '',
    category: '',
  });

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
            <label htmlFor="item-category" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
              Category (optional)
            </label>
            <Input
              id="item-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Fruit"
              list="categories"
            />
            {existingCategories.length > 0 && (
              <datalist id="categories">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            )}
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