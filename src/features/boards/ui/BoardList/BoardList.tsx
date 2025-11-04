'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Box, Button, Card, Grid, Heading, Text, Badge, Flex, Spinner, Alert } from "@chakra-ui/react";
import { MY_BOARDS_QUERY } from '../../api/queries';
import { MyBoardsData } from '../../model/types';

export default function BoardList() {
  const { loading, error, data } = useQuery<MyBoardsData>(MY_BOARDS_QUERY);

  if (loading) return (
    <Flex justify="center" align="center" minH="200px">
      <Spinner size="xl" colorPalette="teal" />
    </Flex>
  );
  
  if (error) return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Error loading boards</Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );

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
          {data?.myBoards.map((board) => (
            <Card.Root key={board.id} _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }} transition="all 0.2s">
              <Card.Body>
                <Flex direction="column" gap={3}>
                  <Heading size="lg">{board.name}</Heading>
                  <Badge colorPalette="teal" width="fit-content">
                    {board.board_type.replace('_', ' ')}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    Created: {new Date(board.created_at).toLocaleDateString()}
                  </Text>
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
          ))}
        </Grid>
      )}
    </Box>
  );
}
