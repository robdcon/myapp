'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Badge,
  Card,
  Spinner,
  Alert,
  IconButton,
} from "@chakra-ui/react";
import { GET_BOARD_QUERY, BoardType } from '@/src/entities/board';
import { ItemEntity } from '@/src/entities/item';
import { CreateItemForm } from '@/src/features/create-item';
import { EditItemForm } from '@/src/features/edit-item';
import { BulkItemActions, useBulkItemActions } from '@/src/features/bulk-item-actions';
import { useToggleItemCheck } from '@/src/features/toggle-item-check';
import { StickyFooter, BoardItemRow } from '@/src/shared';
import type { GetBoardData } from '@/src/entities/board';
import type { Item } from '@/src/entities/item';
import type { BoardViewerWidgetProps } from '../model/types';

export function BoardViewer({ boardId }: Readonly<BoardViewerWidgetProps>) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { loading, error, data } = useQuery<GetBoardData>(GET_BOARD_QUERY, {
    variables: { id: boardId },
  });

  const { toggleItemCheck, isItemToggling } = useToggleItemCheck(boardId);

  const board = data?.board;
  const items = board?.items || [];
  
  const { 
    checkAllItems, 
    uncheckAllItems, 
    hasCheckedItems, 
    hasUncheckedItems 
  } = useBulkItemActions(boardId, items);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" colorPalette="teal" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error loading board</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Container>
    );
  }

  // Group items by category
  const itemsByCategory = ItemEntity.groupByCategory(items);
  const checkedCount = ItemEntity.getCheckedCount(items);
  const totalCount = items.length;

  const editingItem = editingItemId
    ? items.find(i => i.id === editingItemId)
    : null;

  const handleQuickAdd = (category?: string) => {
    setSelectedCategory(category);
    setIsAddingItem(true);
  };

  const handleCloseAddForm = () => {
    setIsAddingItem(false);
    setSelectedCategory(undefined);
  };

  return (
    <Box minH="100vh" bg="gray.50" pb={24}>
      <Container maxW="container.lg" py={8}>
        {/* Header */}
        <VStack align="stretch" gap={6} mb={8}>
          <Button asChild variant="ghost" size="sm" width="fit-content">
            <Link href="/">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to boards
            </Link>
          </Button>

          {/* Board Info */}
          <Box>
            <Heading size="4xl" mb={3}>{board?.name}</Heading>

            {board?.description && (
              <Text fontSize="lg" color="gray.600" mb={4}>
                {board.description}
              </Text>
            )}

            <HStack gap={3}>
              <Badge colorPalette="blue" size="lg">
                {board?.board_type === BoardType.CHECKLIST ? '✓ Checklist' : '📋 Notice Board'}
              </Badge>

              {board?.board_type === BoardType.CHECKLIST && totalCount > 0 && (
                <Text fontSize="sm" color="gray.600">
                  {checkedCount} / {totalCount} completed
                </Text>
              )}
            </HStack>
          </Box>
        </VStack>

        {/* Add Item Form */}
        <CreateItemForm
          boardId={boardId}
          onSuccess={() => {
            setIsAddingItem(false);
            setSelectedCategory(undefined);
          }}
          isOpen={isAddingItem}
          onClose={handleCloseAddForm}
          defaultCategory={selectedCategory}
        />

        {/* Edit Item Form */}
        <EditItemForm
          itemId={editingItemId}
          boardId={boardId}
          onSuccess={() => setEditingItemId(null)}
          isOpen={!!editingItemId && !!editingItem}
          onClose={() => setEditingItemId(null)}
          initialValues={editingItem ? {
            name: editingItem.name,
            details: editingItem.details || '',
            category: editingItem.category || '',
          } : undefined}
        />

        {/* Items by Category */}
        {Object.entries(itemsByCategory).length === 0 ? (
          <Card.Root>
            <Card.Body textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg" mb={4}>
                No items yet. Start adding items to your board!
              </Text>
            </Card.Body>
          </Card.Root>
        ) : (
          <VStack align="stretch" gap={6}>
            {Object.entries(itemsByCategory).map(([category, categoryItems]: [string, Item[]]) => (
              <Card.Root key={category}>
                <Card.Header bg="gray.50" borderBottom="1px" borderColor="gray.200">
                  <Flex justify="space-between" align="center">
                    <Heading size="lg">{category}</Heading>
                    <IconButton
                      onClick={() => handleQuickAdd(category)}
                      variant="ghost"
                      colorPalette="blue"
                      aria-label={`Add item to ${category}`}
                      size="sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </IconButton>
                  </Flex>
                </Card.Header>

                <Card.Body p={0}>
                  <VStack align="stretch" gap={0} divideY="1px" divideColor="gray.200">
                    {categoryItems.map((item: Item) => (
                      <BoardItemRow
                        key={item.id}
                        item={item}
                        boardType={board?.board_type ?? BoardType.CHECKLIST}
                        onToggleCheck={toggleItemCheck}
                        onEdit={setEditingItemId}
                        isToggling={isItemToggling(item.id)}
                      />
                    ))}
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        )}
      </Container>

      {/* Sticky Footer */}
      <StickyFooter>
        <Flex justify="space-between" align="center">
          <Button
            onClick={() => isAddingItem ? handleCloseAddForm() : handleQuickAdd()}
            colorPalette="blue"
            size="lg"
          >
            {isAddingItem ? 'Cancel' : 'Add Item'}
          </Button>
          
          {board?.board_type === BoardType.CHECKLIST && (
            <BulkItemActions
              hasCheckedItems={hasCheckedItems}
              hasUncheckedItems={hasUncheckedItems}
              onCheckAll={checkAllItems}
              onUncheckAll={uncheckAllItems}
            />
          )}
        </Flex>
      </StickyFooter>
    </Box>
  );
}