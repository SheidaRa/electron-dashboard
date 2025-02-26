import React from "react";

export default function MetricsSidebar() {
  return (
    <div className="w-1/4 bg-white p-4 shadow-md">
      <h3 className="text-lg font-semibold">Signal Quality Graph</h3>
      <div className="bg-gray-200 w-full h-40 flex justify-center items-center rounded">
        <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Processing Status</h3>
      <ul className="mt-2 space-y-2">
        <li className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Status 1</span>
        </li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Task Performance Metrics</h3>
      <ul className="mt-2 space-y-2">
        <li className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Metric 1</span>
        </li>
      </ul>
    </div>
  );
}
