require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");
const os = require("os");
const WebSocket = require("ws");
const http = require("http");
const net = require("net");

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

const LOG_PATH =
  process.env.EZMSG_PROFILE ||
  path.join(os.homedir(), ".ezmsg", "profile", "l", "ezprofiler.log");

const WORKING_DIRECTORY =
  process.env.BRNBCI_DIR ||
  "Set your brnbci path inside the .env file at the root of this repo";

function interceptConsole(method = "log") {
  const original = console[method];
  console[method] = (...args) => {
    const message = args.map(String).join(" ");
    original.apply(console, args);
    broadcastLog(`[${method.toUpperCase()}] ${message}`);
  };
}

["log", "warn", "error"].forEach(interceptConsole);

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
    return "#99999980";
  const ratio = Math.min(elapsed / maxElapsed, 1.0);
  const r = Math.floor(255 * ratio);
  const b = Math.floor(255 * (1 - ratio));
  return `#${r.toString(16).padStart(2, "0")}00${b
    .toString(16)
    .padStart(2, "0")}80`;
}

let currentPipelineProcess = null;
let currentMermaidProcess = null;

function killProcessAndChildren(pid) {
  if (!pid) {
    console.error("No PID provided to kill.");
    return;
  }

  console.log(`Attempting to kill process ${pid} and its child processes...`);

  // Use pgrep to list all child processes of the given PID
  exec(`pgrep -P ${pid}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Failed to list child processes of ${pid}:`, err.message);
      return;
    }

    // Extract child process IDs
    const childPIDs = stdout
      .split("\n")
      .filter((p) => p.trim() !== "")
      .map((p) => parseInt(p.trim()));

    console.log(`Child processes of ${pid}:`, childPIDs);

    // Attempt to kill the parent process
    try {
      process.kill(pid);
      console.log(`Successfully killed parent process ${pid}`);
    } catch (err) {
      console.error(`Failed to kill parent process ${pid}:`, err.message);
    }

    // Attempt to kill each child process
    childPIDs.forEach((childPID) => {
      try {
        process.kill(childPID);
        console.log(`Successfully killed child process ${childPID}`);
      } catch (err) {
        console.error(`Failed to kill child process ${childPID}:`, err.message);
      }
    });
  });
}

async function isEzmsgGraphServerRunning(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(200);

    //Checking if port is opened first
    client.connect(port, "127.0.0.1", () => {
      client.destroy(); // Port is open — now try ezmsg
      const proc = spawn(
        "uv",
        ["run", "ezmsg", "--address", `127.0.0.1:${port}`, "graphviz"],
        {
          cwd: WORKING_DIRECTORY,
          shell: true,
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      let output = "";

      proc.stderr.on("data", (data) => {
        output += data.toString();
      });

      proc.on("close", () => {
        // Graph service is not active if we receive an output error msg
        if (
          output.includes("GraphServer not running") ||
          output.includes("IncompleteReadError")
        ) {
          console.log(`false: ${port}`)
          resolve(false);
        } else {
          console.log(`true: ${port}`)
          resolve(true); // no error = graph server running
        }
      });

      proc.on("error", () => resolve(false));
    });

    client.on("error", () => resolve(false));
    client.on("timeout", () => {
      client.destroy();
      resolve(false);
    });
  });
}

app.get("/graph-services", async (req, res) => {
  broadcastLog("Scanning ports 25978 to 25988 for active graph services...");
  const portsToCheck = Array.from({ length: 11 }, (_, i) => 25978 + i); // test port range 25978–25988
  const results = await Promise.all(
    portsToCheck.map(async (port) => {
      const running = await isEzmsgGraphServerRunning(port);
      return running ? port : null;
    })
  );

  const activePorts = results.filter((p) => p !== null);
  res.json({ ports: activePorts });
  broadcastLog(`Active graph services found on ports ${activePorts}`);
});

