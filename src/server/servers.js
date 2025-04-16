require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const os = require("os");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const PORT = 1205;
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  console.log("UI connected to log stream");
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
  });
});

function broadcastLog(logLine) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(logLine);
    }
  }
}

// === CONFIG PATHS ===

const LOG_PATH =
  process.env.EZMSG_PROFILE ||
  path.join(os.homedir(), ".ezmsg", "profile", "l", "ezprofiler.log");

const WORKING_DIRECTORY =
  process.env.BRNBCI_DIR ||
  "Set your brnbci path inside the .env file at the root of this repo";

// Send console logs to UI

function interceptConsole(method = "log") {
  const original = console[method];
  console[method] = (...args) => {
    const message = args.map(String).join(" ");
    original.apply(console, args); // affiche normalement dans le terminal
    broadcastLog(`[${method.toUpperCase()}] ${message}`); // envoie au front
  };
}

["log", "warn", "error"].forEach(interceptConsole);

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

let currentPipelineProcess = null;

app.get("/graph", (req, res) => {
  const shouldProfile = req.query.profiling === "true";
  const pythonScriptPath = path.join(
    WORKING_DIRECTORY,
    "scripts_nbs",
    "temp",
    "ecog_preproc.py"
  );

  // Kill previous pipeline if it exists
  if (currentPipelineProcess) {
    console.log("Killing existing pipeline process...");
    try {
      currentPipelineProcess.kill("SIGTERM");
    } catch (err) {
      console.warn("Failed to kill previous process:", err.message);
    }
    currentPipelineProcess = null;
  }

  const env = {
    ...process.env,
    ...(shouldProfile && {
      EZMSG_LOGLEVEL: "DEBUG",
      EZMSG_PROFILE: LOG_PATH,
    }),
  };

  console.log(
    "Launching pipeline" + (shouldProfile ? " with profiling..." : "...")
  );

  const pipelineProcess = spawn("uv", ["run", "python", pythonScriptPath], {
    cwd: WORKING_DIRECTORY,
    env,
    stdio: "ignore",
    windowsHide: true,
  });

  pipelineProcess.unref();
  currentPipelineProcess = pipelineProcess;

  const delay = shouldProfile ? 1000 : 0;

  setTimeout(() => {
    const ezmsgProcess = spawn(
      "uv",
      ["run", "ezmsg", "--address", "127.0.0.1:25978", "mermaid"],
      {
        cwd: WORKING_DIRECTORY,
        windowsHide: true,
      }
    );

    let output = "";

    ezmsgProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    ezmsgProcess.stderr.on("data", (data) => {
      const log = `[ezmsg error] ${data.toString()}`;
      console.error(log);
      broadcastLog(log);
    });

    ezmsgProcess.stdout.on("data", (data) => {
      const log = `[ezmsg] ${data.toString()}`;
      broadcastLog(log);
    });

    ezmsgProcess.on("close", (code) => {
      if (code !== 0) {
        return res
          .status(500)
          .send(`ezmsg command failed with exit code ${code}`);
      }

      if (!shouldProfile) {
        return res.type("text/plain").send(output);
      }

      try {
        if (!fs.existsSync(LOG_PATH)) {
          return res.status(404).send("Profiler log not found.");
        }

        const logText = fs.readFileSync(LOG_PATH, "utf8").trim();
        const baseMermaid = output.trim().split("\n");

        const averages = parseLogFile(logText);
        const elapsedValues = Object.values(averages).filter((v) => !isNaN(v));
        const maxElapsed =
          elapsedValues.length > 0 ? Math.max(...elapsedValues) : 1.0;

        const styleLines = Object.entries(averages)
          .filter(([_, avg]) => !isNaN(avg))
          .map(([topic, avg]) => {
            const nodeId = topic.split("/").pop().toLowerCase();
            const color = getColor(avg, maxElapsed);
            return `  style ${nodeId} fill:${color}`;
          });

        const finalMermaid = [...baseMermaid, ...styleLines].join("\n");
        res.type("text/plain").send(finalMermaid);
      } catch (err) {
        console.error("Styling failed:", err);
        return res.status(500).send("Failed to style graph.");
      }
    });
  }, delay);
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
server.listen(PORT, () => {
  console.log(`Server + WebSocket running at http://localhost:${PORT}`);
});
