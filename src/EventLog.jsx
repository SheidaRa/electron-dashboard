import React from "react";

export default function EventLog() {
  return (
    <div className="bg-gray-100 p-4">
      <h3 className="text-lg font-semibold">Event Log</h3>
      <div className="bg-white p-4 rounded shadow-md">
        <p className="text-sm text-gray-600">No recent events.</p>
      </div>
    </div>
  );
}
