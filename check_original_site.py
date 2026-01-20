import requests
from bs4 import BeautifulSoup

# Test the original site's API endpoint
print("Testing original site API...")

try:
    # Test getting movie details like our app does
    movie_url = "https://www.5movierulz.voyage/bhartha-mahasayulaku-wignyapthi-2026-telugu/movie-watch-online-free-6250.html"
    
    # Use our app's get function logic
    response = requests.get(f"http://localhost:8000/get?url={movie_url}")
    
    if response.status_code == 200:
        data = response.json()
        print("API Response:")
        print(f"Status: {data.get('status')}")
        print(f"Title: {data.get('title')}")
        
        other_links = data.get('other_links', [])
        print(f"\nFound {len(other_links)} other links:")
        
        for i, link in enumerate(other_links):
            print(f"  {i+1}. Type: {link.get('type')}")
            print(f"     URL: {link.get('url')}")
            
            # Check if it's a Streamlare link
            url = link.get('url', '')
            if 'streamlare' in url.lower() or 'vcdn' in url.lower():
                print(f"     -> Streamlare link detected!")
                
                # Test if this URL works directly
                try:
                    stream_response = requests.get(url, allow_redirects=True, timeout=10)
                    print(f"     Direct access: {stream_response.status_code} -> {stream_response.url}")
                    
                    # Check content type
                    content_type = stream_response.headers.get('content-type', '')
                    print(f"     Content type: {content_type}")
                    
                    if 'text/html' in content_type:
                        # Check if it's an embed page
                        content = stream_response.text[:1000]
                        if 'iframe' in content.lower():
                            print("     -> This is an embed page")
                        elif '404' in content:
                            print("     -> 404 Error")
                        else:
                            print("     -> Other HTML content")
                    
                except Exception as e:
                    print(f"     Error accessing: {e}")
            
            print()
    else:
        print(f"API Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Error: {e}")
    print("Make sure the backend is running on localhost:8000")
