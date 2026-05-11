import { useState } from 'react';
import { useDisplayUncheckedItems } from '../api/display-unchecked-items';
import { Box, Heading, VStack, Text, Card, Spinner } from '@chakra-ui/react';
import { useToggleItemCheck } from '@/src/features/toggle-item-check';
import { useDeleteItem } from '@/src/features/delete-item';
import { BoardItemRow } from '@/src/shared';
import { BoardType } from '@/src/entities/board';
import { EditItemForm } from '@/src/features/edit-item';

interface UncheckedItemsListProps {
  boardId: string;
}

export const UncheckedItemsList = ({ boardId }: UncheckedItemsListProps) => {
  const { uncheckedItems, totalUnchecked, hasUncheckedItems, loading, error } =
    useDisplayUncheckedItems(boardId);
  const { toggleItemCheck, isItemToggling } = useToggleItemCheck(boardId);
  const { deleteItem } = useDeleteItem({ boardId });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="md" colorPalette="appPrimary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Card.Root variant="outline" borderColor="red.200">
        <Card.Body>
          <Text color="red.600">Error loading unchecked items</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!hasUncheckedItems) {
    return (
      <Card.Root variant="outline" borderColor="appPrimary.200">
        <Card.Body>
          <Text color="gray.600" fontWeight="medium">
            🎉 All items are checked!
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root variant="outline" borderColor="appPrimary.200">
      <Card.Header bg="appPrimary.50" borderBottom="1px" borderColor="appPrimary.100">
        <Heading size="md" color="appPrimary.700">
          Unchecked Items ({totalUnchecked})
        </Heading>
      </Card.Header>
      <Card.Body>
        <EditItemForm
          itemId={editingItemId}
          boardId={boardId}
          onSuccess={() => setEditingItemId(null)}
          isOpen={!!editingItemId}
          onClose={() => setEditingItemId(null)}
          initialValues={
            editingItemId
              ? {
                  name: uncheckedItems.find((i) => i.id === editingItemId)?.name || '',
                  details:
                    uncheckedItems.find((i) => i.id === editingItemId)?.details || '',
                  category:
                    uncheckedItems.find((i) => i.id === editingItemId)?.category || '',
                }
              : undefined
          }
        />
        <VStack align="stretch" gap={2}>
          {uncheckedItems.map((item) => (
            <BoardItemRow
              key={item.id}
              item={item}
              boardType={BoardType.CHECKLIST}
              onToggleCheck={toggleItemCheck}
              onEdit={(itemId) => setEditingItemId(itemId)}
              onDelete={deleteItem}
              isToggling={isItemToggling(item.id)}
            />
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
