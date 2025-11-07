'use client';

import { useState, useEffect } from 'react';
import { Box, Button, VStack, Input } from '@chakra-ui/react';
import { useEditItem } from '../api/edit-item';
import type { EditItemFeatureProps } from '../model/types';
import type { ItemFormData } from '@/src/entities/item';

export function EditItemForm({ 
  itemId,
  boardId, 
  onSuccess, 
  existingCategories = [], 
  isOpen, 
  onClose,
  initialValues 
}: Readonly<EditItemFeatureProps>) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialValues?.name || '',
    details: initialValues?.details || '',
    category: initialValues?.category || '',
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        details: initialValues.details || '',
        category: initialValues.category || '',
      });
    }
  }, [initialValues]);

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
    <Box p={6} bg="white" border="2px" borderColor="orange.200" rounded="lg" shadow="lg">
      <form onSubmit={handleSubmit}>
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
            <label htmlFor="edit-item-category" style={{ display: 'block', marginBottom: '4px', fontWeight: 'medium' }}>
              Category (optional)
            </label>
            <Input
              id="edit-item-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Fruit"
              list="edit-categories"
            />
            {existingCategories.length > 0 && (
              <datalist id="edit-categories">
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
              colorPalette="orange"
              flex={1}
              loading={loading}
            >
              Update Item
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