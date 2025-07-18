import { app, BrowserWindow, ipcMain, screen, Menu, Tray } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createMainWindow() {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  try {
    mainWindow = new BrowserWindow({
      width: 200,
      height: 240,
      x: screenWidth - 180 - 10,
      y: screenHeight - 240 - 10,
      frame: false,
      transparent: true,
      alwaysOnTop: false,
      backgroundColor: "#00000000",
      skipTaskbar: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
      },
    });

    if (process.env.NODE_ENV === "development") {
      mainWindow
        .loadURL("http://localhost:5173/#/")
        .catch((err) => console.error("Failed to load dev URL:", err));
    } else {
      mainWindow
        .loadFile(path.join(__dirname, "../../renderer/dist/index.html"), {
          hash: "/",
        })
        .catch((err) => console.error("Failed to load production HTML:", err));
    }

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  } catch (err) {
    console.error("Error creating main window:", err);
  }
}

function openConfigWindow() {
  try {
    const configWin = new BrowserWindow({
      width: 600,
      height: 500,
      modal: true,
      parent: mainWindow || undefined,
      backgroundColor: "#fff",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
      },
    });

    if (process.env.NODE_ENV === "development") {
      configWin
        .loadURL("http://localhost:5173/#/config")
        .catch((err) => console.error("Failed to load config URL:", err));
    } else {
      configWin
        .loadFile(path.join(__dirname, "../../renderer/dist/index.html"), {
          hash: "config",
        })
        .catch((err) => console.error("Failed to load config HTML:", err));
    }
  } catch (err) {
    console.error("Error creating config window:", err);
  }
}

function createDockMenu() {
  if (process.platform === "darwin") {
    const dockMenu = Menu.buildFromTemplate([
      { label: "Open Settings", click: openConfigWindow },
      { label: "Quit", click: () => app.quit() },
    ]);
    app.dock.setMenu(dockMenu);
  }
}

function createTrayMenu() {
  try {
    const iconPath = path.join(__dirname, "iconTemplate.png");
    tray = new Tray(iconPath);

    const trayMenu = Menu.buildFromTemplate([
      { label: "Open Settings", click: openConfigWindow },
      {
        label: "Show App",
        click: () => {
          if (mainWindow) {
            if (mainWindow.isDestroyed()) {
              createMainWindow();
            } else {
              mainWindow.show();
            }
          } else {
            createMainWindow();
          }
        },
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]);

    tray.setToolTip("Your App Name");
    tray.setContextMenu(trayMenu);
  } catch (err) {
    console.error("Error creating tray:", err);
  }
}

app
  .whenReady()
  .then(() => {
    createMainWindow();
    createDockMenu();
    createTrayMenu();
  })
  .catch((err) => console.error("App failed to start:", err));

ipcMain.on("open-config-window", openConfigWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createMainWindow();
});

// ✅ Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
