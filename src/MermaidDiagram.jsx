

// import React, { useEffect, useRef, useState } from "react";
// import mermaid from "mermaid";

// export default function MermaidDiagram() {
//   const mermaidRef = useRef(null);
//   const [graphDefinition, setGraphDefinition] = useState("");

//   useEffect(() => {
//     fetch("http://localhost:1205/graph")
//       .then((response) => response.text()) // text, NOT JSON
//       .then((data) => {
//         console.log("Fetched Mermaid Graph Data:", data);
//         setGraphDefinition(data);
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }, []);

//   useEffect(() => {
//     mermaid.initialize({
//       startOnLoad: false,
//       theme: "default",
//       securityLevel: "loose",
//       flowchart: {
//         htmlLabels: true,
//         useMaxWidth: false,
//       },
//       logLevel: "debug",
//     });

//     if (mermaidRef.current && graphDefinition) {
//       mermaid.render("mermaid-diagram", graphDefinition)
//         .then(({ svg }) => {
//           mermaidRef.current.innerHTML = svg;
//         })
//         .catch((error) => {
//           console.error("Mermaid Render Error:", error);
//           mermaidRef.current.innerHTML = `<pre>${error.message}</pre>`;
//         });
//     }
//   }, [graphDefinition]); 

//   return (
//     <div className="mermaid-container">
//       <div ref={mermaidRef} id="mermaid-diagram-container"></div>
//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";

export default function MermaidDiagram() {
  const mermaidRef = useRef(null);
  const [graphDefinition, setGraphDefinition] = useState("");

  useEffect(() => {
    fetch("http://localhost:1205/graph")
      .then((response) => response.text())
      .then((data) => {
        console.log("Fetched Mermaid Graph Data:", data);
        setGraphDefinition(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      flowchart: {
        htmlLabels: true,
        useMaxWidth: false,
      },
      logLevel: "debug",
    });

    if (mermaidRef.current && graphDefinition) {
      mermaid.render("mermaid-diagram", graphDefinition)
        .then(({ svg }) => {
          mermaidRef.current.innerHTML = svg;

          // Make the diagram interactive with zoom & pan
          const svgElement = mermaidRef.current.querySelector("svg");
          if (svgElement) {
            svgElement.setAttribute("width", "100%"); // Make it smaller
            svgElement.setAttribute("height", "100%"); // Maintain aspect ratio

            const panZoom = svgPanZoom(svgElement, {
              zoomEnabled: true,
              controlIconsEnabled: true, // Adds zoom buttons
              fit: true, // Fits the diagram in the container
              center: true, // Centers the diagram
              minZoom: 0.5, // Allows zooming out
              maxZoom: 3, // Allows zooming in
            });

            // Fit the diagram within the container on load
            panZoom.resize();
            panZoom.fit();
            panZoom.center();
          }
        })
        .catch((error) => {
          console.error("Mermaid Render Error:", error);
          mermaidRef.current.innerHTML = `<pre>${error.message}</pre>`;
        });
    }
  }, [graphDefinition]);

  return (
    <div className="mermaid-container h-full" style={{ }}>
      <div ref={mermaidRef} id="mermaid-diagram-container" className="h-full"></div>
    </div>
  );
}
