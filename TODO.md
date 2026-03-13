# TODO: Fix Vercel White Screen Deploy

## 1. ✅ Update requirements.txt (Vercel-compatible deps)

## 2. ✅ Update api/index.py
- Remove cloudscraper try/except, use requests only
- BS4 parser='html.parser' (already good)

## 3. Test locally
- uvicorn api.index:app --reload
- cd frontend && npm run preview
- curl localhost:8000/health

## 4. Commit & Deploy
- git add .
- git commit -m "Fix Vercel deploy: deps + scraper"
- git push

## 5. Verify
- https://movierulz-silk.vercel.app/
- /api/health
