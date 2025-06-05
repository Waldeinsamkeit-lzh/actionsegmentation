from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np
import torch
import gzip
import pickle
from src.models.blocks import FACT
from src.configs.utils import setup_cfg
from src.utils.dataset import create_dataset

app = FastAPI()

# CORS 设置
origins = [
    "http://localhost:3000",  # React 开发服务器
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许的域
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有的 HTTP 方法
    allow_headers=["*"],  # 允许所有的请求头
)

# 推理单个视频的函数
def infer_single_video(net, npy_path, device='cuda'):
    feats = np.load(npy_path)  # 假设shape是 (T, D)
    feats = feats.T  # 转置，以确保符合模型输入的格式
    input_tensor = torch.tensor(feats, dtype=torch.float32).to(device)
    input_tensor = input_tensor.unsqueeze(0)  # 增加batch维度，变成 [1, T, D]
    seq_list = [input_tensor.squeeze(0)]  # 变成 list([T, D])
    
    net.eval()
    with torch.no_grad():
        dummy_label = [torch.zeros(seq_list[0].shape[0], dtype=torch.long).to(device)]
        video_saves = net(seq_list, dummy_label)
    
    return video_saves

@app.post("/upload")
async def upload_video(video: bytes):
    # 假设前端传来的是文件内容而非路径
    video_filename = "video_upload.mp4"  # 你可以从请求中获取文件名
    npy_filename = os.path.splitext(video_filename)[0] + '.npy'
    video_file_path = os.path.join('uploads', video_filename)
    npy_file_path = os.path.join('uploads', npy_filename)

    # 保存上传的视频文件
    with open(video_file_path, "wb") as f:
        f.write(video)

    # 检查 .npy 文件是否存在
    if not os.path.exists(npy_file_path):
        return {"error": "Numpy file not found"}, 404

    # 加载模型配置和权重
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    cfg = setup_cfg([r'E:\vscodesave\CVPR2024-FACT-main\src\configs\gtea.yaml'])
    _, test_dataset = create_dataset(cfg)
    net = FACT(cfg, test_dataset.input_dimension, test_dataset.nclasses)
    net.to(device)

    # 加载模型权重
    with gzip.open(r'E:\vscodesave\CVPR2024-FACT-main\log\gtea\split1\gtea\85.8\best_ckpt.gz', 'rb') as f:
        best_ckpt = pickle.load(f)
    iteration = best_ckpt.iteration
    model_file = rf'E:\vscodesave\CVPR2024-FACT-main\log\gtea\split1\gtea\85.8\ckpts\network.iter-{iteration}.net'
    ckpt = torch.load(model_file, map_location=device)
    net.load_state_dict(ckpt, strict=False)

    # 调用推理函数进行推理
    try:
        results = infer_single_video(net, npy_file_path, device=device)
        
        # 处理推理结果并返回
        pred = results[0]["pred"].tolist()  # 假设推理结果是一个字典，提取 "pred"
        return {"predictions": pred}
    
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
