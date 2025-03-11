import React, { useEffect } from "react";
import TopBar from "./TopBar.jsx";
import Sidebar from "./Sidebar.jsx";
import PipelineConfig from "./PipelineConfig.jsx";
import MetricsSidebar from "./MetricsSidebar.jsx";
import EventLog from "./EventLog.jsx";

export default function App() {
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
