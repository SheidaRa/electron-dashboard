import React from "react";
import { ChevronRight, GripVertical } from "lucide-react"; 

export default function MetricsSidebar() {
  return (
    <div className="w-64 bg-white p-4 shadow-lg rounded-lg border">
      {/* Signal Quality Graph */}
      <h3 className="text-lg font-semibold">Signal Quality Graph</h3>
      <div className="bg-gray-200 w-full h-40 flex justify-center items-center rounded-md">
        <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
      </div>

      {/* Processing Status */}
      <h3 className="text-lg font-semibold mt-6">Processing Status</h3>
      <ul className="mt-2 space-y-3">
        {["Status 1", "Status 2", "Status 3", "Status 4"].map((status, index) => (
          <li key={index} className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-md">
            <GripVertical className="text-gray-500 w-4 h-4" /> {/*  Handle */}
            <span className="flex-grow ml-2 bg-gray-200 h-4 w-24 rounded-md"></span> {/* Placeholder Text */}
            <ChevronRight className="text-gray-500 w-4 h-4" /> {/*  Arrow */}
          </li>
        ))}
      </ul>

      {/* Task Performance */}
      <h3 className="text-lg font-semibold mt-6">Task Performance Metrics</h3>
      <ul className="mt-2 space-y-3">
        {["Metric 1", "Metric 2", "Metric 3", "Metric 4"].map((metric, index) => (
          <li key={index} className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-md">
            <GripVertical className="text-gray-500 w-4 h-4" /> {/* Handle */}
            <span className="flex-grow ml-2 bg-gray-200 h-4 w-24 rounded-md"></span> {/* Placeholder Text */}
            <ChevronRight className="text-gray-500 w-4 h-4" /> {/* Arrow */}
          </li>
        ))}
      </ul>
    </div>
  );
}
