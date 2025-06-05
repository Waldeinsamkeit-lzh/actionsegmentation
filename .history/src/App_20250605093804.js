// // import logo from './logo.svg';
// // import './App.css';

// // function App() {
// //   return (
// //     <div className="App">
// //       <header className="App-header">
// //         <img src={logo} className="App-logo" alt="logo" />
// //         <p>
// //           Edit <code>src/App.js</code> and save to reload.
// //         </p>
// //         <a
// //           className="App-link"
// //           href="https://reactjs.org"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           Learn React
// //         </a>
// //       </header>
// //     </div>
// //   );
// // }

// // export default App;
// import React, { useRef, useState } from "react";

// // 模拟动作数据
// const actions = [
//   { id: 1, category: "背景", start: 0.09, end: 0.53, duration: 0.44, status: "正常动作" },
//   { id: 2, category: "移动-搬运", start: 0.53, end: 3.2, duration: 2.67, status: "正常动作" },
//   { id: 3, category: "深踩-输入轴", start: 3.2, end: 6.67, duration: 3.47, status: "正常动作" },
//   { id: 4, category: "深踩-输出轴", start: 6.67, end: 11.67, duration: 5, status: "正常动作" },
//   { id: 5, category: "放置-螺栓", start: 11.67, end: 15.2, duration: 3.53, status: "错误动作" },
//   { id: 6, category: "放置-螺栓", start: 15.2, end: 24.13, duration: 8.93, status: "正常动作" },
//   { id: 7, category: "启动-电动螺丝刀", start: 24.13, end: 26.33, duration: 2.2, status: "正常动作" },
//   { id: 8, category: "固定-螺栓", start: 26.33, end: 39.26, duration: 12.87, status: "正常动作" },
//   { id: 9, category: "放置-电动螺丝刀", start: 39.26, end: 40.73, duration: 1.47, status: "正常动作" },
//   { id: 10, category: "深踩-油盖", start: 40.67, end: 43.67, duration: 3, status: "正常动作" },
//   { id: 11, category: "负重", start: 43.67, end: 44.27, duration: 0.6, status: "正常动作" },
// ];

// // 计算总时长
// const totalDuration = Math.max(...actions.map((a) => a.end));

// // 获取所有类别
// const categories = [...new Set(actions.map((a) => a.category))];

// // 视频播放器组件
// function VideoPlayer() {
//   const videoRef = useRef(null);
//   return (
//     <video
//       ref={videoRef}
//       controls
//       style={{ width: "100%", height: "400px", backgroundColor: "#000" }}
//       // src="https://www.w3schools.com/html/mov_bbb.mp4"
//       src="/videos/S1_Cheese_C1.mp4"
//     >
//       你的浏览器不支持视频播放
//     </video>
//   );
// }

// // 动作表格组件
// function ActionTable({ data }) {
//   return (
//     <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
//       <thead style={{ backgroundColor: "#f0f0f0" }}>
//         <tr>
//           <th style={{ border: "1px solid #ddd", padding: 6 }}>编号</th>
//           <th style={{ border: "1px solid #ddd", padding: 6 }}>识别类别</th>
//           <th style={{ border: "1px solid #ddd", padding: 6 }}>动作评价</th>
//           <th style={{ border: "1px solid #ddd", padding: 6 }}>开始时间</th>
//           <th style={{ border: "1px solid #ddd", padding: 6 }}>结束时间</th>
//           <th style={{ border: "1px solid #ddd", padding: 6 }}>作业时间</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((item) => (
//           <tr
//             key={item.id}
//             style={{
//               color: item.status === "正常动作" ? "green" : "red",
//               border: "1px solid #ddd",
//               textAlign: "center",
//             }}
//           >
//             <td style={{ padding: 6 }}>{item.id}</td>
//             <td style={{ padding: 6 }}>{item.category}</td>
//             <td style={{ padding: 6 }}>{item.status}</td>
//             <td style={{ padding: 6 }}>{item.start.toFixed(2)}秒</td>
//             <td style={{ padding: 6 }}>{item.end.toFixed(2)}秒</td>
//             <td style={{ padding: 6 }}>{item.duration.toFixed(2)}秒</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// // 时间轴组件
// function Timeline({ data }) {
//   return (
//     <div
//       style={{
//         position: "relative",
//         height: 30,
//         border: "1px solid #ccc",
//         marginTop: 10,
//         backgroundColor: "#e6f2ff",
//       }}
//     >
//       {data.map((item) => {
//         const left = (item.start / totalDuration) * 100;
//         const width = ((item.end - item.start) / totalDuration) * 100;
//         return (
//           <div
//             key={item.id}
//             title={`${item.category} ${item.start.toFixed(2)}s - ${item.end.toFixed(2)}s`}
//             style={{
//               position: "absolute",
//               left: `${left}%`,
//               width: `${width}%`,
//               height: "100%",
//               backgroundColor: "#4a90e2",
//               borderRight: "1px solid #fff",
//               boxSizing: "border-box",
//             }}
//           />
//         );
//       })}
//     </div>
//   );
// }

