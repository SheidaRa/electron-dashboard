import React, { useEffect, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import PipelineConfig from "./components/PipelineConfig.jsx";
import MetricsSidebar from "./components/MetricsSidebar.jsx";
import EventLog from "./components/EventLog.jsx";

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
