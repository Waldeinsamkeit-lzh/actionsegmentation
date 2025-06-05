# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

app = FastAPI()

# 允许跨域，方便前端调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境要限制域名
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 上传视频并保存
@app.post("/upload_video")
async def upload_video(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    
    # 保存上传的视频
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 返回上传成功的视频文件路径
    return {"filename": file.filename}
