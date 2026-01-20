import requests
import json

# Test the API directly
movie_url = "https://www.5movierulz.voyage/bhartha-mahasayulaku-wignyapthi-2026-telugu/movie-watch-online-free-6250.html"

try:
    response = requests.get(f"http://localhost:8000/get?url={movie_url}")
    
    if response.status_code == 200:
        data = response.json()
        
        print("=== API Response ===")
        print(f"Status: {data.get('status')}")
        print(f"Title: {data.get('title')}")
        
        other_links = data.get('other_links', [])
        print(f"\n=== Other Links ({len(other_links)}) ===")
        
        for i, link in enumerate(other_links):
            print(f"{i+1}. Type: {link.get('type')}")
            print(f"   URL: {link.get('url')}")
            print(f"   URL repr: {repr(link.get('url'))}")
            print()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Error: {e}")
