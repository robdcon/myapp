import { useDisplayUncheckedItems } from '../api/display-unchecked-items';
import { Box, Heading, VStack, Text, Card, Spinner } from '@chakra-ui/react';

interface UncheckedItemsListProps {
  boardId: string;
}

export const UncheckedItemsList = ({ boardId }: UncheckedItemsListProps) => {
  const { uncheckedItems, totalUnchecked, hasUncheckedItems, loading, error } =
    useDisplayUncheckedItems(boardId);

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
        <VStack align="stretch" gap={2}>
          {uncheckedItems.map((item) => (
            <Box
              key={item.id}
              p={3}
              bg="gray.50"
              rounded="md"
              borderLeft="3px solid"
              borderColor="appPrimary.500"
              _hover={{ bg: 'appPrimary.50' }}
              transition="background 0.2s"
            >
              <Text fontWeight="medium">{item.name}</Text>
              {item.details && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {item.details}
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
