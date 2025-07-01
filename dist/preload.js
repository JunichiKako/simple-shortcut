"use strict";

// src/electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 設定関連
  getConfig: () => import_electron.ipcRenderer.invoke("get-config"),
  // プロジェクト関連
  getProjects: () => import_electron.ipcRenderer.invoke("get-projects"),
  addProject: (project) => import_electron.ipcRenderer.invoke("add-project", project),
  updateProject: (id, updates) => import_electron.ipcRenderer.invoke("update-project", id, updates),
  deleteProject: (id) => import_electron.ipcRenderer.invoke("delete-project", id),
  // フォルダ選択
  selectFolder: () => import_electron.ipcRenderer.invoke("select-folder"),
  // サーバー管理関連
  startServer: (projectId) => import_electron.ipcRenderer.invoke("start-server", projectId),
  stopServer: (projectId) => import_electron.ipcRenderer.invoke("stop-server", projectId),
  getRunningServers: () => import_electron.ipcRenderer.invoke("get-running-servers"),
  getServerLogs: (projectId) => import_electron.ipcRenderer.invoke("get-server-logs", projectId),
  // クイックアクセス関連
  addQuickAccessSite: (site) => import_electron.ipcRenderer.invoke("add-quick-access-site", site),
  updateQuickAccessSite: (id, updates) => import_electron.ipcRenderer.invoke("update-quick-access-site", id, updates),
  deleteQuickAccessSite: (id) => import_electron.ipcRenderer.invoke("delete-quick-access-site", id),
  // システム関連
  openUrl: (url) => import_electron.ipcRenderer.invoke("open-url", url)
});
