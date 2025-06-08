### 🎯 Goal:
Build a Node.js script that:
1. Fetches rental property listings from `https://www.vivanuncios.com.mx/s-renta-inmuebles/distrito-federal/v1c30l1029p1`
2. Uses the `scrape.do` API to bypass bot protection
3. Parses HTML into structured JSON
4. Outputs a list of listings with:
   - `title`
   - `price`
   - `location`
   - `url` (absolute link to listing)

## 🔐 Inputs:
- `SCRAPE_DO_API_KEY` (string): User's API key for scrape.do
- `render` (optional boolean): If true, enable JavaScript rendering via `&render=true`

## 🔧 Tech Stack:
Use the following Node.js tools:
- `axios` for HTTP requests
- `cheerio` for HTML parsing (jQuery-like syntax)

## 🧠 Claude Code Instructions:
Write clean and well-commented JavaScript code that:
- Accepts `url` and `apiKey` variables
- Makes a GET request to `https://api.scrape.do`
- Extracts the required listing data using `cheerio`
- Logs the final JSON array to the console

## 📦 Expected Output:
```json
[
  {
    "title": "Departamento en renta en Polanco",
    "price": "$25,000",
    "location": "Miguel Hidalgo, CDMX",
    "url": "https://www.vivanuncios.com.mx/.../123456"
  },
  ...
]