import React from "react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between border border-gray-300 rounded-md w-full bg-white p-2  my-2">
      {/* Green Status Indicator */}
      <div className="w-4 h-4 bg-green-500 rounded-full ml-4"></div>

      {/* Status Label */}
      <span className="bg-green-500 text-white px-4 py-1 rounded-md text-sm">
        Implant: Connected
      </span>

      {/* Stop Button */}
      <button className="border border-black text-black px-4 py-1 rounded-md mr-4">
        STOP
      </button>
    </div>
  );
}
