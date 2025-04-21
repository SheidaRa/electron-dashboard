require("dotenv").config();
const { app, BrowserWindow, session, screen } = require("electron");
const path = require("path");
const { spawn, exec } = require("child_process");
const { ipcMain } = require("electron");
const os = require("os");

ipcMain.handle("get-homedir", () => {
  return os.homedir();
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

let ezmsgDaemon = null;
let ezmsgPidToKill = null;

const WORKING_DIRECTORY =
  process.env.BRNBCI_DIR ||
  "Set your brnbci path inside the .env file at the root of this repo";

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "connect-src 'self' http://localhost:1205 ws://localhost:1205 ws://127.0.0.1:1205; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        ],
      },
    });
  });

  console.log("Starting ezmsg...");

  // Spawn ezmsg with logging so we can capture its PID
  ezmsgDaemon = spawn(
    "uv",
    ["run", "ezmsg", "--address", "127.0.0.1:25978", "start"],
    {
      cwd: WORKING_DIRECTORY,
      shell: true,
    }
  );

  // Parse ezmsg output to get the process ID we need to kill
  ezmsgDaemon.stderr.on("data", (data) => {
    const log = data.toString();
    console.error("[ezmsg stderr]", log);

    const match = log.match(
      /pid:\s*(\d+)\s*-\s*MainThread\s*-\s*INFO\s*-\s*run_command: GraphServer Address:/
    );
    if (match && match[1]) {
      ezmsgPidToKill = parseInt(match[1], 10);
      console.log("Captured ezmsg PID:", ezmsgPidToKill);
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  console.log("Stopping ezmsg bus...");
  if (ezmsgPidToKill) {
    const command =
      process.platform === "win32"
        ? `taskkill /PID ${ezmsgPidToKill} /F`
        : `kill -9 ${ezmsgPidToKill}`;

    exec(command, (error) => {
      if (error) {
        console.error(
          `Failed to kill ezmsg PID ${ezmsgPidToKill}:`,
          error.message
        );
      } else {
        console.log(`Successfully killed ezmsg PID ${ezmsgPidToKill}`);
      }
    });
  }
});
