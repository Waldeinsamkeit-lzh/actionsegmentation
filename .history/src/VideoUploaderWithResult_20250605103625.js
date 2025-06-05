import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// 颜色生成函数（黄金角 HSL）
const getColor = (label) => {
  const hue = (parseInt(label, 10) * 137) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

// 压缩帧预测为区段
function compressPredictions(predictions, labelPredictions) {
  const segments = [];
  let start = 0;
  for (let i = 1; i < predictions.length; i++) {
    if (predictions[i] !== predictions[i - 1]) {
      segments.push({
        label: predictions[i - 1],
        labelText: labelPredictions[i - 1],
        start,
        end: i - 1,
      });
      start = i;
    }
  }
  segments.push({
    label: predictions[predictions.length - 1],
    labelText: labelPredictions[predictions.length - 1],
    start,
    end: predictions.length - 1,
  });
  return segments;
}

export default function VideoUploaderWithResult() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [labelPredictions, setLabelPredictions] = useState([]);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

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
      setLabelPredictions(res.data.label_predictions || []);
    } catch (err) {
      console.error("上传失败：", err.response?.data || err.message);
      setUploadStatus("上传失败！");
    }
  };

  const segments =
    predictions.length && labelPredictions.length
      ? compressPredictions(predictions, labelPredictions)
      : [];
  const totalFrames = predictions.length;

  // ✅ 构建 label -> labelText 映射
  const labelMap = segments.reduce((acc, seg) => {
    acc[seg.label] = seg.labelText;
    return acc;
  }, {});
  const uniqueLabels = Object.entries(labelMap);

  const categoryFrameCounts = {};
  segments.forEach((seg) => {
    categoryFrameCounts[seg.label] =
      (categoryFrameCounts[seg.label] || 0) + (seg.end - seg.start + 1);
  });

  useEffect(() => {
    if (segments.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const labels = Object.keys(categoryFrameCounts);
      const frameCounts = Object.values(categoryFrameCounts);
      const maxFrames = Math.max(...frameCounts);
      const barWidth = canvas.width / labels.length / 1.5;
      const chartHeight = 150;

      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, chartHeight);

      labels.forEach((label, index) => {
        const height = (frameCounts[index] / maxFrames) * (chartHeight - 50);
        const x = index * (canvas.width / labels.length);
        const labelText = labelMap[label] || `类 ${label}`;

        // 柱子
        ctx.fillStyle = getColor(label);
        ctx.fillRect(x, chartHeight - height - 25, barWidth, height);

        // 数值
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          frameCounts[index],
          x + barWidth / 2,
          chartHeight - height - 30
        );

        // 类别名称（真实）在柱子底部
        ctx.fillText(
          labelText,
          x + barWidth / 2,
          chartHeight - 5
        );
      });
    }
  }, [segments]);

  return (
    <div style={{ padding: 20, fontFamily: "微软雅黑" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        装配动作识别与作业规范性判别系统
      </h2>

      {/* 上传区域 */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          style={{
            marginLeft: 10,
            padding: "6px 12px",
            borderRadius: 4,
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          上传
        </button>
        <span style={{ marginLeft: 10 }}>{uploadStatus}</span>
      </div>

      {videoUrl && (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* 左侧：视频 + 时间轴 + 图例 + 柱状图 */}
          <div style={{ flex: 1, maxWidth: "50%", border: "1px solid #ddd", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <video
              controls
              width="100%"
              style={{ maxHeight: 400, background: "#000", borderRadius: "6px 6px 0 0" }}
            >
              <source src={videoUrl} type="video/mp4" />
              你的浏览器不支持视频播放
            </video>

            {segments.length > 0 && (
              <>
                {/* 时间轴 */}
                <div
                  style={{
                    position: "relative",
                    height: 60,
                    backgroundColor: "#eee",
                    margin: "10px",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                >
                  {segments.map((seg, idx) => {
                    const width = ((seg.end - seg.start + 1) / totalFrames) * 100;
                    return (
                      <div
                        key={idx}
                        title={`${seg.labelText}：${seg.start}~${seg.end}`}
                        style={{
                          position: "absolute",
                          left: `${(seg.start / totalFrames) * 100}%`,
                          width: `${width}%`,
                          height: "100%",
                          backgroundColor: getColor(seg.label),
                          borderRight: "1px solid #fff",
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </div>

                {/* 图例 */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    margin: "10px",
                    gap: 16,
                    padding: "20px 20px",
                    background: "#f9fafb",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                  }}
                >
                  {uniqueLabels.map(([label, labelText]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: getColor(label),
                          borderRadius: 2,
                          border: "1px solid #999",
                        }}
                      />
                      <span style={{ fontSize: 13 }}>{`${labelText}`}</span>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", fontSize: 13, fontWeight: "bold" }}>
                    总类别数：{uniqueLabels.length}
                  </div>
                </div>

                {/* 柱状图 */}
                <div style={{ margin: "10px", border: "1px solid #ddd", borderRadius: 6 }}>
                  <canvas ref={canvasRef} width={400} height={150} style={{ width: "100%", height: "auto" }} />
                </div>
              </>
            )}
          </div>

          {/* 右侧：表格 */}
          {segments.length > 0 && (
            <div style={{ flex: 1, maxWidth: "50%", border: "1px solid #ddd", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead style={{ background: "#f0f0f0" }}>
                  <tr>
                    <th style={{ padding: "8px" }}>段编号</th>
                    <th style={{ padding: "8px" }}>类别</th>
                    <th style={{ padding: "8px" }}>起始帧</th>
                    <th style={{ padding: "8px" }}>结束帧</th>
                    <th style={{ padding: "8px" }}>持续帧数</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((seg, idx) => (
                    <tr
                      key={idx}
                      style={{
                        textAlign: "center",
                        borderBottom: "1px solid #ccc",
                        height: 36,
                        backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px" }}>{idx + 1}</td>
                      <td style={{ padding: "8px" }}>{seg.labelText}</td>
                      <td style={{ padding: "8px" }}>{seg.start}</td>
                      <td style={{ padding: "8px" }}>{seg.end}</td>
                      <td style={{ padding: "8px" }}>{seg.end - seg.start + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
