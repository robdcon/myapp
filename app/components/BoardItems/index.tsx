'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { useState } from 'react';
import StickyFooter from '@/app/components/StickyFooter';
import BoardActions from '@/app/components/BoardActions';
import ItemForm from '@/app/components/ItemForm';
import BoardItemRow from '@/app/components/BoardItemRow';
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
import {
  BoardItemsProps,
  GetBoardData,
  ItemFormData,
  Item,
  BoardType,
  ToggleItemCheckData
} from '@/types';

const GET_BOARD_QUERY = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      name
      board_type
      description
      items {
        id
        name
        details
        is_checked
        category
      }
    }
  }
`;

const TOGGLE_ITEM_CHECK = gql`
  mutation ToggleItemCheck($itemId: ID!) {
    toggleItemCheck(itemId: $itemId) {
      id
      is_checked
    }
  }
`;

const CREATE_ITEM = gql`
  mutation CreateItem($boardId: ID!, $name: String!, $details: String, $category: String) {
    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {
      id
      name
      details
      is_checked
      category
    }
  }
`;

const UPDATE_ITEM = gql`
  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {
    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {
      id
      name
      details
      is_checked
      category
    }
  }
`;

export default function BoardItems({ boardId }: BoardItemsProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const { loading, error, data } = useQuery<GetBoardData>(GET_BOARD_QUERY, {
    variables: { id: boardId },
  });

  const [toggleCheck] = useMutation(TOGGLE_ITEM_CHECK, {
    optimisticResponse: (vars) => {
      const item = board?.items?.find((i: Item) => i.id === vars.itemId);
      return {
        toggleItemCheck: {
          __typename: 'Item',
          id: vars.itemId,
          is_checked: !item?.is_checked,
        },
      };
    },
    update: (cache, result) => {
      const mutationData = result.data as ToggleItemCheckData | undefined;
      if (!mutationData?.toggleItemCheck) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: existingData.board.items?.map((item: Item) =>
                item.id === mutationData.toggleItemCheck.id
                  ? { ...item, is_checked: mutationData.toggleItemCheck.is_checked }
                  : item
              ),
            },
          },
        });
      }
    },
  });

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    optimisticResponse: (vars) => ({
      createItem: {
        __typename: 'Item',
        id: `temp-${Date.now()}`, // Temporary ID
        name: vars.name,
        details: vars.details || '',
        is_checked: false,
        category: vars.category || '',
      },
    }),
    update: (cache, result) => {
      const mutationData = result.data as { createItem: Item } | undefined;
      if (!mutationData?.createItem) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: [...(existingData.board.items || []), mutationData.createItem],
            },
          },
        });
      }
    },
    onCompleted: () => {
      setIsAddingItem(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    optimisticResponse: (vars) => {
      const item = board?.items?.find((i: Item) => i.id === vars.itemId);
      return {
        updateItem: {
          __typename: 'Item',
          id: vars.itemId,
          name: vars.name || item?.name || '',
          details: vars.details || item?.details || '',
          is_checked: item?.is_checked || false,
          category: vars.category || item?.category || '',
        },
      };
    },
    update: (cache, result) => {
      const mutationData = result.data as { updateItem: Item } | undefined;
      if (!mutationData?.updateItem) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: existingData.board.items?.map((item: Item) =>
                item.id === mutationData.updateItem.id
                  ? { ...item, ...mutationData.updateItem }
                  : item
              ),
            },
          },
        });
      }
    },
    onCompleted: () => {
      setEditingItemId(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleCreateItem = (item: ItemFormData) => {
    createItem({
      variables: {
        boardId,
        name: item.name.trim(),
        details: item.details.trim() || null,
        category: item.category.trim() || null,
      },
    });
  };

  const handleUpdateItem = (item: ItemFormData) => {
    if (!editingItemId) return;

    updateItem({
      variables: {
        itemId: editingItemId,
        name: item.name.trim(),
        details: item.details.trim() || null,
        category: item.category.trim() || null,
      },
    });
  };

  const handleToggleCheck = (itemId: string) => {
    toggleCheck({ variables: { itemId } });
  };

  const handleResetChecks = () => {
    if (!window.confirm('Are you sure you want to uncheck all items?')) {
      return;
    }
    
    board?.items
      ?.filter((i: Item) => i.is_checked)
      .forEach((i: Item) => handleToggleCheck(i.id));
  };

  const handleCheckAll = () => {
    if (!window.confirm('Are you sure you want to check all items?')) {
      return;
    }
    
    board?.items
      ?.filter((i: Item) => !i.is_checked)
      .forEach((i: Item) => handleToggleCheck(i.id));
  };

  const handleQuickAdd = (category: string) => {
    setIsAddingItem(true);
  };

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

  const board = data?.board;

  // Group items by category
  const itemsByCategory = board?.items?.reduce((acc: any, item: Item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get unique categories
  const categories = board?.items?.map((item: Item) => item.category).filter(Boolean);
  const uniqueCategories = [...new Set(categories)].sort();

  const editingItem = editingItemId
    ? board?.items?.find((i: Item) => i.id === editingItemId)
    : null;

  const checkedCount = (board?.items ?? []).filter((i: Item) => i.is_checked).length;
  const totalCount = (board?.items ?? []).length;

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
        {isAddingItem && (
          <Box mb={6}>
            <ItemForm
              onSubmit={handleCreateItem}
              onCancel={() => setIsAddingItem(false)}
              isLoading={creating}
              existingCategories={uniqueCategories.filter((category): category is string => category !== undefined)}
              mode="create"
            />
          </Box>
        )}

        {/* Edit Item Form */}
        {editingItemId && editingItem && (
          <Box mb={6}>
            <ItemForm
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItemId(null)}
              isLoading={updating}
              initialValues={{
                name: editingItem.name,
                details: editingItem.details || '',
                category: editingItem.category || '',
              }}
              existingCategories={uniqueCategories.filter((category): category is string => category !== undefined)}
              mode="edit"
            />
          </Box>
        )}

        {/* Items by Category */}
        {!itemsByCategory || Object.entries(itemsByCategory).length === 0 ? (
          <Card.Root>
            <Card.Body textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg" mb={4}>
                No items yet. Start adding items to your board!
              </Text>
            </Card.Body>
          </Card.Root>
        ) : (
          <VStack align="stretch" gap={6}>
            {Object.entries(itemsByCategory).map(([category, items]: [string, any]) => (
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
                    {items.map((item: Item) => (
                      <BoardItemRow
                        key={item.id}
                        item={item}
                        boardType={board?.board_type ?? BoardType.CHECKLIST}
                        onToggleCheck={handleToggleCheck}
                        onEdit={setEditingItemId}
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
        <BoardActions
          isAddingItem={isAddingItem}
          onToggleAddItem={() => setIsAddingItem(!isAddingItem)}
          onResetChecks={handleResetChecks}
          onCheckAll={handleCheckAll}
          showReset={board?.board_type === BoardType.CHECKLIST && board?.items?.some((i: Item) => i.is_checked)}
          showCheckAll={board?.board_type === BoardType.CHECKLIST && board?.items?.some((i: Item) => !i.is_checked)}
        />
      </StickyFooter>
    </Box>
  );
}
