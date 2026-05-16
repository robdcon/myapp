'use client';

import { Box, Container } from '@chakra-ui/react';

export interface StickyFooterProps {
  children: React.ReactNode;
}

export function StickyFooter({ children }: Readonly<StickyFooterProps>) {
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      boxShadow="0 -2px 8px rgba(0,0,0,0.06)"
      p={4}
      zIndex={10}
    >
      <Container maxW="container.lg">{children}</Container>
    </Box>
  );
}
