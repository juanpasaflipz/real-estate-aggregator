#!/bin/bash

# Start the mock API server in the background
echo "Starting mock API server..."
npm run mock-api &
MOCK_PID=$!

# Wait for server to start
sleep 2

# Run the test client
echo -e "\n\nRunning MCP client tests...\n"
npm run test

# Kill the mock server
kill $MOCK_PID

echo -e "\nTest complete!"