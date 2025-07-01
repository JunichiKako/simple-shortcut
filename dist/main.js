"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/electron/main.ts
var import_electron3 = require("electron");
var import_path = require("path");
var import_get_port_please = require("get-port-please");
var import_utils = require("@electron-toolkit/utils");

// src/electron/managers/config-manager.ts
var import_electron = require("electron");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var CONFIG_FILE_PATH = path.join(
  import_electron.app.getPath("userData"),
  "simple-shortcut-config.json"
);
var DEFAULT_CONFIG = {
  projects: [],
  quickAccessSites: [
    {
      id: "github",
      name: "GitHub",
      url: "https://github.com",
      description: "\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9\u7BA1\u7406",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "localhost-3000",
      name: "localhost:3000",
      url: "http://localhost:3000",
      description: "\u958B\u767A\u30B5\u30FC\u30D0\u30FC\uFF08\u3088\u304F\u4F7F\u7528\uFF09",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  version: "1.0.0"
};
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const config = JSON.parse(configData);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error("\u8A2D\u5B9A\u30D5\u30A1\u30A4\u30EB\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F:", error);
  }
  saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}
function saveConfig(config) {
  try {
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error("\u8A2D\u5B9A\u30D5\u30A1\u30A4\u30EB\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F:", error);
    return false;
  }
}
function addProject(projectData) {
  const config = loadConfig();
  const newProject = {
    ...projectData,
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isRunning: false
  };
  config.projects.push(newProject);
  if (!saveConfig(config)) {
    throw new Error("\u8A2D\u5B9A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  }
  return newProject;
}
function updateProject(id, updates) {
  const config = loadConfig();
  const projectIndex = config.projects.findIndex((p) => p.id === id);
  if (projectIndex === -1) {
    throw new Error("\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
  }
  config.projects[projectIndex] = {
    ...config.projects[projectIndex],
    ...updates,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!saveConfig(config)) {
    throw new Error("\u8A2D\u5B9A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  }
  return config.projects[projectIndex];
}
function deleteProject(id) {
  const config = loadConfig();
  const initialLength = config.projects.length;
  config.projects = config.projects.filter((p) => p.id !== id);
  if (config.projects.length === initialLength) {
    throw new Error("\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
  }
  if (!saveConfig(config)) {
    throw new Error("\u8A2D\u5B9A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  }
  return true;
}
function addQuickAccessSite(siteData) {
  const config = loadConfig();
  const newSite = {
    ...siteData,
    id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  config.quickAccessSites.push(newSite);
  if (!saveConfig(config)) {
    throw new Error("\u8A2D\u5B9A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  }
  return newSite;
}
function updateQuickAccessSite(id, updates) {
  const config = loadConfig();
  const siteIndex = config.quickAccessSites.findIndex((s) => s.id === id);
  if (siteIndex === -1) {
    throw new Error("\u30B5\u30A4\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
  }
  config.quickAccessSites[siteIndex] = {
    ...config.quickAccessSites[siteIndex],
    ...updates
  };
  if (!saveConfig(config)) {
    throw new Error("\u8A2D\u5B9A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  }
  return config.quickAccessSites[siteIndex];
}
function deleteQuickAccessSite(id) {
  const config = loadConfig();
  const initialLength = config.quickAccessSites.length;
  config.quickAccessSites = config.quickAccessSites.filter((s) => s.id !== id);
  if (config.quickAccessSites.length === initialLength) {
    throw new Error("\u30B5\u30A4\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
  }
  if (!saveConfig(config)) {
    throw new Error("\u8A2D\u5B9A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  }
  return true;
}
function resetProjectStatuses() {
  try {
    const config = loadConfig();
    config.projects = config.projects.map((project) => ({
      ...project,
      isRunning: false,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    saveConfig(config);
  } catch (error) {
    console.error("\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30B9\u30C6\u30FC\u30BF\u30B9\u306E\u30EA\u30BB\u30C3\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F:", error);
  }
}

// src/electron/handlers/ipc-handlers.ts
var import_electron2 = require("electron");

// src/electron/utils/error-handling.ts
var createErrorResponse = (error) => ({
  success: false,
  error: error instanceof Error ? error.message : String(error)
});
var createSuccessResponse = (data) => ({
  success: true,
  data
});
var wrapIPCHandler = (handler) => {
  return async (...args) => {
    try {
      const data = await handler(...args);
      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
};

// src/electron/handlers/ipc-handlers.ts
var mainWindow = null;
var isInitialized = false;
function initializeIPCHandlers(window) {
  mainWindow = window;
  if (!isInitialized) {
    setupAllHandlers();
    isInitialized = true;
  }
}
function updateMainWindowReference(window) {
  mainWindow = window;
}
function setupAllHandlers() {
  setupProjectHandlers();
  setupQuickAccessHandlers();
  setupUtilityHandlers();
}
function setupProjectHandlers() {
  import_electron2.ipcMain.handle(
    "get-config",
    wrapIPCHandler(async () => {
      return loadConfig();
    })
  );
  import_electron2.ipcMain.handle(
    "get-projects",
    wrapIPCHandler(async () => {
      const config = loadConfig();
      return config.projects;
    })
  );
  import_electron2.ipcMain.handle(
    "add-project",
    wrapIPCHandler(
      async (_, project) => {
        return addProject(project);
      }
    )
  );
  import_electron2.ipcMain.handle(
    "update-project",
    wrapIPCHandler(
      async (_, id, updates) => {
        return updateProject(id, updates);
      }
    )
  );
  import_electron2.ipcMain.handle(
    "delete-project",
    wrapIPCHandler(async (_, id) => {
      return deleteProject(id);
    })
  );
}
function setupQuickAccessHandlers() {
  import_electron2.ipcMain.handle(
    "add-quick-access-site",
    wrapIPCHandler(
      async (_, site) => {
        return addQuickAccessSite(site);
      }
    )
  );
  import_electron2.ipcMain.handle(
    "update-quick-access-site",
    wrapIPCHandler(
      async (_, id, updates) => {
        return updateQuickAccessSite(id, updates);
      }
    )
  );
  import_electron2.ipcMain.handle(
    "delete-quick-access-site",
    wrapIPCHandler(async (_, id) => {
      return deleteQuickAccessSite(id);
    })
  );
}
function setupUtilityHandlers() {
  import_electron2.ipcMain.handle("select-folder", async () => {
    try {
      if (!mainWindow) {
        return createErrorResponse("\u30E1\u30A4\u30F3\u30A6\u30A3\u30F3\u30C9\u30A6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
      }
      const result = await import_electron2.dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
        title: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30D5\u30A9\u30EB\u30C0\u3092\u9078\u629E",
        buttonLabel: "\u9078\u629E"
      });
      if (result.canceled || result.filePaths.length === 0) {
        return createErrorResponse("\u30D5\u30A9\u30EB\u30C0\u304C\u9078\u629E\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F");
      }
      return createSuccessResponse(result.filePaths[0]);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  import_electron2.ipcMain.handle(
    "open-url",
    wrapIPCHandler(async (_, url) => {
      await import_electron2.shell.openExternal(url);
      return true;
    })
  );
}

// src/electron/main.ts
var mainWindow2 = null;
var isAppQuitting = false;
var isIPCInitialized = false;
var createWindow = async () => {
  if (mainWindow2 && !mainWindow2.isDestroyed()) {
    mainWindow2.show();
    mainWindow2.focus();
    return;
  }
  mainWindow2 = new import_electron3.BrowserWindow({
    width: 1e3,
    height: 700,
    show: true,
    webPreferences: {
      preload: (0, import_path.join)(__dirname, "preload.js"),
      nodeIntegration: false,
      // セキュリティのためNode.js統合を無効化
      contextIsolation: true
      // レンダラープロセスの分離を有効化
    },
    // プラットフォーム固有のウィンドウ装飾
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    skipTaskbar: false
  });
  mainWindow2.on("close", (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow2?.hide();
    }
  });
  mainWindow2.on("closed", () => {
    mainWindow2 = null;
  });
  if (import_utils.is.dev) {
    mainWindow2.loadURL("http://localhost:3000");
  } else {
    const port = await (0, import_get_port_please.getPort)({ portRange: [30011, 5e4] });
    mainWindow2.loadURL(`http://localhost:${port}`);
  }
  if (!isIPCInitialized) {
    initializeIPCHandlers(mainWindow2);
    isIPCInitialized = true;
  } else {
    updateMainWindowReference(mainWindow2);
  }
};
var showMainWindow = async () => {
  if (!mainWindow2 || mainWindow2.isDestroyed()) {
    await createWindow();
  } else {
    mainWindow2.show();
    mainWindow2.focus();
  }
};
import_electron3.app.whenReady().then(async () => {
  await createWindow();
  resetProjectStatuses();
  import_electron3.app.on("activate", async () => {
    if (import_electron3.BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    } else {
      await showMainWindow();
    }
  });
});
import_electron3.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron3.app.quit();
  }
});
import_electron3.app.on("before-quit", () => {
  isAppQuitting = true;
});
