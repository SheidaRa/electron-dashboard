import React from "react";

export default function Sidebar() {
  const signals = ["Signal 1", "Signal 2", "Signal 3", "Signal 4"];
  const pipelines = ["Pipeline A", "Pipeline B"];

  return (
    <div className="w-1/5 bg-white p-4 shadow-md">
      <h3 className="text-lg font-semibold">Signal Source</h3>
      <ul className="space-y-2 mt-2">
        {signals.map((signal, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input type="radio" name="signal" className="form-radio" />
            <span>{signal}</span>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mt-6">Active Pipelines</h3>
      <ul className="space-y-2 mt-2">
        {pipelines.map((pipeline, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input type="radio" name="pipeline" className="form-radio" />
            <span>{pipeline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
