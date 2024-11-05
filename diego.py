import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from datetime import datetime

def parse_property_details(article: BeautifulSoup) -> Dict[str, Any]:
    """Parse individual property article and extract relevant details"""
    property_details = {}
    
    # Get title
    title_element = article.select_one('h4.card-title a')
    if title_element:
        property_details['title'] = title_element.text.strip()
        property_details['url'] = title_element.get('href', '')

    # Get area
    area_element = article.select_one('.card-area')
    if area_element:
        property_details['area'] = area_element.text.strip()

    # Get prices
    price_element = article.select_one('.card-price')
    if price_element:
        # Get nightly price
        nightly_price = price_element.select_one('strong:first-child')
        if nightly_price:
            property_details['nightly_price'] = nightly_price.text.strip()
        
        # Get monthly price
        monthly_price = price_element.select_one('strong:last-child')
        if monthly_price:
            price_span = monthly_price.select_one('span[data-original-price]')
            period_span = monthly_price.select_one('span[data-period]')
            if price_span:
                property_details['monthly_price'] = price_span.text.strip()
            if period_span:
                property_details['rental_period'] = period_span.text.strip()

    # Get features
    features = []
    features_list = article.select('ul.card-features li')
    for feature in features_list:
        if feature:
            features.append(feature.text.strip())
    property_details['features'] = features

    # Get main image URL
    carousel = article.select_one('.prop-images-carousel')
    if carousel:
        main_image = carousel.get('data-mainimage', '')
        property_details['main_image'] = main_image

    # Get reference ID from the carousel
    if carousel:
        source_id = carousel.get('data-sourceid', '')
        property_details['reference_id'] = source_id

    return property_details

def scrape_properties(html_content: str) -> List[Dict[str, Any]]:
    """Scrape property listings from the HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    property_articles = soup.select('article.card')
    
    properties = []
    for article in property_articles:
        property_details = parse_property_details(article)
        properties.append(property_details)
    
    return properties

def get_properties_from_url(url: str) -> Dict[str, Any]:
    """
    Fetch and parse properties from a given URL
    
    Args:
        url: Website URL to scrape
        
    Returns:
        Dictionary containing scraped property data and metadata
    """
    try:
        # Set up headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Make the request
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Parse the content
        properties = scrape_properties(response.text)
        
        # Create result dictionary with metadata
        result = {
            'timestamp': datetime.now().isoformat(),
            'url': url,
            'total_properties': len(properties),
            'properties': properties,
            'status': 'success'
        }
        
        return result
        
    except requests.RequestException as e:
        # Handle any request-related errors
        return {
            'timestamp': datetime.now().isoformat(),
            'url': url,
            'status': 'error',
            'error_message': str(e),
            'total_properties': 0,
            'properties': []
        }

def save_properties_to_json(url: str, output_file: str = 'properties.json') -> None:
    """
    Fetch properties from URL and save them to a JSON file
    
    Args:
        url: Website URL to scrape
        output_file: Path to save the JSON file (default: 'properties.json')
    """
    result = get_properties_from_url(url)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"Data saved to {output_file}")
    print(f"Total properties found: {result['total_properties']}")
    print(f"Status: {result['status']}")

# Example usage:
if __name__ == "__main__":
    # Example URL
    url = "https://www.homewatch.es/inmbuscar?l=es&o=dateCreated+DESC&f=rent-short&curr=EUR&c%5B%5D=a51"
    
    # Option 1: Get JSON data directly
    result = get_properties_from_url(url)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # Option 2: Save to file
    # save_properties_to_json(url, 'marbella_properties.json')