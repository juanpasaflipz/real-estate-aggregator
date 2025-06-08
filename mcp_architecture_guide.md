
# MCP Real Estate Aggregator - Claude Code Architecture Guide

## 🧩 Project Overview

This project is a **Modular Cloud Platform (MCP)** backend that powers a multi-frontend real estate aggregator. It fetches online property listings across Latin America, intelligently stores the most requested queries using a **vector database**, and exposes a lightweight, scalable **API** to connect seamlessly with any frontend (mobile, web, desktop).

---

## 🧱 Tech Stack Overview

- **Language:** TypeScript / Node.js
- **Framework:** Express (or Fastify) for API gateway
- **Database:** PostgreSQL (structured data) + Redis (cache)
- **Vector Database:** Qdrant, Weaviate, or Pinecone (for semantic search)
- **Deployment:** Docker + Render / Railway / AWS
- **API Format:** REST JSON (optionally gRPC/WebSocket later)

---

## 🏗️ MCP Server Hosts (Microservices)

Each host is modular and independently deployable.

### 1. `api-router-host`
- Entry point for all client queries (`/search`, `/listings`)
- Routes to other internal services
- Handles request validation and rate limiting

### 2. `scraper-host`
- Fetches listings from 3rd-party sources (EasyBroker, MercadoLibre, etc.)
- Parses and normalizes data into unified schema
- Can use Puppeteer, Axios, Cheerio depending on source

### 3. `vector-search-host`
- Receives embedding of user query via OpenAI or similar
- Performs semantic similarity search (top-k)
- Stores popular queries and user search context

### 4. `cache-db-host`
- Uses Redis for hot query caching
- Uses PostgreSQL for persistent listing and metadata storage

### 5. `analytics-host` *(optional)*
- Logs API usage, query frequencies, API key usage (if SaaS)
- Offers dashboard to admin to monitor host health and data flow

---

## 🧠 Vector Workflow Example

1. Client sends a search string:
   ```
   GET /search?q=Casas+en+Polanco+con+terraza
   ```

2. `api-router-host` transforms the query into an embedding using OpenAI

3. Embedding sent to `vector-search-host`:
   ```
   POST /vector-search {
     "embedding": [...],
     "top_k": 5
   }
   ```

4. Most relevant saved queries are returned if they match

5. If no match: query is passed to `scraper-host` and response is cached

---

## 📲 API Endpoints

| Endpoint            | Method | Description                                   |
|---------------------|--------|-----------------------------------------------|
| `/search`           | GET    | Query for listings by keywords or filters     |
| `/popular`          | GET    | Returns most requested queries (vector-based) |
| `/listing/:id`      | GET    | Get full data for a specific property         |
| `/query-vector`     | POST   | Submit embedding and get closest matches      |
| `/admin/logs`       | GET    | View analytics and request logs               |

---

## 🧩 Modular Code Structure

```bash
/mcp-aggregator/
│
├── api-router-host/        # Central router
├── scraper-host/           # Fetches and normalizes listings
├── vector-search-host/     # Embedding search & storage
├── cache-db-host/          # Redis + Postgres
├── analytics-host/         # Optional monitoring
├── shared/
│   └── utils/              # Logging, validation, etc.
└── .env                    # Environment secrets
```

---

## 🔐 Environment Variables (.env example)

```
OPENAI_API_KEY=
VECTOR_DB_URL=
POSTGRES_URL=
REDIS_URL=
EXTERNAL_API_EASYBROKER=
EXTERNAL_API_MERCADOLIBRE=
```

---

## 🚀 Deployment

- Use Docker Compose for local development
- Deploy services individually on Render or Railway
- Use reverse proxy or gateway (e.g., NGINX or built-in router) to route traffic

---

## 🔄 Frontend Integration

The API is frontend-agnostic:
- Web (Next.js, React)
- Mobile (React Native, Flutter)
- Desktop (Electron, Tauri)

All connect via `https://api.yourdomain.com/search?q=...`

---

## 🧠 Notes for Claude Code

- Use clear separation of concerns per host
- Comment API logic thoroughly
- Optimize common search calls with Redis cache
- Include OpenAI embeddings only in vector host
- Prioritize fast JSON responses for frontend speed
