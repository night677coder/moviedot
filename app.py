from typing import List, Optional, Union

from fastapi import FastAPI, Query, Path
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import cloudscraper
from bs4 import BeautifulSoup
requests = cloudscraper.create_scraper()

class MovieListItem(BaseModel):
    title: str = Field(..., example="Example Movie Title")
    image: str = Field(..., example="https://example.com/poster.jpg")
    link: str = Field(..., example="https://example.com/movie-page")

class ListResponse(BaseModel):
    status: bool = True
    total_found: int = Field(..., example=20)
    url: str = Field(..., example="https://cf-proxy.seshu-yarra.workers.dev/")
    data: List[MovieListItem]

class ErrorResponse(BaseModel):
    status: bool = False
    msg: str = Field(..., example="No Data Found")
    error: Optional[str] = Field(None, example="Detailed error message")

class HomeErrorResponse(BaseModel):
    status: bool = False

class TorrentItem(BaseModel):
    magnet: str = Field(..., example="magnet:?xt=urn:btih:...")
    size: str = Field("", example="1.4GB")
    quality: str = Field("", example="1080p")

class OtherLinkItem(BaseModel):
    type: str = Field(..., example="Watch Online")
    url: str = Field(..., example="https://example.com/stream")

class MovieDetailResponse(BaseModel):
    status: bool = True
    url: str = Field(..., example="https://example.com/movie")
    title: str = Field(..., example="Example Movie")
    description: str = Field("", example="Plot summary...")
    image: str = Field(..., example="https://example.com/poster.jpg")
    torrent: List[TorrentItem]
    other_links: List[OtherLinkItem]

