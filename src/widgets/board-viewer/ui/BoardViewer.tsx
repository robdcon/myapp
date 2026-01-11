'use client';

import { useQuery } from '@apollo/client/react';
import { useState, useRef, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { GET_BOARD_QUERY, BoardType } from '@/src/entities/board';
import { ItemEntity } from '@/src/entities/item';
import { CreateItemForm } from '@/src/features/create-item';
import { EditItemForm } from '@/src/features/edit-item';
import { BulkItemActions, useBulkItemActions } from '@/src/features/bulk-item-actions';
import { useToggleItemCheck } from '@/src/features/toggle-item-check';
import { useDeleteItem } from '@/src/features/delete-item';
import { StickyFooter, BoardItemRow } from '@/src/shared';
import type { GetBoardData } from '@/src/entities/board';
import type { Item } from '@/src/entities/item';
import type { BoardViewerWidgetProps } from '../model/types';
import { UncheckedItemsList } from '@/src/features/display-list-summary';
import { ShareBoardDialog } from '@/src/features/boards/ui/ShareBoardDialog';

// UI Constants
const HIGHLIGHT_ANIMATION_DURATION = 2000; // milliseconds
const SCROLL_DELAY = 300; // milliseconds

export function BoardViewer({ boardId }: Readonly<BoardViewerWidgetProps>) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [highlightedCategory, setHighlightedCategory] = useState<string | undefined>(undefined);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Refs to store category section elements
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { loading, error, data } = useQuery<GetBoardData>(GET_BOARD_QUERY, {
    variables: { id: boardId },
  });

  const { toggleItemCheck, isItemToggling } = useToggleItemCheck(boardId);
  const { deleteItem } = useDeleteItem({ boardId });

  const board = data?.board;
  const items = board?.items || [];

  const { checkAllItems, uncheckAllItems, hasCheckedItems, hasUncheckedItems } = useBulkItemActions(
    boardId,
    items
  );

  // Scroll to category section
  const scrollToCategory = useCallback((category: string) => {
    const element = categoryRefs.current[category];
    if (element) {
      // Add highlight effect
      setHighlightedCategory(category);

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Remove highlight after animation
      setTimeout(() => setHighlightedCategory(undefined), HIGHLIGHT_ANIMATION_DURATION);
    }
  }, []);

  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null;

  const handleQuickAdd = (category?: string) => {
    setSelectedCategory(category);
    setIsAddingItem(true);
  };

  const handleCloseAddForm = () => {
    setIsAddingItem(false);
    setSelectedCategory(undefined);
  };

  const handleItemCreated = (category?: string) => {
    setIsAddingItem(false);
    setSelectedCategory(undefined);

    // Scroll to the category where item was added
    if (category) {
      setTimeout(() => scrollToCategory(category), SCROLL_DELAY);
    } else {
      // If no category, scroll to top to see all items
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Group items by category
  const itemsByCategory = ItemEntity.groupByCategory(items);
  const checkedCount = ItemEntity.getCheckedCount(items);
  const totalCount = items.length;

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" colorPalette="appPrimary" />
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

  return (
    <Box minH="100vh" bg="gray.50" pb={24} className="board-viewer">
      <Container maxW="container.lg" py={8}>
        {/* Header */}
        <VStack align="stretch" gap={6} mb={8}>
          <Button asChild variant="ghost" size="sm" width="fit-content">
            <Link href="/">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to boards
            </Link>
          </Button>

          {/* Board Info */}
          <Box>
            <HStack justify="space-between" align="flex-start" mb={3}>
              <Heading size="4xl" color="appPrimary.800">
                {board?.name}
              </Heading>

              <Button
                colorPalette="appPrimary"
                size="sm"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </Button>
            </HStack>

            {board?.description && (
              <Text fontSize="lg" color="gray.600" mb={4}>
                {board.description}
              </Text>
            )}

            <HStack gap={3}>
              <Badge colorPalette="appPrimary" size="lg">
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

        {/* Sticky Category Navigation */}
        {Object.keys(itemsByCategory).length > 0 && (
          <Box
            position="sticky"
            top="0"
            zIndex="sticky"
            bg="white"
            borderBottom="2px"
            borderColor="appPrimary.200"
            py={3}
            mb={6}
            shadow="sm"
          >
            <HStack
              gap={2}
              overflowX="auto"
              css={{
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'gray.100',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--chakra-colors-app-primary-500)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'var(--chakra-colors-app-primary-600)',
                },
              }}
            >
              {Object.entries(itemsByCategory).map(([category, items]) => (
                <Button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  size="sm"
                  variant={highlightedCategory === category ? 'solid' : 'outline'}
                  colorPalette="appPrimary"
                  flexShrink={0}
                  fontWeight="medium"
                >
                  {category}
                  <Badge
                    ml={2}
                    colorPalette={highlightedCategory === category ? 'white' : 'appPrimary'}
                    variant="subtle"
                    fontSize="xs"
                  >
                    {items.length}
                  </Badge>
                </Button>
              ))}
            </HStack>
          </Box>
        )}

        {/* Add Item Form */}
        <CreateItemForm
          boardId={boardId}
          onSuccess={(category) => handleItemCreated(category)}
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
          initialValues={
            editingItem
              ? {
                  name: editingItem.name,
                  details: editingItem.details || '',
                  category: editingItem.category || '',
                }
              : undefined
          }
        />

        {/* Items by Category */}
        {Object.entries(itemsByCategory).length === 0 ? (
          <Card.Root>
            <Card.Body textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg" mb={4} fontWeight="medium">
                No items yet. Start adding items to your board!
              </Text>
            </Card.Body>
          </Card.Root>
        ) : (
          <VStack align="stretch" gap={6}>
            <UncheckedItemsList boardId={boardId} />
            {Object.entries(itemsByCategory).map(([category, categoryItems]: [string, Item[]]) => (
              <Card.Root
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                variant="outline"
                borderColor={highlightedCategory === category ? 'appPrimary.400' : 'appPrimary.200'}
                borderWidth={highlightedCategory === category ? '3px' : '1px'}
                _hover={{
                  shadow: 'lg',
                  transform: 'translateY(-2px)',
                  borderColor: 'appPrimary.300',
                }}
                transition="all 0.3s ease"
                bg={highlightedCategory === category ? 'appPrimary.50' : 'white'}
              >
                <Card.Header bg="appPrimary.50" borderBottom="1px" borderColor="appPrimary.100">
                  <Flex justify="space-between" align="center">
                    <Heading size="lg" color="appPrimary.700">
                      {category}
                    </Heading>
                    <IconButton
                      onClick={() => handleQuickAdd(category)}
                      variant="ghost"
                      colorPalette="appPrimary"
                      aria-label={`Add item to ${category}`}
                      size="sm"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </IconButton>
                  </Flex>
                </Card.Header>

                <Card.Body p={0} className="BoardItems">
                  <VStack align="stretch" gap={0} divideY="1px" divideColor="appPrimary.100">
                    {categoryItems.map((item: Item) => (
                      <BoardItemRow
                        key={item.id}
                        item={item}
                        boardType={board?.board_type ?? BoardType.CHECKLIST}
                        onToggleCheck={toggleItemCheck}
                        onEdit={setEditingItemId}
                        onDelete={deleteItem}
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
            onClick={() => (isAddingItem ? handleCloseAddForm() : handleQuickAdd())}
            colorPalette="appPrimary"
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

      {/* Share Board Dialog */}
      {board && (
        <ShareBoardDialog
          open={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          boardId={boardId}
          boardName={board.name}
        />
      )}
    </Box>
  );
}
