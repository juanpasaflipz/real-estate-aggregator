#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlencode

def scrape_residential_listings(
    url: str,
    api_key: str,
    render_js: bool = False
) -> List[Dict[str, str]]:
    """
    Scrape rental property listings from VivaAnuncios using scrape.do API.
    
    Args:
        url: Target URL to scrape
        api_key: scrape.do API key
        render_js: Whether to enable JavaScript rendering
    
    Returns:
        List of property listings with title, price, location, and url
    """
    
    # Construct scrape.do API URL
    params = {
        'token': api_key,
        'url': url
    }
    
    if render_js:
        params['render'] = 'true'
    
    api_url = f"https://api.scrape.do?{urlencode(params)}"
    
    try:
        # Fetch content via scrape.do
        response = requests.get(api_url)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all listing cards - try multiple possible selectors
        listings = []
        
        # Try different card selectors that VivaAnuncios might use
        card_selectors = [
            ('div', {'class': 'ad-card-wide'}),
            ('div', {'class': 'tileV2'}),
            ('article', {'class': 'listing'}),
            ('div', {'class': 'ad-listing-card'}),
            ('div', {'class': 'tile-wrap'}),
            ('div', {'class': 'ad-list-card'})
        ]
        
        listing_cards = []
        for tag, attrs in card_selectors:
            listing_cards = soup.find_all(tag, attrs)
            if listing_cards:
                break
        
        # If no cards found with class selectors, try data attributes
        if not listing_cards:
            listing_cards = soup.find_all(attrs={'data-qa': 'ad-card'})
        
        for card in listing_cards:
            listing_data = {}
            
            # Extract title - try multiple selectors
            title_selectors = [
                ('a', {'class': 'ad-card-title'}),
                ('h2', {'class': 'tile-title'}),
                ('a', {'class': 'href-link'}),
                ('h3', None),  # Generic h3
                ('a', {'data-qa': 'ad-title'})
            ]
            
            for tag, attrs in title_selectors:
                title_elem = card.find(tag, attrs)
                if title_elem:
                    listing_data['title'] = title_elem.text.strip()
                    # Get URL from the link
                    link_elem = title_elem if title_elem.name == 'a' else title_elem.find_parent('a')
                    if link_elem:
                        listing_data['url'] = urljoin(url, link_elem.get('href', ''))
                    break
            
            # Extract price - try multiple selectors
            price_selectors = [
                ('span', {'class': 'ad-price'}),
                ('div', {'class': 'price'}),
                ('span', {'class': 'tile-price'}),
                ('div', {'class': 'ad-card-price'}),
                ('span', {'data-qa': 'ad-price'})
            ]
            
            for tag, attrs in price_selectors:
                price_elem = card.find(tag, attrs)
                if price_elem:
                    listing_data['price'] = price_elem.text.strip()
                    break
            
            # Extract location - try multiple selectors
            location_selectors = [
                ('span', {'class': 'ad-location'}),
                ('div', {'class': 'location'}),
                ('span', {'class': 'tile-location'}),
                ('div', {'class': 'ad-card-location'}),
                ('span', {'data-qa': 'ad-location'})
            ]
            
            for tag, attrs in location_selectors:
                location_elem = card.find(tag, attrs)
                if location_elem:
                    listing_data['location'] = location_elem.text.strip()
                    break
            
            # Only add if we have at least title and URL
            if 'title' in listing_data and 'url' in listing_data:
                listings.append(listing_data)
        
        return listings
        
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return []
    except Exception as e:
        print(f"Error parsing data: {e}")
        return []


def main():
    # Example usage
    SCRAPE_DO_API_KEY = "your_api_key_here"  # Replace with actual API key
    target_url = "https://www.vivanuncios.com.mx/s-renta-inmuebles/distrito-federal/v1c30l1029p1"
    
    print("Fetching rental listings...")
    results = scrape_residential_listings(
        url=target_url,
        api_key=SCRAPE_DO_API_KEY,
        render_js=False  # Enable if needed for dynamic content
    )
    
    # Output as formatted JSON
    print(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\nTotal listings found: {len(results)}")


if __name__ == "__main__":
    main()