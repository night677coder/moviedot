import requests

# Test the Streamlare URL directly
test_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"

print(f"Testing direct access to: {test_url}")

try:
    # Add headers to mimic a browser
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
    
    print(f"Status: {response.status_code}")
    print(f"Final URL: {response.url}")
    print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
    print(f"Content-Length: {len(response.content)}")
    
    if response.status_code == 200:
        content = response.text
        
        # Check what kind of content we got
        if 'iframe' in content.lower():
            print("✓ Contains iframe - this is an embed page")
            
            # Look for iframe src
            import re
            iframe_matches = re.findall(r'iframe[^>]*src=["\']([^"\']+)["\']', content, re.IGNORECASE)
            if iframe_matches:
                print(f"Found iframe sources: {iframe_matches[:3]}")
                
                # Test the first iframe source
                iframe_src = iframe_matches[0]
                if not iframe_src.startswith('http'):
                    iframe_src = f"https://ww7.vcdnlare.com{iframe_src}"
                
                print(f"\nTesting iframe source: {iframe_src}")
                try:
                    iframe_response = requests.get(iframe_src, headers=headers, timeout=10)
                    print(f"Iframe status: {iframe_response.status_code}")
                    print(f"Iframe content type: {iframe_response.headers.get('content-type', 'Unknown')}")
                    
                    if iframe_response.status_code == 200:
                        iframe_content = iframe_response.text
                        if '.m3u8' in iframe_content:
                            print("✓ Found HLS stream in iframe")
                        elif '.mp4' in iframe_content:
                            print("✓ Found MP4 stream in iframe")
                        
                        # Show first 200 chars
                        print(f"First 200 chars: {iframe_content[:200]}")
                except Exception as e:
                    print(f"Error fetching iframe: {e}")
        
        elif '.m3u8' in content:
            print("✓ Direct HLS stream found")
        elif '.mp4' in content:
            print("✓ Direct MP4 stream found")
        elif '404' in content:
            print("✗ 404 Error")
        else:
            print("? Unknown content type")
            print(f"First 200 chars: {content[:200]}")
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.text[:500])

except Exception as e:
    print(f"✗ Exception: {e}")
