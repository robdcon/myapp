import { Flex, Spinner, Text } from '@chakra-ui/react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Loading({ message = 'Loading...', size = 'xl' }: LoadingProps) {
  return (
    <Flex justify="center" align="center" minH="200px" direction="column" gap={4}>
      <Spinner size={size} colorPalette="teal" />
      <Text color="gray.600">{message}</Text>
    </Flex>
  );
}
