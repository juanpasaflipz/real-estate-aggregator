
# Claude Code Prompt for MCP Agent Backend Integration

You are Claude Code operating within an MCP (Message-Channel Protocol) system. Your task is to serve as an intelligent backend interface for a Mexico Real Estate Aggregator app. The backend stack includes Node.js, Express, and PostgreSQL. Use the following structure to power tool-based interactions.

## Objectives

1. **Define MCP Tool**
   - Name: `fetch_properties`
   - Type: function
   - Language: TypeScript (preferred) or Python
   - Inputs: `city`, `zip-code`, `area` `priceMin`, `priceMax`, `bedrooms`, `features`
   - Output: JSON list of properties with `title`, `price`, `location`, `bedrooms`, `link`, `image`

2. **Message Handling Logic**
   - Detect user intent from input message (e.g., “Find me 2-bedroom homes in Buenos Aires under 200,000 USD”)
   - Construct a structured query for the `fetch_properties` tool
   - Call the tool (backend endpoint: `GET /api/properties/search`)
   - Return a concise summary with the top listings

3. **MCP Structure**
   - Channels: `search_request`, `filter_update`, `property_details`
   - State: Store previous user inputs and filters for refinement

4. **Output Behavior**
   - Return responses formatted for frontends: chat UIs, Telegram bot, or web app
   - Ensure replies are informative, structured, and minimal in token use

## Integration Notes
- API endpoint base: `http://localhost:3001`
- Use fetch and async/await for tool calls
- Keep tool code modular and well-typed

Proceed to generate the tool function and handler scaffolding accordingly.
