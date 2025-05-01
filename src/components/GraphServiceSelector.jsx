import React from "react";

export default function GraphServiceSelector({
  availableGraphs,
  selectedGraph,
  onChange,
  handleFetchGraphServices,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select Graph Service
      </label>
      <div className="flex gap-4">
        <select
          value={selectedGraph}
          onChange={(e) => onChange(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/6"
        >
          <option value="" disabled>
            Select a port
          </option>
          {availableGraphs.map((port) => (
            <option key={port} value={port}>
              Port {port}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          onClick={handleFetchGraphServices}
        >
          Scan
        </button>
      </div>
    </div>
  );
}
