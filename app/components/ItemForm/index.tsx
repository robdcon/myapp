'use client';

import { useState, useEffect } from 'react';
import { ItemFormProps, ItemFormData } from '@/types';

export default function ItemForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = {},
  existingCategories = [],
  mode = 'create',
}: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialValues.name || '',
    details: initialValues.details || '',
    category: initialValues.category || '',
  });

  useEffect(() => {
    setFormData({
      name: initialValues.name || '',
      details: initialValues.details || '',
      category: initialValues.category || '',
    });
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="p-6 bg-white border-2 border-blue-200 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        {mode === 'create' ? 'Add New Item' : 'Edit Item'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Strawberries"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Details (optional)
          </label>
          <input
            type="text"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="e.g., 2 packs"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category (optional)
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Fruit"
            list="categories"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {existingCategories.length > 0 && (
            <datalist id="categories">
              {existingCategories.map((cat: string) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Add Item' : 'Update Item'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}