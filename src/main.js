require("dotenv").config();
const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let ezmsgDaemon = null;

const WORKING_DIRECTORY =
  process.env.BRNBCI_DIR ||
  "Set your brnbci path inside the .env file at the root of this repo";

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "connect-src 'self' http://localhost:1205 ws://localhost:1205 ws://127.0.0.1:1205 ; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        ],
      },
    });
  });

  console.log("Starting ezmsg...");

  ezmsgDaemon = spawn(
    "uv",
    ["run", "ezmsg", "--address", "127.0.0.1:25978", "start"],
    {
      cwd: WORKING_DIRECTORY,
      detached: true,
      stdio: "pipe",
      shell: true,
      windowsHide: true,
    }
  );

  ezmsgDaemon.unref();

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  if (ezmsgDaemon) {
    console.log("Stopping ezmsg bus...");
    ezmsgDaemon.kill("SIGTERM");
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
