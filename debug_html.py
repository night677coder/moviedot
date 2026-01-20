import requests
from bs4 import BeautifulSoup

# Get the movie page directly
movie_url = "https://www.5movierulz.voyage/bhartha-mahasayulaku-wignyapthi-2026-telugu/movie-watch-online-free-6250.html"

response = requests.get(movie_url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find paragraphs with "Watch Online"
paragraphs = soup.find_all('p')

for i, p in enumerate(paragraphs):
    strong = p.find('strong')
    if strong and 'watch online' in strong.get_text().lower():
        print(f"Paragraph {i}:")
        print(f"Strong text: {strong.get_text()}")
        
        links = p.find_all('a', href=True)
        for j, link in enumerate(links):
            href = link.get('href')
            text = link.get_text()
            print(f"  Link {j+1}: {text}")
            print(f"  Href: {href}")
            print(f"  Href repr: {repr(href)}")
            print()
        
        print("--- End of paragraph ---")
        print()
