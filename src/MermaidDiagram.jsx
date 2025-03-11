import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function MermaidDiagram() {
  const mermaidRef = useRef(null);

  useEffect(() => {
    // Mermaid configuration
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      flowchart: {
        htmlLabels: true,
        useMaxWidth: false,
      },
      // Debug activation
      logLevel: "debug",
    });

    // Waiting for DOM to render before rendering the graph
    if (mermaidRef.current) {
      try {
        mermaid.render("mermaid-diagram", graphDefinition).then(({ svg }) => {
          mermaidRef.current.innerHTML = svg;
        });
      } catch (error) {
        console.error("Erreur de rendu Mermaid:", error);
        mermaidRef.current.innerHTML = `<pre>${error.message}</pre>`;
      }
    }
  }, []);

  // Graph definition, mermaid left panel
  const graphDefinition = `
flowchart LR
  subgraph zscore ["ZSCORE"]
    0f07bd14-f097-45b4-8e35-5681b3f7f5c6["OUTPUT_SIGNAL"]
    2f3d0c73-6cf2-47ce-bb2d-6bd1b4b7738c["INPUT_SIGNAL"]
  end
  subgraph term ["TERM"]
    ad4767f8-f580-4a37-8352-0446d5f3b26d["INPUT_MESSAGE"]
  end
  subgraph ds ["DS"]
    58b0d536-5ca2-476e-aaa9-b5d9fcf9542e["OUTPUT_SIGNAL"]
    a3d36773-dc4f-42be-a50e-52bc287746a6["INPUT_SIGNAL"]
  end
  subgraph car ["CAR"]
    c8d97700-b364-4984-8037-8b505e20ba16["INPUT_SIGNAL"]
    73976472-7813-4f0c-85a5-a65b7e65abd0["OUTPUT_SIGNAL"]
  end
  subgraph lp ["LP"]
    b0caf37e-0020-4d75-ab94-00b5306a65c5["OUTPUT_SIGNAL"]
    c9e9c946-5977-49e2-9997-dc28525580db["INPUT_SIGNAL"]
  end
  subgraph freq ["FREQ"]
    1304c6ac-9920-480e-90a4-17bc6d1603fa["OUTPUT_SIGNAL"]
    f1a0276d-4f4a-4cef-87c3-c4d2164b8e77["INPUT_SIGNAL"]
  end
  subgraph select ["SELECT"]
    7e011490-d8c6-46e4-acfd-b545456247ac["OUTPUT_SIGNAL"]
    85b9dd47-c5ec-4999-a8da-b0f143ae3a44["INPUT_SIGNAL"]
  end
  subgraph ecog ["ECOG"]
    eb1d07af-f09e-4a54-a95e-d8a1335e6b98["OUTPUT_SIGNAL"]
    subgraph clock ["CLOCK"]
      d67fb6df-0067-4e13-821d-8f48c992305d["OUTPUT_SIGNAL"]
    end
    subgraph osc ["OSC"]
      94d9cdee-0176-4df6-8ef4-dd7c6034711e["INPUT_SIGNAL"]
      1246c3ff-0e50-4cfa-a3bc-66e2e4a473e2["OUTPUT_SIGNAL"]
    end
    subgraph noise ["NOISE"]
      4c6ca378-915b-4524-b4c8-2371a0f84185["INPUT_SIGNAL"]
      cf12cf5c-e21c-451a-a6c9-bde1e5d2624a["OUTPUT_SIGNAL"]
    end
    subgraph add ["ADD"]
      62dd48a1-dc61-4401-a51e-519b04eb81e7["INPUT_SIGNAL_A"]
      41ca9e96-c62c-4cff-8857-74f426aad918["INPUT_SIGNAL_B"]
      a57db83b-1fb0-46b4-a3fa-bc85d3cc7bc4["OUTPUT_SIGNAL"]
    end
  end
  0f07bd14-f097-45b4-8e35-5681b3f7f5c6 --> ad4767f8-f580-4a37-8352-0446d5f3b26d
  58b0d536-5ca2-476e-aaa9-b5d9fcf9542e --> c8d97700-b364-4984-8037-8b505e20ba16
  b0caf37e-0020-4d75-ab94-00b5306a65c5 --> a3d36773-dc4f-42be-a50e-52bc287746a6
  1304c6ac-9920-480e-90a4-17bc6d1603fa --> 2f3d0c73-6cf2-47ce-bb2d-6bd1b4b7738c
  73976472-7813-4f0c-85a5-a65b7e65abd0 --> f1a0276d-4f4a-4cef-87c3-c4d2164b8e77
  7e011490-d8c6-46e4-acfd-b545456247ac --> c9e9c946-5977-49e2-9997-dc28525580db
  eb1d07af-f09e-4a54-a95e-d8a1335e6b98 --> 85b9dd47-c5ec-4999-a8da-b0f143ae3a44
  d67fb6df-0067-4e13-821d-8f48c992305d --> 94d9cdee-0176-4df6-8ef4-dd7c6034711e
  d67fb6df-0067-4e13-821d-8f48c992305d --> 4c6ca378-915b-4524-b4c8-2371a0f84185
  1246c3ff-0e50-4cfa-a3bc-66e2e4a473e2 --> 62dd48a1-dc61-4401-a51e-519b04eb81e7
  cf12cf5c-e21c-451a-a6c9-bde1e5d2624a --> 41ca9e96-c62c-4cff-8857-74f426aad918
  a57db83b-1fb0-46b4-a3fa-bc85d3cc7bc4 --> eb1d07af-f09e-4a54-a95e-d8a1335e6b98
  `;

  return (
    <div className="mermaid-container">
      <div ref={mermaidRef} id="mermaid-diagram-container"></div>

      {/* Alternative in case the render method doesn't work */}
      <div style={{ display: "none" }}>
        <div className="mermaid">{graphDefinition}</div>
      </div>
    </div>
  );
}
