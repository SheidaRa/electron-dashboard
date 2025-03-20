import MermaidDiagram from "./MermaidDiagram.jsx";
import React, { useState, useEffect } from "react";


export default function PipelineConfig({ graphDefinition, setGraphDefinition }) {
  return (
    <div className="flex-1">
      {/* <h3 className="text-xl font-semibold">Pipeline Configuration</h3> */}
      <div className="bg-white shadow-md h-full flex justify-center items-center border rounded-lg">
        <div className="w-full h-full">
          {/* graph TD;
          A[Start] --> B{Decision};
          B -->|Yes| C[Process 1];
          B -->|No| D[Process 2];
          C --> E[End];
          D --> E; */}
          <MermaidDiagram graphDefinition={graphDefinition} setGraphDefinition={setGraphDefinition} />
        </div>
      </div>
    </div>
  );
}
