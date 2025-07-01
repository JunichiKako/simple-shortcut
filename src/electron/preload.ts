/**
 * Electron プリロードスクリプト
 *
 * このファイルは、メインプロセスとレンダラープロセス間の安全な通信を仲介します。
 * contextBridgeを使用して、セキュリティを保ちながらIPCによる機能へのアクセスを提供します。
 * これにより、window.electronAPIを通じて、Next.js側からElectronの機能へアクセス可能にします。
 */
import { AppConfig, IPCResponse, Project, QuickAccessSite, RunningServerInfo } from '@/types/type';
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('electronAPI', {
  // 設定関連
  getConfig: (): Promise<IPCResponse<AppConfig>> =>
    ipcRenderer.invoke('get-config'),

  // プロジェクト関連
  getProjects: (): Promise<IPCResponse<Project[]>> =>
    ipcRenderer.invoke('get-projects'),

  addProject: (
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IPCResponse<Project>> =>
    ipcRenderer.invoke('add-project', project),

  updateProject: (
    id: string,
    updates: Partial<Project>
  ): Promise<IPCResponse<Project>> =>
    ipcRenderer.invoke('update-project', id, updates),

  deleteProject: (id: string): Promise<IPCResponse<boolean>> =>
    ipcRenderer.invoke('delete-project', id),

  // フォルダ選択
  selectFolder: (): Promise<IPCResponse<string>> =>
    ipcRenderer.invoke('select-folder'),

  // サーバー管理関連
  startServer: (projectId: string): Promise<IPCResponse<{ port: number }>> =>
    ipcRenderer.invoke('start-server', projectId),

  stopServer: (projectId: string): Promise<IPCResponse<boolean>> =>
    ipcRenderer.invoke('stop-server', projectId),

  getRunningServers: (): Promise<IPCResponse<RunningServerInfo[]>> =>
    ipcRenderer.invoke('get-running-servers'),

  getServerLogs: (projectId: string): Promise<IPCResponse<string[]>> =>
    ipcRenderer.invoke('get-server-logs', projectId),

  // クイックアクセス関連
  addQuickAccessSite: (
    site: Omit<QuickAccessSite, 'id' | 'createdAt'>
  ): Promise<IPCResponse<QuickAccessSite>> =>
    ipcRenderer.invoke('add-quick-access-site', site),

  updateQuickAccessSite: (
    id: string,
    updates: Partial<QuickAccessSite>
  ): Promise<IPCResponse<QuickAccessSite>> =>
    ipcRenderer.invoke('update-quick-access-site', id, updates),

  deleteQuickAccessSite: (id: string): Promise<IPCResponse<boolean>> =>
    ipcRenderer.invoke('delete-quick-access-site', id),

  // システム関連
  openUrl: (url: string): Promise<IPCResponse<boolean>> =>
    ipcRenderer.invoke('open-url', url),
});

// TypeScript型定義
declare global {
  interface Window {
    electronAPI: {
      // 設定関連
      getConfig: () => Promise<IPCResponse<AppConfig>>;

      // プロジェクト関連
      getProjects: () => Promise<IPCResponse<Project[]>>;
      addProject: (
        project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
      ) => Promise<IPCResponse<Project>>;
      updateProject: (
        id: string,
        updates: Partial<Project>
      ) => Promise<IPCResponse<Project>>;
      deleteProject: (id: string) => Promise<IPCResponse<boolean>>;

      // フォルダ・ファイル関連
      selectFolder: () => Promise<IPCResponse<string>>;

      // サーバー管理
      startServer: (
        projectId: string
      ) => Promise<IPCResponse<{ port: number }>>;
      stopServer: (projectId: string) => Promise<IPCResponse<boolean>>;
      getRunningServers: () => Promise<IPCResponse<RunningServerInfo[]>>;
      getServerLogs: (projectId: string) => Promise<IPCResponse<string[]>>;

      // クイックアクセス関連
      addQuickAccessSite: (
        site: Omit<QuickAccessSite, 'id' | 'createdAt'>
      ) => Promise<IPCResponse<QuickAccessSite>>;
      updateQuickAccessSite: (
        id: string,
        updates: Partial<QuickAccessSite>
      ) => Promise<IPCResponse<QuickAccessSite>>;
      deleteQuickAccessSite: (id: string) => Promise<IPCResponse<boolean>>;

      // システム関連
      openUrl: (url: string) => Promise<IPCResponse<boolean>>;
    };
  }
}
