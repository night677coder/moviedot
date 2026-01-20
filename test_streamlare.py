import requests
from bs4 import BeautifulSoup

# Get the homepage
response = requests.get('https://cf-proxy.seshu-yarra.workers.dev')
soup = BeautifulSoup(response.content, 'html.parser')

# Find movie links in the display area
divs = soup.find_all('div', class_='cont_display')
print(f'Found {len(divs)} display divs')

for i in range(2, min(5, len(divs))):  # Check first few movies
    title = divs[i].find('a')
    if title and title.get('href'):
        print(f'Movie {i}: {title.get("title")} - {title.get("href")}')
        
        # Get the movie page
        try:
            movie_response = requests.get(title['href'])
            movie_soup = BeautifulSoup(movie_response.content, 'html.parser')
            
            # Look for streamlare links in paragraphs
            paragraphs = movie_soup.find_all('p')
            for p in paragraphs:
                strong = p.find('strong')
                if strong and 'watch online' in strong.get_text().lower():
                    links = p.find_all('a', href=True)
                    for link in links:
                        href = link['href']
                        if 'streamlare' in href.lower() or 'vcdn' in href.lower():
                            print(f'  Streamlare link: {href}')
                            print(f'  Link text: {link.get_text()}')
                            
                            # Try to fetch this URL to see what it returns
                            try:
                                stream_response = requests.get(href, allow_redirects=True)
                                print(f'  Final URL: {stream_response.url}')
                                print(f'  Status: {stream_response.status_code}')
                                if stream_response.status_code == 200:
                                    content = stream_response.text[:500]
                                    if 'iframe' in content.lower():
                                        print('  Contains iframe')
                                    if 'm3u8' in content.lower():
                                        print('  Contains m3u8')
                                    if 'mp4' in content.lower():
                                        print('  Contains mp4')
                            except Exception as e:
                                print(f'  Error fetching: {e}')
                            break
        except Exception as e:
            print(f'  Error processing movie: {e}')
        print()
        break  # Just check first movie
