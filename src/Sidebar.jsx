import React, { useState, useEffect } from "react";

export default function Sidebar() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    fetch('http://localhost:1205/signals')
      .then(response => response.json())
      .then(data => {
        console.log('Data:', data);
        setSignals(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const pipelines = ["Pipeline A", "Pipeline B", "Pipeline C", "Pipeline D"];

  return (
    <div className="w-64 bg-white p-4 shadow-lg rounded-lg border">
      {/* Signal Source */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold">Signal Source</h3>
        <ul className="space-y-2 mt-2">
          {signals.map((signal, index) => (
            <li key={index} className="flex justify-between items-center py-1">
              <input type="radio" name="signal" className="form-radio text-gray-600" />
              <span className="flex-grow ml-2 text-gray-700 bg-gray-100 rounded-md px-2 py-1 text-sm">
                {signal.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Active Pipelines */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Active Pipelines</h3>
        <ul className="space-y-2 mt-2">
          {pipelines.map((pipeline, index) => (
            <li key={index} className="flex items-center space-x-2">
              <input type="radio" name="pipeline" className="form-radio text-gray-600" />
              <span className="flex-grow ml-2 text-gray-700 bg-gray-100 rounded-md px-2 py-1 text-sm">
                {pipeline}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
