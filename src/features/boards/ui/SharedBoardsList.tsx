'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import {
  Button,
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Flex,
  Spinner,
  Alert,
  HStack,
} from '@chakra-ui/react';
import { GET_SHARED_BOARDS_QUERY } from '@/src/entities/board-share/api';
import { BoardType } from '@/src/entities/board';
import { PermissionLevel } from '@/types/board-share';

interface SharedBoard {
  id: string;
  name: string;
  board_type: string;
  myPermission: PermissionLevel;
  created_at: string;
}

interface SharedBoardsData {
  sharedBoards: SharedBoard[];
}

function getBoardTypeLabel(boardType: string): string {
  switch (boardType) {
    case BoardType.CHECKLIST:
      return '✓ Checklist';
    case BoardType.NOTICE_BOARD:
      return '📋 Notice Board';
    default:
      return boardType.replace('_', ' ');
  }
}

function getPermissionBadge(permission: PermissionLevel) {
  const config = {
    [PermissionLevel.VIEW]: { label: 'Can view', color: 'gray' },
    [PermissionLevel.EDIT]: { label: 'Can edit', color: 'blue' },
    [PermissionLevel.ADMIN]: { label: 'Admin', color: 'purple' },
  };

  const { label, color } = config[permission] || config[PermissionLevel.VIEW];

  return (
    <Badge colorPalette={color} size="sm">
      {label}
    </Badge>
  );
}

export function SharedBoardsList() {
  const { loading, error, data } = useQuery<SharedBoardsData>(GET_SHARED_BOARDS_QUERY);

  if (loading)
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" colorPalette="appPrimary" />
      </Flex>
    );

  if (error)
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error loading shared boards</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );

  if (!data?.sharedBoards || data.sharedBoards.length === 0) {
    return (
      <Card.Root>
        <Card.Body>
          <Text fontSize="md" color="gray.500" textAlign="center" py={4}>
            No boards have been shared with you yet.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
      {data.sharedBoards.map((board) => (
        <Card.Root
          key={board.id}
          _hover={{
            transform: 'translateY(-4px)',
            shadow: 'xl',
            borderColor: 'blue.300',
          }}
          transition="all 0.2s"
          borderColor="blue.200"
          variant="outline"
          bg="blue.50"
          _dark={{ bg: 'blue.950' }}
        >
          <Card.Body p={6}>
            <Flex direction="column" gap={3}>
              <HStack justify="space-between" align="flex-start">
                <Heading size="lg" color="blue.700" _dark={{ color: 'blue.300' }}>
                  {board.name}
                </Heading>
                <Badge colorPalette="blue" variant="solid" size="sm">
                  Shared
                </Badge>
              </HStack>

              <HStack gap={2} flexWrap="wrap">
                <Badge colorPalette="blue" width="fit-content" variant="subtle">
                  {getBoardTypeLabel(board.board_type)}
                </Badge>
                {getPermissionBadge(board.myPermission)}
              </HStack>

              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                Shared on: {new Date(board.created_at).toLocaleDateString()}
              </Text>
            </Flex>
          </Card.Body>
          <Card.Footer>
            <Button asChild colorPalette="blue" width="full">
              <Link href={`/boards/${board.id}`}>
                {board.myPermission === PermissionLevel.VIEW
                  ? 'View Board'
                  : 'Open Board'}
              </Link>
            </Button>
          </Card.Footer>
        </Card.Root>
      ))}
    </Grid>
  );
}
