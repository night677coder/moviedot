# Test the frontend video extraction directly
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'frontend', 'src'))

# Import the video extractor
exec(open('frontend/src/utils/videoExtractor.js').read())

# Test with the corrected URL
test_url = "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"

print(f"Testing URL extraction for: {test_url}")

# Since this is JavaScript, let's create a Python equivalent
import requests
import re

async def extract_streamlare_python(url):
    try:
        # Use a CORS proxy to fetch the page
        proxy_url = f"https://api.allorigins.win/get?url={url}"
        response = requests.get(proxy_url)
        data = response.json()
        html = data.contents
        
        # Look for various video source patterns
        patterns = [
            r'source\s+src=["\']([^"\']+)["\']',
            r'file:\s*["\']([^"\']+)["\']',
            r'["\']([^"\']*\.m3u8[^"\']*)["\']',
            r'["\']([^"\']*\.mp4[^"\']*)["\']',
            r'["\'](https?:\/\/[^"\']*vcdn[^"\']*)["\']',
            r'["\'](https?:\/\/[^"\']*streamlare[^"\']*)["\']'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for match in matches:
                video_url = match
                if video_url and (video_url.endswith('.m3u8') or video_url.endswith('.mp4') or 'vcdn' in video_url):
                    print(f"Found video URL: {video_url}")
                    return video_url
        
        print("No direct video URL found, returning original URL")
        return url
        
    except Exception as e:
        print(f"Error: {e}")
        return url

# Test the extraction
import asyncio
result = asyncio.run(extract_streamlare_python(test_url))
print(f"Result: {result}")
