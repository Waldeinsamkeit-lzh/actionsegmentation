import React, { useState } from "react";
import axios from "axios";

// 颜色生成函数（黄金角 HSL）
const getColor = (label) => {
  const hue = (parseInt(label, 10) * 137) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

// 将帧标签压缩为区段 segments
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

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>装配动作识别与作业规范性判别系统</h2>

      {/* 上传区域 */}
      <div style={styles.uploadContainer}>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileChange} 
          style={styles.fileInput}
        />
        <button onClick={handleUpload} style={styles.uploadButton}>
          上传视频
        </button>
        <span style={styles.statusText}>{uploadStatus}</span>
      </div>

      {videoUrl && (
        <div style={styles.contentWrapper}>
          {/* 左侧：视频 + 时间轴 + 图例 */}
          <div style={styles.videoSection}>
            <div style={styles.videoContainer}>
              <video 
                controls 
                width="100%" 
                style={styles.videoPlayer}
              >
                <source src={videoUrl} type="video/mp4" />
                你的浏览器不支持视频播放
              </video>
            </div>

            {segments.length > 0 && (
              <div style={styles.timelineContainer}>
                {/* 时间轴 */}
                <div style={styles.timeline}>
                  {segments.map((seg, idx) => {
                    const width = ((seg.end - seg.start + 1) / totalFrames) * 100;
                    return (
                      <div
                        key={idx}
                        title={`${seg.labelText}：${seg.start}~${seg.end}`}
                        style={{
                          ...styles.timelineSegment,
                          left: `${(seg.start / totalFrames) * 100}%`,
                          width: `${width}%`,
                          backgroundColor: getColor(seg.label),
                        }}
                      />
                    );
                  })}
                </div>

                {/* 图例 */}
                <div style={styles.legend}>
                  {[...new Map(segments.map(s => [s.label, s.labelText])).entries()].map(
                    ([label, labelText]) => (
                      <div key={label} style={styles.legendItem}>
                        <div
                          style={{
                            ...styles.legendColor,
                            backgroundColor: getColor(label),
                          }}
                        />
                        <span style={styles.legendText}>{`类 ${label}：${labelText}`}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：表格 */}
          {segments.length > 0 && (
            <div style={styles.tableSection}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>段编号</th>
                      <th style={styles.tableHeader}>类别</th>
                      <th style={styles.tableHeader}>起始帧</th>
                      <th style={styles.tableHeader}>结束帧</th>
                      <th style={styles.tableHeader}>持续帧数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((seg, idx) => (
                      <tr 
                        key={idx} 
                        style={{
                          ...styles.tableRow,
                          backgroundColor: idx % 2 === 0 ? '#f8f9fa' : '#ffffff'
                        }}
                      >
                        <td style={styles.tableCell}>{idx + 1}</td>
                        <td style={styles.tableCell}>{seg.labelText}</td>
                        <td style={styles.tableCell}>{seg.start}</td>
                        <td style={styles.tableCell}>{seg.end}</td>
                        <td style={styles.tableCell}>{seg.end - seg.start + 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 样式对象
const styles = {
  container: {
    padding: '24px',
    fontFamily: '"微软雅黑", "PingFang SC", sans-serif',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  uploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  fileInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ced4da',