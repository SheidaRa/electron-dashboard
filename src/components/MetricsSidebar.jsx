import React, { useEffect, useState } from "react";
import { ChevronRight, GripVertical } from "lucide-react";

export default function MetricsSidebar() {

  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    fetch('http://localhost:1205/performances')
      .then(response => response.json())
      .then(data => {
        console.log('Performance Data:', data);
        setPerformances(data);
      })
      .catch(error => console.error('Error fetching performances data:', error));
  }, []);

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
        {performances.map((performance, index) => (
          <li key={index} className="flex justify-between items-center py-1">
            {performance.title}:<span className="text-gray-500">{performance.value}</span>
          </li>
        ))}
      </ul>

    </div>
  );
}
