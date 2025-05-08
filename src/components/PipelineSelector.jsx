import React, {useState, useEffect} from 'react'
import pipelinesConfig from "../data/pipelines.json";

const PipelineSelector = ({selectedPipeline, onChange}) => {

  const [pipelines, setPipelines] = useState([])

useEffect(() => {
  setPipelines(pipelinesConfig)
},[])

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select Pipeline
      </label>
      <div className="flex gap-4">
      <select
          value={selectedPipeline}
          onChange={(e) => onChange(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/6"
        >
          <option value="" disabled>
            Select a pipeline
          </option>
          {pipelines.map((pipeline, index) => (
            <option key={index} value={pipeline.path}>
              {pipeline.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default PipelineSelector