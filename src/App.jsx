import React, { useEffect, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import PipelineConfig from "./components/PipelineConfig.jsx";
import MetricsSidebar from "./components/MetricsSidebar.jsx";
import EventLog from "./components/EventLog.jsx";
import { fetchGraph } from "./components/MermaidDiagram.jsx";
import { ChevronDown } from "lucide-react";

export default function App() {
  const [graphDefinition, setGraphDefinition] = useState("");

  const [fileName, setFileName] = useState("No file selected");

  const [logs, setLogs] = useState([]);

  const appendLog = (text) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${text}`,
    ]);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : "No file selected");
  };

  const [isGraphRunning, setIsGraphRunning] = useState(false);
  const [isGraphStyled, setIsGraphStyled] = useState(false);

  // Get logs from server
  useEffect(() => {
    appendLog("Trying to connect to the WebSocket");
    const socket = new WebSocket(`ws://127.0.0.1:1205`);
    socket.onmessage = (event) => {
      const logLine = event.data;
      appendLog(logLine);
    };

    socket.onopen = () => {
      appendLog("Connected to log stream");
    };

    socket.onerror = (err) => {
      appendLog("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleFetchGraph = () => {
    const willStart = !isGraphRunning;

    setIsGraphRunning(willStart);
    if (willStart) {
      fetchGraph({
        setGraphDefinition,
        profiling: isGraphStyled,
      });
    } else {
      setGraphDefinition("");
    }
  };

  const handleGraphStyling = () => {
    const willStyle = !isGraphStyled;

    setIsGraphStyled(willStyle);

    // If graph is already running, refetch it with the new styling state
    if (isGraphRunning) {
      fetchGraph({
        setGraphDefinition,
        profiling: willStyle,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Top Bar */}
      {/* <TopBar setGraphDefinition={setGraphDefinition} /> */}

      {/* Main Layout */}
      {/* Left Sidebar */}

      <div className="flex">
        <Sidebar />

        <div className="w-full p-4 bg-white">
          <p>Untitled Project</p>
          <div className="flex items-center space-x-4 rounded-lg w-full ">
            <div className="flex-1 text-gray-700 truncate border-gray-700 border p-2 rounded-lg">
              {fileName}
            </div>
            <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition">
              Upload
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div className="flex w-full gap-4 mt-4">
            <div className="w-full flex flex-col gap-4">
              {/* Pipeline Configuration Section */}
              <PipelineConfig
                graphDefinition={graphDefinition}
                setGraphDefinition={setGraphDefinition}
              />

              <p>Task</p>
              <div className="border border-gray-700 rounded-lg p-2 flex justify-end">
                <ChevronDown />
              </div>
              <p>Storage Location</p>
              <div className="flex justify-between gap-4">
                <span className="border border-gray-700 p-2 rounded-lg w-full">
                  C:\Users\LabUser\Documents\NeuralData\Subject05\Session01\Task\
                </span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
                  onClick={handleFetchGraph}
                >
                  {isGraphRunning ? "STOP" : "START"}
                </button>
              </div>
              <div className="flex gap-4 items-center">
                <p>Graph styling</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
                  onClick={handleGraphStyling}
                >
                  {isGraphStyled ? "OFF" : "ON"}
                </button>
              </div>
            </div>

            {/* Right Sidebar */}
            <MetricsSidebar />
          </div>

          {/* Event Log Section */}
          <EventLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
