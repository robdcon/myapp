'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { MyBoardsData } from '@/types';
import { BoardEntity } from '@/src/entities/board';
import { Box, Button, Card, Grid, Heading, Text, Badge, Flex, Spinner, Alert } from "@chakra-ui/react"
import { Loading, ErrorAlert } from '@/src/shared';

const MY_BOARDS_QUERY = gql`
  query MyBoards {
    myBoards {
      id
      name
      created_at
      board_type
    }
  }
`;

export default function BoardList() {
  const { loading, error, data } = useQuery<MyBoardsData>(MY_BOARDS_QUERY);

  if (loading) return <Loading message="Loading boards..." />;
  
  if (error) return <ErrorAlert title="Error loading boards" message={error.message} />;

  return (
    <Box p={6}>
      <Heading size="2xl" mb={6}>My Boards</Heading>
      
      {data?.myBoards.length === 0 ? (
        <Card.Root>
          <Card.Body>
            <Text fontSize="lg" color="gray.600">
              No boards yet. Create your first board!
            </Text>
          </Card.Body>
        </Card.Root>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {data?.myBoards.map((boardData: any) => {
            const board = new BoardEntity(boardData);
            return (
              <Card.Root key={board.id} _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }} transition="all 0.2s">
                <Card.Body>
                  <Flex direction="column" gap={3}>
                    <Heading size="lg">{board.name}</Heading>
                    <Badge colorPalette="teal" width="fit-content">
                      {board.getFormattedType()}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      Created: {board.getRelativeCreatedDate()}
                    </Text>
                    {board.isChecklist() && (
                      <Text fontSize="sm" color="blue.600">
                        {board.getCompletionRate().toFixed(0)}% complete
                      </Text>
                    )}
                  </Flex>
                </Card.Body>
                <Card.Footer>
                  <Button asChild colorPalette="teal" width="full">
                    <Link href={`/boards/${board.id}`}>
                      View Board
                    </Link>
                  </Button>
                </Card.Footer>
              </Card.Root>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}