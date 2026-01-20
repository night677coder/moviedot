import requests
from bs4 import BeautifulSoup

# Test the exact backend logic
movie_url = "https://www.5movierulz.voyage/bhartha-mahasayulaku-wignyapthi-2026-telugu/movie-watch-online-free-6250.html"

print("=== Debugging Backend Logic ===")

req = requests.get(movie_url).content
soup = BeautifulSoup(req, "html.parser")

paragraphs = soup.find("div", class_="entry-content").find_all("p")

other_links = []
for p in paragraphs:
    strong = p.find("strong")
    if strong and "Watch Online" in strong.get_text():
        typ = strong.get_text().split("–")[-1].strip()
        a = p.find("a")
        if a and a.get("href"):
            href = a["href"]
            
            print(f"\nProcessing: {typ}")
            print(f"Original href: {repr(href)}")
            
            # Clean up the URL - remove newlines and extract proper format
            href = href.replace('\r', '').replace('\n', '').strip()
            print(f"After cleaning: {repr(href)}")
            
            # Fix malformed URLs - the ID is getting mixed with the domain
            if 'streamlare' in typ.lower():
                # Handle Streamlare URLs like "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"
                if 'vcdnlare.com/v/' in href:
                    # Extract the video ID part (after the last /)
                    if '/' in href:
                        parts = href.split('/')
                        print(f"Split parts: {parts}")
                        video_id = parts[-1]  # Get the last part
                        href = f"https://ww7.vcdnlare.com/v/{video_id}"
                        print(f"Fixed href: {repr(href)}")
            
            other_links.append({"type": typ, "url": href})
            print(f"Final result: {other_links[-1]}")
            
            # Test if this URL works
            try:
                test_response = requests.head(href, timeout=5)
                print(f"URL test: {test_response.status_code}")
            except Exception as e:
                print(f"URL test failed: {e}")
            
            print("---")
            break  # Just test first one
