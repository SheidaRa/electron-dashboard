import React, { useEffect, useState } from "react";
import TopBar from "./TopBar.jsx";
import Sidebar from "./Sidebar.jsx";
import PipelineConfig from "./PipelineConfig.jsx";
import MetricsSidebar from "./MetricsSidebar.jsx";
import EventLog from "./EventLog.jsx";

export default function App() {

  const [graphDefinition, setGraphDefinition] = useState("")

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Top Bar */}
      <TopBar setGraphDefinition={setGraphDefinition}/>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Pipeline Configuration Section */}
        <PipelineConfig graphDefinition={graphDefinition} setGraphDefinition={setGraphDefinition} />

        {/* Right Sidebar */}
        <MetricsSidebar />
      </div>

      {/* Event Log Section */}
      <EventLog />
    </div>
  );
}
