'use client';

import { useState, useEffect } from 'react';
import { DesignTokenService } from '@/lib/design-tokens';
import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Code,
  Tabs,
  Badge,
  Grid
} from '@chakra-ui/react';

export default function DesignSystemExplorer() {
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [generatedComponent, setGeneratedComponent] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetTokens = async (layer: 'settings' | 'tokens', category?: string) => {
    setLoading(true);
    try {
      const result = await DesignTokenService.getTokens(layer, category);
      setTokens(result);
    } catch (err) {
      console.error('Failed to get tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleListComponents = async () => {
    setLoading(true);
    try {
      const result = await DesignTokenService.listComponents();
      setComponents(result);
    } catch (err) {
      console.error('Failed to list components:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateComponent = async (type: string, variant?: string) => {
    setLoading(true);
    try {
      const result = await DesignTokenService.generateComponent(type, variant);
      setGeneratedComponent(result);
    } catch (err) {
      console.error('Failed to generate component:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" gap={6}>
        <Heading size="2xl">Macmillan Design System MCP</Heading>

        <Tabs.Root defaultValue="tokens">
          <Tabs.List>
            <Tabs.Trigger value="tokens">Design Tokens</Tabs.Trigger>
            <Tabs.Trigger value="components">Components</Tabs.Trigger>
            <Tabs.Trigger value="generator">Generator</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="tokens">
            <VStack align="stretch" gap={4}>
              <HStack gap={2} wrap="wrap">
                <Button onClick={() => handleGetTokens('tokens', 'colors')} disabled={loading}>
                  Color Tokens
                </Button>
                <Button onClick={() => handleGetTokens('tokens', 'spacing')} disabled={loading}>
                  Spacing Tokens
                </Button>
                <Button onClick={() => handleGetTokens('tokens', 'typography')} disabled={loading}>
                  Typography Tokens
                </Button>
                <Button onClick={() => handleGetTokens('settings')} disabled={loading}>
                  Primitive Settings
                </Button>
              </HStack>

              {tokens && (
                <Card.Root>
                  <Card.Header>
                    <Heading size="lg">Design Tokens</Heading>
                  </Card.Header>
                  <Card.Body>
                    <Code p={4} bg="gray.50" rounded="md" overflow="auto" maxH="400px">
                      <pre>{JSON.stringify(tokens, null, 2)}</pre>
                    </Code>
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="components">
            <VStack align="stretch" gap={4}>
              <Button onClick={handleListComponents} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'List Available Components'}
              </Button>

              {components.length > 0 && (
                <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                  {components.map((component: any, index: number) => (
                    <Card.Root key={index}>
                      <Card.Header>
                        <Heading size="md">{component.name}</Heading>
                      </Card.Header>
                      <Card.Body>
                        <VStack align="start" gap={2}>
                          <Text fontSize="sm">{component.description}</Text>
                          {component.variants && (
                            <HStack gap={1} wrap="wrap">
                              {component.variants.map((variant: string) => (
                                <Badge key={variant} size="sm">{variant}</Badge>
                              ))}
                            </HStack>
                          )}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Grid>
              )}
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="generator">
            <VStack align="stretch" gap={4}>
              <HStack gap={2} wrap="wrap">
                <Button onClick={() => handleGenerateComponent('button', 'primary')} disabled={loading}>
                  Generate Primary Button
                </Button>
                <Button onClick={() => handleGenerateComponent('card')} disabled={loading}>
                  Generate Card
                </Button>
                <Button onClick={() => handleGenerateComponent('input')} disabled={loading}>
                  Generate Input
                </Button>
              </HStack>

              {generatedComponent && (
                <Card.Root>
                  <Card.Header>
                    <Heading size="lg">Generated Component</Heading>
                  </Card.Header>
                  <Card.Body>
                    <Code p={4} bg="gray.50" rounded="md" overflow="auto" maxH="600px">
                      <pre>{generatedComponent}</pre>
                    </Code>
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
