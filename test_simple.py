import requests
import re

# Test with the corrected URL
test_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"

print(f"Testing Streamlare URL: {test_url}")

try:
    # Use a CORS proxy to fetch the page
    proxy_url = f"https://api.allorigins.win/get?url={test_url}"
    print(f"Proxy URL: {proxy_url}")
    
    response = requests.get(proxy_url)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check the structure of the response
        print(f"Response keys: {data.keys()}")
        
        # Try different possible response structures
        html = ""
        if 'contents' in data:
            html = data['contents']
        elif 'data' in data:
            html = data['data']
        elif isinstance(data, str):
            html = data
        else:
            print(f"Unexpected response structure: {data}")
            exit(1)
            
        print(f"HTML length: {len(html)}")
        
        # Look for various video source patterns
        patterns = [
            (r'source\s+src=["\']([^"\']+)["\']', 'source src'),
            (r'file:\s*["\']([^"\']+)["\']', 'file:'),
            (r'["\']([^"\']*\.m3u8[^"\']*)["\']', 'm3u8'),
            (r'["\']([^"\']*\.mp4[^"\']*)["\']', 'mp4'),
            (r'["\'](https?:\/\/[^"\']*vcdn[^"\']*)["\']', 'vcdn'),
            (r'["\'](https?:\/\/[^"\']*streamlare[^"\']*)["\']', 'streamlare'),
        ]
        
        print("\n=== Found patterns ===")
        found_any = False
        for pattern, name in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            if matches:
                print(f"{name}: {matches[:3]}")  # Show first 3 matches
                found_any = True
        
        if not found_any:
            print("No video patterns found")
            # Show first 500 chars of HTML for debugging
            print(f"\nFirst 500 chars of HTML:\n{html[:500]}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Error: {e}")
