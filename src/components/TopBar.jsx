import React, { useState } from "react";
import { fetchGraphData } from './MermaidDiagram.jsx';

export default function TopBar({setGraphDefinition}) {

  const [isGraphRunning, setIsGraphRunning] = useState(false)

   const handleFetchGraph = () => {
    setIsGraphRunning(!isGraphRunning);

    if(!isGraphRunning) {
      fetchGraphData(setGraphDefinition);
    }
    else {
      setGraphDefinition("");
    }
   }

  return (
    <div className="flex items-center justify-between border border-gray-300 rounded-md w-full bg-white p-2  my-2">
      {/* Green Status Indicator */}
      <div className="w-4 h-4 bg-green-500 rounded-full ml-4"></div>

      {/* Status Label */}
      <span className="bg-green-500 text-white px-4 py-1 rounded-md text-sm">
        Implant: Connected
      </span>

      {/* Stop Button */}
      <button 
        className="border border-black text-black px-4 py-1 rounded-md mr-4" 
        onClick={handleFetchGraph}
      >
        {isGraphRunning ? "STOP" : "START"}
      </button>
    </div>
  );
}
