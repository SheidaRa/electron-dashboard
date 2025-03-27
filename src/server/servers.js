const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = 1205;
app.use(cors());

// === CONFIG PATHS ===
const logPath = path.resolve(__dirname, "../dummyFiles/ezprofiler.log");

const WORKING_DIRECTORY = path.resolve(__dirname, "../../../../../brnbci");
const GRAPH_FILE_PATH = path.join(__dirname, "../graphData.txt");

// === HELPER FUNCTIONS ===
function parseLogFile(logText) {
  const lines = logText.trim().split("\n");
  const data = {};
  for (const line of lines) {
    const parts = line.trim().split(",");
    if (parts.length < 6) continue;
    const topic = parts[2];
    const elapsed = parseFloat(parts[5]);
    if (!data[topic]) data[topic] = [];
    data[topic].push(elapsed);
  }
  const means = Object.fromEntries(
    Object.entries(data).map(([topic, arr]) => [
      topic,
      arr.reduce((a, b) => a + b, 0) / arr.length,
    ])
  );
  return means;
}

function getColor(elapsed, maxElapsed) {
  if (isNaN(elapsed) || isNaN(maxElapsed) || maxElapsed === 0)
    return "#99999980"; // Fallback
  const ratio = Math.min(elapsed / maxElapsed, 1.0);
  const r = Math.floor(255 * ratio);
  const b = Math.floor(255 * (1 - ratio));
  return `#${r.toString(16).padStart(2, "0")}00${b
    .toString(16)
    .padStart(2, "0")}80`;
}

app.get("/graph", (req, res) => {
  console.log(`Spawning child process in directory: ${WORKING_DIRECTORY}`);

  const process = spawn(
    "uv",
    ["run", "ezmsg", "--address", "127.0.0.1:25978", "mermaid"],
    { cwd: WORKING_DIRECTORY }
  );

  let output = "";

  // Capture output
  process.stdout.on("data", (data) => {
    output += data.toString();
  });

  process.stderr.on("data", (data) => {
    console.error(`Error: ${data.toString()}`);
  });

  process.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send(`Command failed with exit code ${code}`);
    }

    // Save to file
    fs.writeFile(GRAPH_FILE_PATH, output, (err) => {
      if (err) {
        console.error("Error saving graph data:", err);
        return res.status(500).send("Error saving graph data.");
      }
      console.log("Graph data saved to graphData.txt");

      // Read and return it
      fs.readFile(GRAPH_FILE_PATH, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading graphData.txt:", err);
          return res.status(500).send("Error reading graph data.");
        }
        res.send(data);
      });
    });
  });
});

// dummy signals route
app.get("/signals", (req, res) => {
  const filePath = path.resolve(__dirname, "../dummyFiles/signals.json");
  console.log(filePath);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// dummy pipelines
app.get("/pipelines", (req, res) => {
  const filePath = path.resolve(__dirname, "../dummyFiles/pipelines.json");
  console.log(filePath);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// dummy performances
app.get("/performances", (req, res) => {
  const filePath = path.resolve(__dirname, "../dummyFiles/performances.json");
  console.log(filePath);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.get("/styled-mermaid", (req, res) => {
  try {
    const graphText = fs.readFileSync(GRAPH_FILE_PATH, "utf8").trim();
    const logText = fs.readFileSync(logPath, "utf8").trim();
    const baseMermaid = graphText.split("\n");

    const averages = parseLogFile(logText);

    const elapsedValues = Object.values(averages).filter((v) => !isNaN(v));
    const maxElapsed =
      elapsedValues.length > 0 ? Math.max(...elapsedValues) : 1.0;

    const styleLines = Object.entries(averages)
      .filter(([_, avg]) => !isNaN(avg))
      .map(([topic, avg]) => {
        const nodeId = topic.split("/").pop().toLowerCase(); // ✅ Use only last part of topic (e.g., "CAR")
        const color = getColor(avg, maxElapsed);
        return `  style ${nodeId} fill:${color}`;
      });

    const finalMermaid = [...baseMermaid, ...styleLines].join("\n");
    res.type("text/plain").send(finalMermaid);
  } catch (err) {
    console.error("Error generating styled Mermaid:", err);
    res.status(500).send("Failed to generate Mermaid diagram");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
