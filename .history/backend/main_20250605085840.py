import os
import numpy as np
import torch
import gzip
import pickle
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from segment.src.models.blocks import FACT
from segment.src.configs.utils import setup_cfg
from segment.src.utils.dataset import create_dataset

# 创建 FastAPI 实例
app = FastAPI()

# 推理单个视频的函数
def infer_single_video(net, npy_path, device='cuda'):
    """
    net: 事先加载好权重的模型
    npy_path: 视频特征npy文件路径，假设是 [T, D] 形状
    device: 'cuda' 或 'cpu'
    """
    # 加载特征
    feats = np.load(npy_path)  # 假设shape是 (T, D)
    feats = feats.T  # 转置，以确保符合模型输入的格式
    # 预处理，转换为tensor，shape调整符合模型输入
    input_tensor = torch.tensor(feats, dtype=torch.float32).to(device)
    input_tensor = input_tensor.unsqueeze(0)  # 增加batch维度，变成 [1, T, D]
    seq_list = [input_tensor.squeeze(0)]  # 变成 list([T, D])
    
    net.eval()
    with torch.no_grad():
        dummy_label = [torch.zeros(seq_list[0].shape[0], dtype=torch.long).to(device)]
        video_saves = net(seq_list, dummy_label)
    
    return video_saves

# 定义上传视频的接口
@app.post("/upload")
async def upload_video(video: UploadFile = File(...)):
    # 获取上传的视频文件
    video_filename = video.filename
    video_file_path = os.path.join('uploads', video_filename)

    # 保存上传的视频文件
    with open(video_file_path, "wb") as f:
        f.write(await video.read())

    # 获取视频文件名并生成相应的 .npy 文件名
    npy_filename = os.path.splitext(video_filename)[0] + '.npy'

    # 设置查找 .npy 文件的目录路径
    npy_file_path = os.path.join(r'C:\Users\Administrator\actionsegmentation\savedirgpu21withspace33', npy_filename)

    # 检查文件是否存在
    if not os.path.exists(npy_file_path):
        return JSONResponse(content={"error": f"Numpy file {npy_filename} not found in specified directory."}, status_code=404)

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
        
        # 提取推理结果中的 "pred" 字段，返回每一帧的类别
        pred = results[0]["pred"].tolist()
        return {"predictions": pred}  # 返回结果给前端
    
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# 启动 FastAPI 应用
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
