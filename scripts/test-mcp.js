const { spawn } = require('child_process');

// Test the MCP server directly
const mcpServer = spawn('node', [
  'D:\\CODE\\AI\\mcp-servers\\mcp-design-system\\build\\index.js'
], {
  cwd: 'D:\\CODE\\AI\\mcp-servers\\mcp-design-system',
  stdio: 'pipe'
});

// First, send initialization request
const initRequest = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
};

let initialized = false;

mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

mcpServer.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n');
  
  responses.forEach(response => {
    if (!response) return;
    
    try {
      const parsed = JSON.parse(response);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      
      // After initialization, call get_usage_instructions
      if (parsed.id === 0 && !initialized) {
        initialized = true;
        
        // Send the usage instructions request
        const usageRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "get_usage_instructions",
            arguments: {}
          }
        };
        
        console.log('\nSending usage instructions request...');
        mcpServer.stdin.write(JSON.stringify(usageRequest) + '\n');
      }
    } catch (e) {
      console.log('Raw response:', response);
    }
  });
});

mcpServer.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

setTimeout(() => {
  mcpServer.kill();
}, 5000);
