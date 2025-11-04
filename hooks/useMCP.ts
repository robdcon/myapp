import { useState, useEffect } from 'react';
import { mcpClient } from '@/lib/mcp-client';

export function useMCP() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMCP = async () => {
      try {
        await mcpClient.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize MCP');
      }
    };

    initializeMCP();

    return () => {
      mcpClient.destroy();
    };
  }, []);

  const callTool = async (name: string, args: any = {}) => {
    if (!isInitialized) throw new Error('MCP not initialized');
    return mcpClient.callTool(name, args);
  };

  return {
    isInitialized,
    error,
    callTool,
    getUsageInstructions: () => mcpClient.getUsageInstructions()
  };
}
