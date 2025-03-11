import React from "react";

export default function PipelineConfig() {
  return (
    <div className="flex-1 p-4">
      {/* <h3 className="text-xl font-semibold">Pipeline Configuration</h3> */}
      <div className="bg-white shadow-md h-full flex justify-center items-center border rounded-lg">
        <div className="mermaid w-full">
          {/* graph TD;
          A[Start] --> B{Decision};
          B -->|Yes| C[Process 1];
          B -->|No| D[Process 2];
          C --> E[End];
          D --> E; */}
        </div>
      </div>
    </div>
  );
}
