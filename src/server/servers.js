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

    try {
      const baseMermaid = output.trim().split("\n");

      const logText = fs.readFileSync(logPath, "utf8").trim();
      const averages = parseLogFile(logText);
      const elapsedValues = Object.values(averages).filter((v) => !isNaN(v));
      const maxElapsed =
        elapsedValues.length > 0 ? Math.max(...elapsedValues) : 1.0;

      const styleLines = Object.entries(averages)
        .filter(([_, avg]) => !isNaN(avg))
        .reduce(
          (acc, [topic, avg]) => {
            const nodeId = topic.split("/").pop().toLowerCase(); // Use only last part of topic
            if (acc.seen.has(nodeId)) return acc;
            const color = getColor(avg, maxElapsed);
            acc.lines.push(`  style ${nodeId} fill:${color}`);
            acc.seen.add(nodeId);
            return acc;
          },
          { lines: [], seen: new Set() }
        ).lines;

      const finalMermaid = [...baseMermaid, ...styleLines].join("\n");

      fs.writeFile(GRAPH_FILE_PATH, finalMermaid, (err) => {
        if (err) {
          console.error("Error saving styled graph:", err);
          return res.status(500).send("Error saving styled graph.");
        }
        console.log("Styled graph written to graphData.txt");
        res.type("text/plain").send(finalMermaid);
      });
    } catch (err) {
      console.error("Error while styling the graph:", err);
      res.status(500).send("Failed to generate styled Mermaid graph.");
    }
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
