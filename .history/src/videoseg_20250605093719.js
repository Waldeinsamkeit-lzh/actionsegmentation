import React, { useState } from "react";
import axios from "axios";

// 用于压缩预测序列为区段 [{ label, start, end }]
function compressPredictions(predictions) {
  const segments = [];
  let start = 0;
  for (let i = 1; i < predictions.length; i++) {
    if (predictions[i] !== predictions[i - 1]) {
      segments.push({ label: predictions[i - 1], start, end: i - 1 });
      start = i;
    }
  }
  segments.push({ label: predictions[predictions.length - 1], start, end: predictions.length - 1 });
  return segments;
}

// 主组件
export default function VideoUploaderWithResult() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [predictions, setPredictions] = useState([]);

  // 文件选择
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // 上传视频并处理
  const handleUpload = async () => {
    if (!videoFile) return alert("请选择视频文件！");
    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      setUploadStatus("上传中...");
      const res = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus("上传成功！");
      setVideoUrl(URL.createObjectURL(videoFile));
      setPredictions(res.data.predictions || []);
    } catch (err) {
      console.error("上传失败：", err.response?.data || err.message);
      setUploadStatus("上传失败！");
    }
  };

  const segments = compressPredictions(predictions);
  const totalFrames = predictions.length;

  return (
    <div style={{ padding: 20, fontFamily: "微软雅黑" }}>
      <h2 style={{ textAlign: "center" }}>装配动作识别与作业规范性判别系统</h2>

      {/* 上传区 */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: 10 }}>上传</button>
        <span style={{ marginLeft: 10 }}>{uploadStatus}</span>
      </div>

      {/* 视频预览 */}
      {videoUrl && (
        <video controls width="100%" style={{ maxHeight: 400, background: "#000" }}>
          <source src={videoUrl} type="video/mp4" />
          你的浏览器不支持视频播放
        </video>
      )}

      {/* 时间轴 */}
      {segments.length > 0 && (
        <div style={{ position: "relative", height: 30, backgroundColor: "#eee", marginTop: 20 }}>
          {segments.map((seg, idx) => {
            const width = ((seg.end - seg.start + 1) / totalFrames) * 100;
            return (
              <div
                key={idx}
                title={`类别 ${seg.label}：${seg.start}~${seg.end}`}
                style={{
                  position: "absolute",
                  left: `${(seg.start / totalFrames) * 100}%`,
                  width: `${width}%`,
                  height: "100%",
                  backgroundColor: ["#60a5fa", "#34d399", "#f87171", "#facc15", "#a78bfa"][seg.label % 5],
                  borderRight: "1px solid #fff",
                }}
              />
            );
          })}
        </div>
      )}

      {/* 表格展示 */}
      {segments.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20, fontSize: 14 }}>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>段编号</th>
              <th>类别</th>
              <th>起始帧</th>
              <th>结束帧</th>
              <th>持续帧数</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg, idx) => (
              <tr key={idx} style={{ textAlign: "center", borderBottom: "1px solid #ccc" }}>
                <td>{idx + 1}</td>
                <td>{seg.label}</td>
                <td>{seg.start}</td>
                <td>{seg.end}</td>
                <td>{seg.end - seg.start + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 柱状图 */}
      {segments.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h4>各动作类别总帧数</h4>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 150 }}>
            {(() => {
              const countMap = {};
              segments.forEach(seg => {
                countMap[seg.label] = (countMap[seg.label] || 0) + (seg.end - seg.start + 1);
              });
              const maxVal = Math.max(...Object.values(countMap));

              return Object.entries(countMap).map(([label, count]) => (
                <div key={label} style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      background: "#3b82f6",
                      height: `${(count / maxVal) * 100}%`,
                      borderRadius: 3,
                    }}
                    title={`类别 ${label}：${count} 帧`}
                  />
                  <div style={{ marginTop: 5 }}>类 {label}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
