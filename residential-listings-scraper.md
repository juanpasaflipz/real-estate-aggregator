## 🎯 Goal:
Create a Python script that:
1. Fetches rental property listings from `https://www.vivanuncios.com.mx/s-renta-inmuebles/distrito-federal/v1c30l1029p1`
2. Uses the `scrape.do` API to bypass anti-bot protection
3. Parses the HTML content into structured JSON
4. Outputs a list of results with these fields:
   - `title`
   - `price`
   - `location`
   - `url` (absolute link to listing)

## 🔐 Input Parameters:
- `SCRAPE_DO_API_KEY` (string): User’s API key from scrape.do

## 🔧 Tech Stack:
- `requests` for HTTP requests
- `BeautifulSoup` (from `bs4`) for HTML parsing

## 🔁 Optional:
- Allow toggling JavaScript rendering via `render=true` in query string

## 🧠 Claude Code Instructions:
Write clean, modular, and commented code to:
- Accept a `url` and `api_key` as variables
- Fetch content from Scrape.do (`https://api.scrape.do`)
- Parse HTML to extract data
- Return the results as a JSON list

## 🧪 Sample Output:
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