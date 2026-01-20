from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello World"}

@app.get("/api")
def api():
    return {"status": True, "message": "API is working"}

handler = Mangum(app)
