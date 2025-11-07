'use client';

import { Box, Flex, VStack, Text, Button } from "@chakra-ui/react";
import { BoardType } from '@/src/entities/board';
import type { Item } from '@/src/entities/item';

export interface BoardItemRowProps {
  item: Item;
  boardType: BoardType;
  onToggleCheck: (itemId: string) => void;
  onEdit: (itemId: string) => void;
}

export function BoardItemRow({ 
  item, 
  boardType, 
  onToggleCheck, 
  onEdit 
}: Readonly<BoardItemRowProps>) {
  return (
    <Box p={4} _hover={{ bg: "gray.50" }}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={3} flex={1}>
          {boardType === BoardType.CHECKLIST && (
            <input
              type="checkbox"
              checked={item.is_checked}
              onChange={() => onToggleCheck(item.id)}
              style={{ transform: 'scale(1.2)' }}
            />
          )}
          <VStack align="start" gap={1} flex={1}>
            <Text 
              fontWeight="medium" 
              textDecoration={item.is_checked ? 'line-through' : 'none'}
              color={item.is_checked ? 'gray.500' : 'inherit'}
            >
              {item.name}
            </Text>
            {item.details && (
              <Text fontSize="sm" color="gray.600">
                {item.details}
              </Text>
            )}
          </VStack>
        </Flex>
        <Button
          onClick={() => onEdit(item.id)}
          variant="ghost"
          size="sm"
          colorPalette="blue"
        >
          Edit
        </Button>
      </Flex>
    </Box>
  );
}