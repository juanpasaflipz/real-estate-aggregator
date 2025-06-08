#!/usr/bin/env python3
import os
from residential_scraper import scrape_residential_listings

# Test the scraper with a real API key if available
api_key = os.environ.get('SCRAPE_DO_API_KEY', 'test_key_here')

if api_key == 'test_key_here':
    print("⚠️  No SCRAPE_DO_API_KEY found in environment variables")
    print("Set it with: export SCRAPE_DO_API_KEY='your_actual_key'")
else:
    url = "https://www.vivanuncios.com.mx/s-renta-inmuebles/distrito-federal/v1c30l1029p1"
    print(f"Testing scraper with URL: {url}")
    
    results = scrape_residential_listings(url, api_key)
    
    if results:
        print(f"\n✅ Found {len(results)} listings:")
        for i, listing in enumerate(results[:3], 1):  # Show first 3
            print(f"\n{i}. {listing.get('title', 'No title')}")
            print(f"   Price: {listing.get('price', 'N/A')}")
            print(f"   Location: {listing.get('location', 'N/A')}")
            print(f"   URL: {listing.get('url', 'N/A')}")
    else:
        print("\n❌ No listings found. Check if selectors need updating.")