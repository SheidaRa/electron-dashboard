import React from "react";

export default function GraphServiceSelector({
  availableGraphs,
  selectedGraph,
  onChange,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select Graph Service
      </label>
      <select
        value={selectedGraph}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full"
      >
        <option value="">Select a port</option>
        {availableGraphs.map((port) => (
          <option key={port} value={port}>
            Port {port}
          </option>
        ))}
      </select>
    </div>
  );
}
