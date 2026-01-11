import { spawn } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

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

class ServerMCPClient {
  private static instance: ServerMCPClient;
  private server: any = null;
  private requestId = 0;
  private pendingRequests = new Map<number, (response: MCPResponse) => void>();
  private initialized = false;

  static getInstance() {
    if (!ServerMCPClient.instance) {
      ServerMCPClient.instance = new ServerMCPClient();
    }
    return ServerMCPClient.instance;
  }

  async initialize() {
    if (this.initialized) return;

    this.server = spawn('node', ['D:\\CODE\\AI\\mcp-servers\\mcp-design-system\\build\\index.js'], {
      cwd: 'D:\\CODE\\AI\\mcp-servers\\mcp-design-system',
      stdio: 'pipe',
    });

    this.server.stdout?.on('data', (data: Buffer) => {
      const responses = data.toString().trim().split('\n');
      responses.forEach((response) => {
        if (!response) return;
        try {
          const parsed: MCPResponse = JSON.parse(response);
          const callback = this.pendingRequests.get(parsed.id);
          if (callback) {
            callback(parsed);
            this.pendingRequests.delete(parsed.id);
          }
        } catch (e) {
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

    this.initialized = true;
  }

  private sendRequest(method: string, params?: any): Promise<MCPResponse> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, resolve);

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, 10000);

      this.pendingRequests.set(id, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.server?.stdin?.write(JSON.stringify(request) + '\n');
    });
  }

  async callTool(name: string, args: any = {}) {
    await this.initialize();
    return this.sendRequest('tools/call', { name, arguments: args });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tool, args } = await request.json();
    const client = ServerMCPClient.getInstance();
    const response = await client.callTool(tool, args);

    return NextResponse.json(response);
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json({ error: 'Failed to call MCP server' }, { status: 500 });
  }
}
