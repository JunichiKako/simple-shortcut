/**
 * ローカルプロジェクト設定の型定義
 *
 * ローカル開発サーバーを起動するプロジェクトの情報を表します。
 * 各プロジェクトは名前、パス、起動コマンドを持ち、
 * オプションでポート番号や説明を設定できます。
 */
export type Project = {
  id: string;
  name: string;
  path: string; // プロジェクトフォルダの絶対パス
  command: string; // 起動コマンド（例: npm run dev）
  port?: number;
  description?: string;
  isRunning?: boolean; // 実行状態（ランタイムで設定）
  createdAt: string;
  updatedAt: string;
};

/**
 * クイックアクセスサイトの型定義
 *
 * WebサイトやローカルHTMLファイルへのショートカット情報を表します。
 */
export type QuickAccessSite = {
  id: string;
  name: string;
  url: string; // http/https/file プロトコル対応
  description?: string;
  icon?: string; // favicon URL（自動取得）
  createdAt: string;
};

/**
 * アプリケーション設定ファイル全体の型定義
 *
 * JSONファイルとして保存される設定データの構造を定義します。
 * プロジェクト一覧とクイックアクセスサイト一覧を含みます。
 */
export type AppConfig = {
  projects: Project[];
  quickAccessSites: QuickAccessSite[];
  version: string; // 設定ファイルのバージョン
};

/**
 * 実行中サーバー情報の型定義
 *
 * 現在実行中の開発サーバーの状態を表します。
 * ログ情報やポート番号、起動時刻などを含みます。
 */
export type RunningServerInfo = {
  projectId: string;
  projectName: string;
  port: number;
  status: string; // running, stopped, error など
  startedAt: string;
  logs: string[]; // サーバーのログ出力
};

/**
 * IPC通信用レスポンス型
 *
 * IPC通信で使用されるレスポンス型を定義します。
 * 成功/失敗の状態とデータ、エラーメッセージを含みます。
 */
export type IPCResponse<T = unknown> = {
  success: boolean;
  data?: T; // 成功時のレスポンスデータ
  error?: string; // 失敗時のエラーメッセージ
};
