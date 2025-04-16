import React from "react";

export default function EventLog({ logs }) {
  return (
    <div className="p-4 rounded border border-gray-700 mt-4">
      <h3 className="text-lg font-semibold">Event Log</h3>
      <div className="max-h-64 overflow-y-auto space-y-1 text-sm text-gray-600">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {log}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No recent events.</p>
        )}
      </div>
    </div>
  );
}
