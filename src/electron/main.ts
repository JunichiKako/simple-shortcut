import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { getPort } from 'get-port-please';
import { is } from '@electron-toolkit/utils';
import { resetProjectStatuses } from './managers/config-manager';
import { initializeIPCHandlers, updateMainWindowReference } from './handlers/ipc-handlers';


// アプリケーションの状態管理
let mainWindow: BrowserWindow | null = null;
let isAppQuitting = false; // アプリ終了フラグ（ウィンドウを閉じてもバックグラウンドで動作）
let isIPCInitialized = false; // IPCハンドラーの初期化状態を追跡

/**
 * メインウィンドウを作成する
 *
 * Electronのメインウィンドウを作成し、Next.jsアプリケーションを読み込みます。
 * 開発環境では開発サーバーに接続し、本番環境では内部サーバーを起動します。
 */
const createWindow = async () => {
  // 既存のウィンドウが存在し、破壊されていない場合は再利用
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false, // セキュリティのためNode.js統合を無効化
      contextIsolation: true, // レンダラープロセスの分離を有効化
    },
    // プラットフォーム固有のウィンドウ装飾
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    skipTaskbar: false,
  });

  // バックグラウンド動作を実現：ウィンドウを閉じてもアプリを終了させない
  mainWindow.on('close', event => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // ウィンドウが破壊された時の処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 環境に応じたNext.jsアプリケーションの読み込み
  if (is.dev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // 本番環境での処理...
    const port = await getPort({ portRange: [30011, 50000] });
    // Next.jsサーバー起動処理
    mainWindow.loadURL(`http://localhost:${port}`);
  }

  // IPCハンドラーの初期化または参照更新
  // 初回起動時は初期化、再作成時は参照のみ更新
  if (!isIPCInitialized) {
    initializeIPCHandlers(mainWindow);
    isIPCInitialized = true;
  } else {
    updateMainWindowReference(mainWindow);
  }
};

/**
 * ウィンドウを安全に表示する
 *
 * ウィンドウが破壊されている場合は新しいウィンドウを作成します。
 */
const showMainWindow = async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    await createWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
};

// Electronアプリケーションの初期化処理
app.whenReady().then(async () => {
  await createWindow();

  // アプリ起動時にプロジェクトの実行状態をリセット
  resetProjectStatuses();

  // macOSでのアプリアクティベーション処理
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    } else {
      await showMainWindow();
    }
  });
});

// プラットフォーム別のアプリ終了処理
app.on('window-all-closed', () => {
  // macOS以外では全ウィンドウが閉じられたらアプリを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリ終了時の処理
app.on('before-quit', () => {
  isAppQuitting = true;
});
