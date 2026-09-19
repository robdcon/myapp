import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

// Precached and served by Serwist as the offline fallback for failed
// document navigations (see docs/adr/0001-pwa-conversion-mvp-scope.md).
// Data still won't load offline in this MVP, so this only covers the
// "no network at all" navigation case, not offline editing.
export default function OfflinePage() {
  return (
    <Container maxW="container.sm" centerContent py={20}>
      <VStack gap={4} textAlign="center">
        <Box>
          <Heading size="2xl" color="appPrimary.700" mb={2}>
            You&rsquo;re offline
          </Heading>
          <Text color="gray.600" fontSize="lg">
            This app needs a network connection to load your boards. Please reconnect and try
            again.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
