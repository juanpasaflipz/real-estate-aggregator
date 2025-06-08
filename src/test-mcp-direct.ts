import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPDirect() {
  console.log('Testing MCP server directly...\n');

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/index.ts'],
      env: process.env as Record<string, string>,
    });

    const client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    console.log('Connected to MCP server');

    // List available tools
    const tools = await client.listTools();
    console.log('Available tools:', tools);

    // Call the fetch_properties tool
    console.log('\nCalling fetch_properties tool...');
    const result = await client.callTool({
      name: 'fetch_properties',
      arguments: {
        city: 'Mexico City'
      }
    });

    console.log('Tool call successful:', !result.isError);
    if (!result.isError) {
      const content = result.content as Array<{ type: string; text: string }>;
      console.log('Result:', JSON.parse(content[0].text));
    } else {
      console.error('Error:', result);
    }

    await client.close();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMCPDirect();