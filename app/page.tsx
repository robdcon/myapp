import { auth0 } from "@/lib/auth0";
import BoardList from "@/app/components/Boards";
import { Button, VStack, Box, Heading, Container, Flex } from "@chakra-ui/react";
import Link from "next/link";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <Container maxW="container.sm" centerContent py={20}>
        <Box textAlign="center">
          <Heading size="3xl" mb={4}>Welcome to Board Manager</Heading>
          <VStack gap={4} mt={8}>
            <Button 
              asChild
              colorScheme="teal" 
              size="lg"
              width="200px"
            >
              <Link href="/auth/login?screen_hint=signup">
                Sign up
              </Link>
            </Button>
            <Button 
              asChild
              colorScheme="blue" 
              variant="outline"
              size="lg"
              width="200px"
            >
              <Link href="/auth/login">
                Log in
              </Link>
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="xl">Welcome, {session.user.name}!</Heading>
            <Button asChild colorScheme="red" variant="ghost">
              <Link href="/auth/logout">
                Logout
              </Link>
            </Button>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        <BoardList />
      </Container>
    </Box>
  );
}
