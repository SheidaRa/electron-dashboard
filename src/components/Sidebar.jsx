import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png"

export default function Sidebar() {
  const [signals, setSignals] = useState([]);
  const [pipelines, setPipelines] = useState([]);

  useEffect(() => {
    fetch('http://localhost:1205/signals')
      .then(response => response.json())
      .then(data => {
        console.log('Signals Data:', data);
        setSignals(data);
      })
      .catch(error => console.error('Error fetching signals data:', error));
    fetch('http://localhost:1205/pipelines')
      .then(response => response.json())
      .then(data => {
        console.log('Pipelines Data:', data);
        setPipelines(data);
      })
      .catch(error => console.error('Error fetching pipelines data:', error))
  }, []);

  return (
    <div className="w-64 bg-white p-4 shadow-lg rounded-lg border">
      <img src={logo} alt="Blackrock Neurotech Logo" className="" />
      {/* Signal Source */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-blue-700 uppercase">Active Signal Sources</h3>
        <ul className="space-y-2 mt-2">
          {signals.map((signal, index) => (
            <li key={index} className="flex justify-between items-center py-1">
              <span className="flex-grow ml-2 text-gray-700 font-medium rounded-md px-2 py-1 text-sm">
                {signal.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Active Pipelines */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-blue-700 uppercase">Active Subgraphs</h3>
        <ul className="space-y-2 mt-2">
          {pipelines.map((pipeline, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="flex-grow ml-2 text-gray-700 font-medium rounded-md px-2 py-1 text-sm">
                {pipeline.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-green-500 text-white px-4 py-1 rounded-md text-sm mt-8 text-center">
        Graph Service On
      </div>
    </div>
  );
}
