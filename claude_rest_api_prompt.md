
### Prompt for Claude to Create REST API on Top of MCP Server

You currently have an MCP (Model Control Protocol) server designed specifically for AI-powered backend tasks. Now, you need to build a REST API layer on top of your MCP server to make the data and services accessible to standard frontend clients such as web, mobile, and desktop apps.

#### Requirements:

1. **REST API Structure**:
   - Use standard RESTful practices (GET, POST, PUT, DELETE).
   - Clearly defined, intuitive endpoints (e.g., `/properties?city=MexicoCity`).

2. **Integration with MCP Server**:
   - REST API should forward structured client requests to the MCP server.
   - MCP server will handle intelligent data processing (complex queries, data fetching, caching).

3. **Data Handling**:
   - Format all responses as JSON.
   - Include proper error handling and status codes (e.g., 200, 400, 404, 500).

4. **Caching & Performance**:
   - Leverage MCP server caching mechanisms for frequently requested data.

5. **Endpoints Example**:
   - `GET /properties?city={city}`
   - `GET /properties/{propertyId}`
   - `POST /user/preferences` (to save user preferences)

6. **Security & Validation**:
   - Validate incoming requests.
   - Sanitize inputs to prevent injection attacks or invalid requests.

7. **Documentation**:
   - Provide clear API documentation with example requests and responses.

### Example Flow:
- Frontend requests: `GET /properties?city=MexicoCity`
- REST API forwards request to MCP Server.
- MCP Server retrieves intelligently processed and cached data.
- REST API returns structured JSON to Frontend:

```json
{
  "status": "success",
  "data": [
    {"id": "123", "address": "Main St", "price": "$500,000"},
    {"id": "456", "address": "Broadway", "price": "$750,000"}
  ]
}
```