app = FastAPI(
    title="Movierulz API",
    version="1.0.0",
    description="Unofficial scraping API exposed via FastAPI. See /docs for interactive Swagger UI.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

main_url = "https://cf-proxy.seshu-yarra.workers.dev"

def scape_link(url: str) -> str:
    req = requests.get(url).content
    soup = BeautifulSoup(req, "html.parser")
    link = soup.find("a", {"class": "main-button dlbutton"})['href']
    return link

def get_page(url: str) -> list:
    req = requests.get(url).content
    soup = BeautifulSoup(req, "html.parser")
    divs = soup.find_all("div", class_="cont_display")
    data = []
    for i in range(2, len(divs)):
        title = divs[i].find("a")
        img = divs[i].find("img")
        dat = {"title": title['title'], "image": img['src'], "link": title['href']}
        data.append(dat)
    return data

def get_movie(url: str) -> dict:
    req = requests.get(url).content
    soup = BeautifulSoup(req, "html.parser")
    title = soup.find("h2", class_="entry-title").get_text(strip=True)
    title = title.replace("Full Movie Watch Online Free", "").strip()
    image = soup.find("img", class_="attachment-post-thumbnail")["src"]
    paragraphs = soup.find("div", class_="entry-content").find_all("p")
    description = ""
    for p in paragraphs:
        if not p.find("strong"):
            description = p.get_text(strip=True)
            break
    torrents = soup.find_all("a", class_="mv_button_css")
    torrent = []
    for tor in torrents:
        link = tor.get("href")
        smalls = tor.find_all("small")
        size = smalls[0].get_text(strip=True) if len(smalls) > 0 else ""
        quality = smalls[1].get_text(strip=True) if len(smalls) > 1 else ""
        torrent.append({"magnet": link, "size": size, "quality": quality})
    other_links = []
    for p in paragraphs:
        strong = p.find("strong")
        if strong and "Watch Online" in strong.get_text():
            typ = strong.get_text().split("–")[-1].strip()
            a = p.find("a")
            if a and a.get("href"):
                href = a["href"]
                
                # Clean up the URL - remove newlines and extract proper format
                href = href.replace('\r', '').replace('\n', '').strip()
                
                # Fix malformed URLs - the ID is getting mixed with the domain
                if 'streamlare' in typ.lower():
                    # Handle Streamlare URLs like "https://ww7.vcdnlare.com/v/NxcpZiXX9B70T9R?sid=7699&t=hls"
                    if 'vcdnlare.com/v/' in href:
                        # Extract the video ID part (after the last /)
                        if '/' in href:
                            parts = href.split('/')
                            video_id = parts[-1]  # Get the last part
                            href = f"https://ww7.vcdnlare.com/v/{video_id}"
                
                # Fix other streaming service URLs
                elif 'uperbox' in typ.lower():
                    if 'uperbox.io/' in href:
                        parts = href.split('/')
                        video_id = parts[-1]
                        href = f"https://www.uperbox.io/{video_id}"
                
                elif 'streamtape' in typ.lower():
                    if 'streamtape.com/v/' in href:
                        parts = href.split('/')
                        video_id = parts[-1]
                        href = f"https://streamtape.com/v/{video_id}"
                
                elif 'droplare' in typ.lower():
                    if 'droplaress.cc/' in href:
                        parts = href.split('/')
                        video_id = parts[-1]
                        href = f"https://droplaress.cc/{video_id}"
                
                elif 'streamwish' in typ.lower():
                    if 'hglink.to/' in href:
                        parts = href.split('/')
                        video_id = parts[-1]
                        href = f"https://hglink.to/{video_id}"
                
                elif 'filelions' in typ.lower():
                    if 'mivalyo.com/f/' in href:
                        parts = href.split('/')
                        video_id = parts[-1]
                        href = f"https://mivalyo.com/f/{video_id}"
                
                other_links.append({"type": typ, "url": href})

    return {
        "status": True,
        "url": url,
        "title": title,
        "description": description,
        "image": image,
        "torrent": torrent,
        "other_links": other_links
    }

@app.get(
    "/search",
    response_model=Union[ListResponse, ErrorResponse],
    tags=["Movies"],
    summary="Search movies",
    description="Searches movies by keyword and returns a list of results.",
)
async def search(
    query: str = Query(..., description="Search keyword", example="salaar"),
):
    url = main_url+f"/search_movies?s={query}"
    try:
        data = get_page(url)
        total = len(data)
        main_data = {"status": True, "total_found": total, "url": url, "data": data}
    except:
        main_data = {"status": False, "msg": "No Data Found"}
    return JSONResponse(content=main_data)

@app.get(
    "/{language}/{page}",
    response_model=Union[ListResponse, HomeErrorResponse],
    tags=["Movies"],
    summary="Browse movies by language/category",
    description="Returns a paginated list for supported languages/categories.",
)
async def get_home(
    language: str = Path(
        ...,
        description="Category/language. Supported: telugu, hindi, tamil, malayalam, english",
        example="telugu",
    ),
    page: int = Path(..., ge=1, description="Page number", example=1),
):
    if language == "telugu":
        url = main_url+f"/category/telugu-featured/page/{page}"
    elif language == "hindi":
        url = main_url+f"/category/bollywood-featured/page/{page}"
    elif language == "tamil":
        url = main_url+f"/category/tamil-featured/page/{page}"
    elif language == "malayalam":
        url = main_url+f"/category/malayalam-featured/page/{page}"
    elif language == "english":
        url = main_url+f"/category/hollywood-featured/page/{page}"
    else:
        url = None
    if url:
        data = get_page(url)
        total = len(data)
        main_data = {"status": True, "total_found": total, "url": url, "data": data}
    else:
        main_data = {"status": False}
    return JSONResponse(content=main_data)

@app.get(
    "/",
    response_model=ListResponse,
    tags=["Movies"],
    summary="Home",
    description="Returns the home page list.",
)
async def home():
    url = main_url+"/"
    data = get_page(url)
    total = len(data)
    main_data = {"status": True, "total_found": total, "url": url, "data": data}
    return JSONResponse(content=main_data)

@app.get(
    "/fetch",
    response_class=Response,
    tags=["Utility"],
    summary="Fetch raw content",
    description="Fetches raw bytes from the given URL and returns them as-is.",
)
async def fetch(
    url: str = Query(..., description="Any URL to fetch", example="https://example.com"),
):
    req = requests.get(url)
    return Response(content=req.content, media_type="application/octet-stream")

@app.get(
    "/get",
    response_model=Union[MovieDetailResponse, ErrorResponse],
    tags=["Movies"],
    summary="Get movie details",
    description="Fetches details for a specific movie page URL.",
)
async def get_s(
    url: str = Query(
        ...,
        description="Movie page URL (upstream)",
        example="https://cf-proxy.seshu-yarra.workers.dev/some-movie/",
    ),
):
    try:
        data = get_movie(url)
        return JSONResponse(content=data)
    except Exception as e:
        data = {"status": False, "msg": "Unable to get data", "error": str(e)}
        return JSONResponse(content=data)

@app.get(
    "/ss",
    response_class=Response,
    tags=["Utility"],
    summary="Fetch upstream homepage HTML",
    description="Returns the raw HTML of the upstream homepage.",
)
async def sse():
    return Response(content=requests.get(main_url).content, media_type="text/html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)

# Vercel serverless handler
from fastapi import FastAPI
from mangum import Mangum

handler = Mangum(app)
