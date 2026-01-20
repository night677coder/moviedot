# Test the frontend video extraction with a working Streamlare URL
import requests
import re

def test_frontend_extraction():
    # Use the correct Streamlare URL that we know works
    test_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"
    
    print(f"Testing frontend extraction for: {test_url}")
    
    try:
        # Use a CORS proxy (similar to frontend)
        proxy_url = f"https://api.allorigins.win/get?url={test_url}"
        
        response = requests.get(proxy_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            html = data.get('contents') or data.get('data', '')
            
            print(f"Got HTML content: {len(html)} chars")
            
            # Method 1: Look for video source tags (most reliable for Streamlare)
            source_match = re.search(r'<source[^>]*src=["\']([^"\']+)["\'][^>]*>', html, re.IGNORECASE)
            if source_match and source_match.group(1):
                video_url = source_match.group(1)
                print(f"✓ Found video source: {video_url}")
                
                if '.m3u8' in video_url or 'vcdnx.com' in video_url:
                    print(f"✓ This is an HLS stream!")
                    return video_url
            
            # Method 2: Look for various patterns
            patterns = [
                r'source\s+src=["\']([^"\']+)["\']',
                r'file:\s*["\']([^"\']+)["\']',
                r'["\']([^"\']*\.m3u8[^"\']*)["\']',
                r'["\']([^"\']*\.mp4[^"\']*)["\']',
                r'["\'](https?://[^"\']*vcdnx[^"\']*)["\']',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html, re.IGNORECASE)
                for match in matches:
                    if '.m3u8' in match or 'vcdnx.com' in match:
                        print(f"✓ Found HLS via pattern: {match}")
                        return match
            
            print("✗ No HLS stream found in the page")
            
            # Show first 500 chars for debugging
            print(f"First 500 chars: {html[:500]}")
            
        else:
            print(f"✗ Failed to fetch via proxy: {response.status_code}")
    
    except Exception as e:
        print(f"✗ Exception: {e}")
    
    return None

# Run the test
result = test_frontend_extraction()
if result:
    print(f"\n🎉 SUCCESS! Extracted HLS URL: {result}")
else:
    print("\n❌ Failed to extract HLS URL")
