import React from "react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between bg-white p-3 shadow-md">
      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      <span className="bg-green-500 text-white px-3 py-1 rounded">
        Implant: Connected
      </span>
      <button className="bg-red-500 text-white px-4 py-1 rounded shadow-md">
        STOP
      </button>
    </div>
  );
}
