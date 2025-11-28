'use client';

import React from 'react';
import { Box, Flex, VStack, Text, Button } from "@chakra-ui/react";
import { BoardType } from '@/src/entities/board';
import type { Item } from '@/src/entities/item';

export interface BoardItemRowProps {
  item: Item;
  boardType: BoardType;
  onToggleCheck: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  isToggling?: boolean;
}

export const BoardItemRow = React.memo(function BoardItemRow({ 
  item, 
  boardType, 
  onToggleCheck, 
  onEdit,
  isToggling = false
}: Readonly<BoardItemRowProps>) {
  const handleRowClick = React.useCallback((e: React.MouseEvent) => {
    // Don't trigger row click if clicking on the edit button
    if ((e.target as HTMLElement).closest('button[data-edit-button]')) {
      return;
    }
    
    // Only toggle for checklist boards
    if (boardType === BoardType.CHECKLIST) {
      onToggleCheck(item.id);
    }
  }, [boardType, onToggleCheck, item.id]);

  const handleEditClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    onEdit(item.id);
  }, [onEdit, item.id]);

  const handleCheckboxClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click (since row click also toggles)
    onToggleCheck(item.id);
  }, [onToggleCheck, item.id]);

  return (
    <Box 
      p={4} 
      _hover={{ bg: boardType === BoardType.CHECKLIST ? "appPrimary.50" : "gray.50" }} 
      _active={{ bg: boardType === BoardType.CHECKLIST ? "appPrimary.100" : "gray.100", transform: "scale(0.998)" }}
      cursor={boardType === BoardType.CHECKLIST ? "pointer" : "default"}
      onClick={handleRowClick}
      transition="all 0.1s ease"
      opacity={isToggling ? 0.7 : 1}
      pointerEvents={isToggling ? "none" : "auto"}
      position="relative"
      className='item-row'
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={3} flex={1}>
          {boardType === BoardType.CHECKLIST && (
            <Box onClick={handleCheckboxClick} className='checkbox-container'>
              <input
                type="checkbox"
                checked={item.is_checked}
                onChange={() => {}} // Controlled by click handlers
                style={{ 
                  transform: 'scale(1.3)',
                  cursor: 'pointer',
                  accentColor: '#219591', // Dark cyan color from your turquoise palette
                  filter: isToggling ? 'brightness(0.8)' : 'none'
                }}
                tabIndex={-1} // Remove from tab order since row is clickable
              />
            </Box>
          )}
          <VStack align="start" gap={1} flex={1}>
            <Text 
              fontWeight="medium" 
              textDecoration={item.is_checked ? 'line-through' : 'none'}
              color={item.is_checked ? 'gray.500' : 'inherit'}
              transition="all 0.15s ease"
            >
              {item.name}
            </Text>
            {item.details && (
              <Text 
                fontSize="sm" 
                color={item.is_checked ? 'gray.400' : 'gray.600'}
                transition="color 0.15s ease"
              >
                {item.details}
              </Text>
            )}
          </VStack>
        </Flex>
        <Button
          data-edit-button="true"
          onClick={handleEditClick}
          variant="ghost"
          size="sm"
          colorPalette="appPrimary"
          _hover={{ bg: "appPrimary.50" }}
        >
          Edit
        </Button>
      </Flex>
    </Box>
  );
});