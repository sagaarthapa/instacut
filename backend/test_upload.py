from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Simple Upload Test")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Simple upload test server"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    logger.info(f"Received file upload: {file.filename}")
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    content = await file.read()
    logger.info(f"File size: {len(content)} bytes")
    
    return {
        "status": "success",
        "filename": file.filename,
        "size": len(content),
        "content_type": file.content_type
    }

if __name__ == "__main__":
    uvicorn.run("test_upload:app", host="0.0.0.0", port=8000, reload=True)