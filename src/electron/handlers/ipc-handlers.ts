/**
 * IPC通信ハンドラー
 *
 * Electronのメインプロセスとレンダラープロセス間の通信を処理します。
 * プロジェクト管理、サーバー制御、システム機能へのアクセスを提供します。
 */
import { ipcMain, dialog, shell } from 'electron';
import { BrowserWindow } from 'electron';
import {
  loadConfig,
  addProject,
  updateProject,
  deleteProject,
  addQuickAccessSite,
  updateQuickAccessSite,
  deleteQuickAccessSite,
} from '../managers/config-manager';
import {
  wrapIPCHandler,
  createSuccessResponse,
  createErrorResponse,
} from '../utils/error-handling';
import { Project, QuickAccessSite } from '@/types/type';

let mainWindow: BrowserWindow | null = null;
let isInitialized = false; // IPCハンドラーの初期化状態を追跡

/**
 * IPCハンドラーを初期化する
 *
 * アプリケーション起動時に一度だけ呼び出され、
 * 全てのIPC通信エンドポイントを設定します。
 */
export function initializeIPCHandlers(window: BrowserWindow): void {
  mainWindow = window;

  // 初回のみIPCハンドラーを設定
  if (!isInitialized) {
    setupAllHandlers();
    isInitialized = true;
  }
}

/**
 * メインウィンドウの参照を更新する（IPCハンドラーは再初期化しない）
 */
export function updateMainWindowReference(window: BrowserWindow): void {
  mainWindow = window;
}

/**
 * 全てのIPCハンドラーを設定する
 *
 * 機能別にハンドラーをグループ分けして初期化します。
 */
function setupAllHandlers(): void {
  setupProjectHandlers();
  setupQuickAccessHandlers();
  setupUtilityHandlers();
}

/**
 * プロジェクト管理関連のIPCハンドラーを設定する
 *
 * プロジェクトの追加・更新・削除とアプリケーション設定の管理を行います。
 */
function setupProjectHandlers(): void {
  // アプリケーション設定全体の取得
  ipcMain.handle(
    'get-config',
    wrapIPCHandler(async () => {
      return loadConfig();
    })
  );

  // 登録済みプロジェクト一覧の取得
  ipcMain.handle(
    'get-projects',
    wrapIPCHandler(async () => {
      const config = loadConfig();
      return config.projects;
    })
  );

  // 新しいプロジェクトの追加
  ipcMain.handle(
    'add-project',
    wrapIPCHandler(
      async (
        _: unknown,
        project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
      ) => {
        return addProject(project);
      }
    )
  );

  // プロジェクト更新
  ipcMain.handle(
    'update-project',
    wrapIPCHandler(
      async (_: unknown, id: string, updates: Partial<Project>) => {
        return updateProject(id, updates);
      }
    )
  );

  // プロジェクト削除
  ipcMain.handle(
    'delete-project',
    wrapIPCHandler(async (_: unknown, id: string) => {
      return deleteProject(id);
    })
  );
}

/**
 * クイックアクセス機能のIPCハンドラーを設定する
 *
 * よく使用するウェブサイトの管理機能を提供します。
 */
function setupQuickAccessHandlers(): void {
  // 新しいクイックアクセスサイトの追加
  ipcMain.handle(
    'add-quick-access-site',
    wrapIPCHandler(
      async (_: unknown, site: Omit<QuickAccessSite, 'id' | 'createdAt'>) => {
        return addQuickAccessSite(site);
      }
    )
  );

  // クイックアクセスサイト更新
  ipcMain.handle(
    'update-quick-access-site',
    wrapIPCHandler(
      async (_: unknown, id: string, updates: Partial<QuickAccessSite>) => {
        return updateQuickAccessSite(id, updates);
      }
    )
  );

  // クイックアクセスサイト削除
  ipcMain.handle(
    'delete-quick-access-site',
    wrapIPCHandler(async (_: unknown, id: string) => {
      return deleteQuickAccessSite(id);
    })
  );
}

/**
 * システム機能のIPCハンドラーを設定する
 *
 * ファイルダイアログやブラウザ起動などのOS機能へのアクセスを提供します。
 */
function setupUtilityHandlers(): void {
  // フォルダ選択ダイアログ
  ipcMain.handle('select-folder', async () => {
    try {
      if (!mainWindow) {
        return createErrorResponse('メインウィンドウが見つかりません');
      }

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'プロジェクトフォルダを選択',
        buttonLabel: '選択',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return createErrorResponse('フォルダが選択されませんでした');
      }

      return createSuccessResponse(result.filePaths[0]);
    } catch (error) {
      return createErrorResponse(error);
    }
  });

  // ブラウザでURLを開く
  ipcMain.handle(
    'open-url',
    wrapIPCHandler(async (_: unknown, url: string) => {
      await shell.openExternal(url);
      return true;
    })
  );
}
