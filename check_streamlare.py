import requests
from bs4 import BeautifulSoup
import re

# The Streamlare URL from the test
streamlare_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"

print(f"Testing Streamlare URL: {streamlare_url}")

try:
    response = requests.get(streamlare_url)
    print(f"Status: {response.status_code}")
    print(f"Final URL: {response.url}")
    print(f"Content type: {response.headers.get('content-type', 'Unknown')}")
    
    if response.status_code == 200:
        content = response.text
        
        # Look for various patterns
        patterns = [
            (r'source\s+src=["\']([^"\']+)["\']', 'source src'),
            (r'file:\s*["\']([^"\']+)["\']', 'file:'),
            (r'["\']([^"\']*\.m3u8[^"\']*)["\']', 'm3u8'),
            (r'["\']([^"\']*\.mp4[^"\']*)["\']', 'mp4'),
            (r'["\']([^"\']*vcdn[^"\']*)["\']', 'vcdn'),
            (r'["\']([^"\']*streamlare[^"\']*)["\']', 'streamlare'),
        ]
        
        print("\n=== Found patterns ===")
        for pattern, name in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                print(f"{name}: {matches[:3]}")  # Show first 3 matches
        
        # Look for JSON/config patterns
        config_patterns = [
            (r'(?:config|sources|file):\s*({[^}]+})', 'config'),
            (r'var\s+(?:config|sources|player)\s*=\s*({[^}]+});', 'var config'),
        ]
        
        print("\n=== Config patterns ===")
        for pattern, name in config_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                print(f"{name}: {matches[:2]}")
        
        # Check if it's an iframe embed page
        if 'iframe' in content.lower():
            print("\nContains iframe")
            
            # Look for iframe src
            iframe_matches = re.findall(r'iframe[^>]*src=["\']([^"\']+)["\']', content, re.IGNORECASE)
            if iframe_matches:
                print(f"Iframe sources: {iframe_matches[:3]}")
        
        # Save content for inspection
        with open('streamlare_content.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("\nContent saved to streamlare_content.html")
        
except Exception as e:
    print(f"Error: {e}")