app.get("/graph", (req, res) => {
  const shouldProfile = req.query.profiling === "true";
  const pipeline = req.query.pipeline;
  const pythonScriptPath = path.join(
    WORKING_DIRECTORY,
    "scripts_nbs",
    pipeline
  );

  console.log("Pipeline Path:", pythonScriptPath);

  // Kill existing pipeline and mermaid processes if running
  if (currentPipelineProcess) {
    console.log("Killing existing pipeline process...");
    killProcessAndChildren(currentPipelineProcess.pid);
    currentPipelineProcess = null;
  }

  if (currentMermaidProcess) {
    console.log("Killing existing mermaid process...");
    killProcessAndChildren(currentMermaidProcess.pid);
    currentMermaidProcess = null;
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
    stdio: ["ignore", "pipe", "pipe"], // Capture both stdout and stderr
    windowsHide: true,
  });

  console.log(`Pipeline process started with PID: ${pipelineProcess.pid}`);

  pipelineProcess.unref();
  currentPipelineProcess = pipelineProcess;

  let bufferOutput = "";
  let pipelineReady = false;

  // Listen for pipeline readiness
  pipelineProcess.stdout.on("data", (data) => {
    const message = data.toString();
    bufferOutput += message;
    console.log("[Pipeline STDOUT]:", message);

    if (message.includes("Loaded default config")) {
      console.log("Pipeline is ready!");
      pipelineReady = true;
    }
  });

  pipelineProcess.stderr.on("data", (data) => {
    const message = data.toString();
    bufferOutput += message;
    console.error("[Pipeline STDERR]:", data.toString());
    if (message.includes("Loaded default config")) {
      console.log("Pipeline is ready!");
      pipelineReady = true;
    }
  });

  // Monitor pipeline exit
  pipelineProcess.on("close", (code) => {
    console.log(`Pipeline process exited with code ${code}`);
    currentPipelineProcess = null;
  });

  // Wait for the pipeline to be ready
  const waitForPipeline = new Promise((resolve, reject) => {
    const maxWaitTime = 60000; // 60 seconds
    const startTime = Date.now();

    const checkReady = setInterval(() => {
      if (pipelineReady) {
        clearInterval(checkReady);
        resolve();
      } else if (Date.now() - startTime > maxWaitTime) {
        clearInterval(checkReady);
        reject("Pipeline startup timeout.");
      }
    }, 500);
  });

  // Start Mermaid after the pipeline is ready
  waitForPipeline
    .then(() => {
      console.log("Starting Mermaid...");
      const ezmsgProcess = spawn(
        "uv",
        ["run", "ezmsg", "--address", "127.0.0.1:25978", "mermaid"],
        {
          cwd: WORKING_DIRECTORY,
          windowsHide: true,
        }
      );

      currentMermaidProcess = ezmsgProcess;
      let output = "";

      ezmsgProcess.stdout.on("data", (data) => {
        output += data.toString();
        console.log("[Mermaid STDOUT]:", data.toString());
      });

      ezmsgProcess.stderr.on("data", (data) => {
        const log = `[Mermaid STDERR]: ${data.toString()}`;
        console.error(log);
      });

      ezmsgProcess.on("close", (code) => {
        currentMermaidProcess = null;
        if (code !== 0) {
          return res
            .status(500)
            .send(`Mermaid command failed with exit code ${code}`);
        }

        if (!shouldProfile) {
          return res.type("text/plain").send(output);
        }

        // Process profiling data if profiling is enabled
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
          res.status(500).send("Failed to style graph.");
        }
      });
    })
    .catch((err) => {
      console.error("Pipeline failed:", err);
      res.status(500).send("Pipeline failed to start in time.");
    });
});

// Dummy endpoints
app.get("/signals", (req, res) => {
  const filePath = path.resolve(__dirname, "../dummyFiles/signals.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(JSON.parse(data));
  });
});

app.get("/pipelines", (req, res) => {
  const filePath = path.resolve(__dirname, "../dummyFiles/pipelines.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(JSON.parse(data));
  });
});

app.get("/performances", (req, res) => {
  const filePath = path.resolve(__dirname, "../dummyFiles/performances.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(JSON.parse(data));
  });
});

server.listen(PORT, () => {
  console.log(`Server + WebSocket running at http://localhost:${PORT}`);
});
