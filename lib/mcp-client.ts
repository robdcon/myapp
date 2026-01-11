import { spawn, ChildProcess } from 'child_process';

interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: any;
}

class MCPClient {
  private server: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, (response: MCPResponse) => void>();

  async initialize() {
    this.server = spawn('node', ['D:\\CODE\\AI\\mcp-servers\\mcp-design-system\\build\\index.js'], {
      cwd: 'D:\\CODE\\AI\\mcp-servers\\mcp-design-system',
      stdio: 'pipe',
    });

    this.server.stdout?.on('data', (data) => {
      const responses = data.toString().trim().split('\n');
      responses.forEach((response: string) => {
        if (!response) return;
        try {
          const parsed: MCPResponse = JSON.parse(response);
          const callback: ((response: MCPResponse) => void) | undefined = this.pendingRequests.get(
            parsed.id
          );
          if (callback) {
            callback(parsed);
            this.pendingRequests.delete(parsed.id);
          }
        } catch (e: unknown) {
          console.error('Failed to parse MCP response:', e);
        }
      });
    });

    // Initialize the server
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'chakra-app', version: '1.0.0' },
    });
  }

  private sendRequest(method: string, params?: any): Promise<MCPResponse> {
    return new Promise((resolve) => {
      const id = ++this.requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, resolve);
      this.server?.stdin?.write(JSON.stringify(request) + '\n');
    });
  }

  async callTool(name: string, args: any = {}) {
    return this.sendRequest('tools/call', { name, arguments: args });
  }

  async getUsageInstructions() {
    return this.callTool('get_usage_instructions');
  }

  destroy() {
    this.server?.kill();
  }
}

export const mcpClient = new MCPClient();
