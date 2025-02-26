import React, { useEffect } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import PipelineConfig from "./components/PipelineConfig";
import MetricsSidebar from "./components/MetricsSidebar";
import EventLog from "./components/EventLog";

export default function App() {
  useEffect(() => {
    // Initialize Mermaid.js
    window.mermaid.initialize({ startOnLoad: true });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Top Bar */}
      <TopBar />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Pipeline Configuration Section */}
        <PipelineConfig />

        {/* Right Sidebar */}
        <MetricsSidebar />
      </div>

      {/* Event Log Section */}
      <EventLog />
    </div>
  );
}