// // 柱状图组件
// function BarChart({ data }) {
//   // 统计各类别总时长（实际动作）
//   const categoryDuration = {};
//   categories.forEach((cat) => {
//     categoryDuration[cat] = 0;
//   });
//   data.forEach((item) => {
//     categoryDuration[item.category] += item.duration;
//   });

//   // 假设规范动作时间是实际动作时间的90%
//   const maxDuration = Math.max(...Object.values(categoryDuration));
//   return (
//     <div style={{ display: "flex", height: 150, alignItems: "flex-end", marginTop: 10, gap: 8 }}>
//       {categories.map((cat) => {
//         const actualHeight = (categoryDuration[cat] / maxDuration) * 120;
//         const normHeight = actualHeight * 0.9;
//         return (
//           <div key={cat} style={{ flex: 1, textAlign: "center", fontSize: 12 }}>
//             <div style={{ position: "relative", height: 130 }}>
//               <div
//                 style={{
//                   position: "absolute",
//                   bottom: 0,
//                   width: "40%",
//                   height: actualHeight,
//                   backgroundColor: "#3b82f6",
//                   margin: "0 auto",
//                   left: "30%",
//                   borderRadius: 3,
//                 }}
//                 title={`实际动作: ${categoryDuration[cat].toFixed(2)}秒`}
//               />
//               <div
//                 style={{
//                   position: "absolute",
//                   bottom: 0,
//                   width: "40%",
//                   height: normHeight,
//                   backgroundColor: "#22c55e",
//                   margin: "0 auto",
//                   left: "70%",
//                   borderRadius: 3,
//                 }}
//                 title={`规范动作: ${(categoryDuration[cat] * 0.9).toFixed(2)}秒`}
//               />
//             </div>
//             <div style={{ marginTop: 4, whiteSpace: "nowrap" }}>{cat}</div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // 主组件
// export default function AssemblyActionSystem() {
//   return (
//     <div style={{ padding: 20, fontFamily: "微软雅黑, Arial, sans-serif" }}>
//       <h2 style={{ textAlign: "center", marginBottom: 20 }}>装配动作识别与作业规范性判别系统</h2>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 1fr",
//           gridTemplateRows: "auto auto",
//           gap: 20,
//         }}
//       >
//         {/* 左上 视频 */}
//         <div style={{ gridColumn: "1 / 2" }}>
//           <VideoPlayer />
//         </div>

//         {/* 右上 表格 */}
//         <div style={{ gridColumn: "2 / 3" }}>
//           <ActionTable data={actions} />
//         </div>

//         {/* 左下 时间轴 */}
//         <div style={{ gridColumn: "1 / 2" }}>
//           <Timeline data={actions} />
//         </div>

//         {/* 右下 柱状图 */}
//         <div style={{ gridColumn: "2 / 3" }}>
//           <BarChart data={actions} />
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/VideoUploader.js

import React, { useState } from "react";
import axios from "axios";

function VideoUploader() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  // const [npyFile, setNpyFile] = useState("");

  // 处理视频文件选择
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // 上传视频并获取响应
  const handleUpload = async () => {
    if (!videoFile) return alert("请选择视频文件！");

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      setUploadStatus("上传中...");
      // 发起 POST 请求到后端上传视频
      const res = await axios.post("http://localhost:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // 这行非常重要
        },
      });

      // 上传成功，保存返回的npy文件路径
      setUploadStatus("上传成功！");
      console.log("推理结果：", res.data.predictions);
      // setNpyFile(res.data.npy_file);
    } catch (err) {
      // console.error(err);
      console.error("上传失败，后端响应：", err.response?.data || err.message);

      setUploadStatus("上传失败！");
    }
  };

  return (
    <div>
      <h2>上传视频文件</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>上传</button>
      <p>{uploadStatus}</p>


    </div>
  );
}

export default VideoUploader;
