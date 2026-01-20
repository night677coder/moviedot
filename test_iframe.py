import requests
import re

# Test the Streamlare URL and extract iframe content
test_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"

print(f"Testing Streamlare URL: {test_url}")

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
        
        # Extract iframe sources
        iframe_matches = re.findall(r'iframe[^>]*src=["\']([^"\']+)["\']', content, re.IGNORECASE)
        
        print(f"Found {len(iframe_matches)} iframe(s):")
        for i, iframe_src in enumerate(iframe_matches):
            print(f"  {i+1}. {iframe_src}")
            
            # Make relative URLs absolute
            if not iframe_src.startswith('http'):
                if iframe_src.startswith('//'):
                    iframe_src = f"https:{iframe_src}"
                elif iframe_src.startswith('/'):
                    iframe_src = f"https://ww7.vcdnlare.com{iframe_src}"
                else:
                    iframe_src = f"https://ww7.vcdnlare.com/{iframe_src}"
            
            print(f"     Full URL: {iframe_src}")
            
            # Try to fetch the iframe content
            try:
                iframe_response = requests.get(iframe_src, headers=headers, timeout=10)
                print(f"     Status: {iframe_response.status_code}")
                print(f"     Content-Type: {iframe_response.headers.get('content-type', 'Unknown')}")
                
                if iframe_response.status_code == 200:
                    iframe_content = iframe_response.text
                    
                    # Look for video sources in iframe
                    video_patterns = [
                        (r'source\s+src=["\']([^"\']+)["\']', 'source src'),
                        (r'file:\s*["\']([^"\']+)["\']', 'file:'),
                        (r'["\']([^"\']*\.m3u8[^"\']*)["\']', 'm3u8'),
                        (r'["\']([^"\']*\.mp4[^"\']*)["\']', 'mp4'),
                    ]
                    
                    print(f"     Video sources found:")
                    found_video = False
                    for pattern, name in video_patterns:
                        matches = re.findall(pattern, iframe_content, re.IGNORECASE)
                        if matches:
                            print(f"       {name}: {matches[:2]}")
                            found_video = True
                    
                    if not found_video:
                        print(f"     No direct video sources found")
                        print(f"     First 300 chars: {iframe_content[:300]}")
                        
                        # Check if it's another embed page
                        if 'iframe' in iframe_content.lower():
                            print(f"     ⚠️  This iframe contains another iframe!")
                
                print()
                
            except Exception as e:
                print(f"     Error fetching iframe: {e}")
                print()
    
    else:
        print(f"Error: {response.status_code}")

except Exception as e:
    print(f"Exception: {e}")
