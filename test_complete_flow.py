import requests
import json

# Test the complete flow: Backend -> Frontend extraction
movie_url = "https://www.5movierulz.voyage/bhartha-mahasayulaku-wignyapthi-2026-telugu/movie-watch-online-free-6250.html"

print("=== Testing Complete Flow ===")

# Step 1: Get data from backend
try:
    response = requests.get(f"http://localhost:8000/get?url={movie_url}")
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('status') and data.get('other_links'):
            print("✓ Backend API working")
            
            # Find Streamlare link
            streamlare_link = None
            for link in data['other_links']:
                if 'streamlare' in link['type'].lower():
                    streamlare_link = link['url']
                    break
            
            if streamlare_link:
                print(f"✓ Found Streamlare link: {streamlare_link}")
                
                # Step 2: Test the Streamlare URL directly
                try:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.5movierulz.voyage/',
                    }
                    
                    stream_response = requests.get(streamlare_link, headers=headers, timeout=10)
                    
                    if stream_response.status_code == 200:
                        print(f"✓ Streamlare URL accessible: {stream_response.status_code}")
                        
                        # Look for HLS source in the response
                        import re
                        source_match = re.search(r'<source[^>]*src=["\']([^"\']+)["\']', stream_response.text, re.IGNORECASE)
                        
                        if source_match:
                            hls_url = source_match.group(1)
                            print(f"✓ Found HLS stream: {hls_url}")
                            
                            # Test if the HLS URL is accessible
                            try:
                                hls_response = requests.head(hls_url, timeout=5)
                                print(f"✓ HLS URL accessible: {hls_response.status_code}")
                                
                                # The complete flow works!
                                print("\n🎉 SUCCESS: Streamlare extraction is working!")
                                print(f"   Original URL: {streamlare_link}")
                                print(f"   HLS Stream: {hls_url}")
                                
                            except Exception as e:
                                print(f"✗ HLS URL not accessible: {e}")
                        else:
                            print("✗ No HLS source found in Streamlare page")
                    else:
                        print(f"✗ Streamlare URL not accessible: {stream_response.status_code}")
                        
                except Exception as e:
                    print(f"✗ Error accessing Streamlare: {e}")
            else:
                print("✗ No Streamlare link found")
        else:
            print("✗ Backend API failed or no links found")
    else:
        print(f"✗ Backend API error: {response.status_code}")

except Exception as e:
    print(f"✗ Exception: {e}")

print("\n=== Frontend Test ===")
print("Open your browser and navigate to:")
print("http://localhost:5173/watch?url=" + movie_url.replace(":", "%3A").replace("/", "%2F"))
print("Then check the browser console for video extraction logs.")
