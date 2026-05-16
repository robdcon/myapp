import { auth0 } from '@/src/shared/lib/auth0';
import { BoardList, SharedBoardsList } from '@/src/features/boards';
import {
  Button,
  VStack,
  Box,
  Heading,
  Container,
  Flex,
  Text,
  Badge,
} from '@chakra-ui/react';
import Link from 'next/link';

export async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <Container maxW="container.sm" centerContent py={20}>
        <Box textAlign="center">
          <Badge
            colorPalette="appPrimary"
            size="lg"
            mb={4}
            px={3}
            py={1}
            borderRadius="full"
          >
            Collaborative Board Manager
          </Badge>
          <Heading size="3xl" mb={4} color="appPrimary.700">
            Organise Everything Together
          </Heading>
          <Text color="gray.600" fontSize="lg" mb={8} maxW="380px" mx="auto">
            Create shared checklists, notice boards, and event boards. Check items off in
            real time — perfect for families, teams, and projects.
          </Text>
          <VStack gap={4}>
            <Button asChild colorPalette="appPrimary" size="lg" width="200px">
              <Link href="/auth/login?screen_hint=signup">Sign up free</Link>
            </Button>
            <Button
              asChild
              colorPalette="appPrimary"
              variant="outline"
              size="lg"
              width="200px"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pb={8}>
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="xl" color="appPrimary.700">
              Welcome, {session.user.name}!
            </Heading>
            <Button asChild colorPalette="gray" variant="ghost">
              <Link href="/auth/logout">Logout</Link>
            </Button>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        <VStack gap={12} align="stretch">
          <BoardList />

          <Box>
            <Heading size="2xl" mb={6} color="appPrimary.700">
              Shared with Me
            </Heading>
            <SharedBoardsList />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
