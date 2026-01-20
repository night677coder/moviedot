import requests
import re

# Test the Streamlare URL and inspect the HTML
test_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"

print(f"Inspecting Streamlare URL: {test_url}")

try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.5movierulz.voyage/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    response = requests.get(test_url, headers=headers, allow_redirects=True, timeout=10)
    
    if response.status_code == 200:
        content = response.text
        print(f"Content length: {len(content)}")
        
        # Save the HTML to file for inspection
        with open('streamlare_page.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("HTML saved to streamlare_page.html")
        
        # Look for various patterns
        patterns = [
            (r'iframe', 'iframe'),
            (r'source', 'source'),
            (r'\.m3u8', 'm3u8'),
            (r'\.mp4', 'mp4'),
            (r'video', 'video'),
            (r'script', 'script'),
            (r'embed', 'embed'),
        ]
        
        print("\n=== Pattern Analysis ===")
        for pattern, name in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            print(f"{name}: {len(matches)} occurrences")
        
        # Look for specific video source patterns
        video_patterns = [
            (r'source\s+src=["\']([^"\']+)["\']', 'source src'),
            (r'file:\s*["\']([^"\']+)["\']', 'file:'),
            (r'["\']([^"\']*\.m3u8[^"\']*)["\']', 'm3u8'),
            (r'["\']([^"\']*\.mp4[^"\']*)["\']', 'mp4'),
            (r'var\s+(\w+)\s*=\s*["\']([^"\']+)["\']', 'javascript var'),
        ]
        
        print("\n=== Video Sources ===")
        found_any = False
        for pattern, name in video_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                print(f"{name}: {matches[:3]}")
                found_any = True
        
        if not found_any:
            print("No direct video sources found")
        
        # Show first 1000 characters
        print(f"\n=== First 1000 characters ===")
        print(content[:1000])
        
        # Look for JavaScript variables that might contain video URLs
        print(f"\n=== JavaScript Variables ===")
        js_patterns = [
            (r'var\s+(\w+)\s*=\s*["\']([^"\']+)["\']', 'var assignment'),
            (r'let\s+(\w+)\s*=\s*["\']([^"\']+)["\']', 'let assignment'),
            (r'const\s+(\w+)\s*=\s*["\']([^"\']+)["\']', 'const assignment'),
            (r'["\']([^"\']*stream[^"\']*)["\']', 'stream keyword'),
        ]
        
        for pattern, name in js_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                print(f"{name}: {matches[:3]}")
    
    else:
        print(f"Error: {response.status_code}")

except Exception as e:
    print(f"Exception: {e}")
