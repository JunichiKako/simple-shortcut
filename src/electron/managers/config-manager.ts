import { AppConfig, Project, QuickAccessSite } from '@/types/type';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * アプリケーション設定管理モジュール
 *
 * プロジェクトとクイックアクセスサイトの設定ファイル管理を行います。
 * ユーザーデータの永続化、読み込み、更新機能を提供します。
 */
// 設定ファイルの保存場所を定義（ユーザーデータディレクトリ内）
const CONFIG_FILE_PATH = path.join(
  app.getPath('userData'),
  'simple-shortcut-config.json'
);

const DEFAULT_CONFIG: AppConfig = {
  projects: [],
  quickAccessSites: [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com',
      description: 'ソースコード管理',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'localhost-3000',
      name: 'localhost:3000',
      url: 'http://localhost:3000',
      description: '開発サーバー（よく使用）',
      createdAt: new Date().toISOString(),
    },
  ],
  version: '1.0.0',
};

/**
 * 設定ファイルを読み込む
 *
 * 設定ファイルが存在しない場合はデフォルト設定を作成して返します。
 */
export function loadConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const config = JSON.parse(configData);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error('設定ファイルの読み込みに失敗しました:', error);
  }

  saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

/**
 * 設定をファイルに保存する
 *
 * 設定ディレクトリが存在しない場合は自動で作成します。
 */
export function saveConfig(config: AppConfig): boolean {
  try {
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('設定ファイルの保存に失敗しました:', error);
    return false;
  }
}

/**
 * 新しいプロジェクトを追加する
 *
 * 一意のIDと作成日時を自動で設定し、設定ファイルに保存します。
 */
export function addProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Project {
  const config = loadConfig();

  const newProject: Project = {
    ...projectData,
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRunning: false,
  };

  config.projects.push(newProject);

  if (!saveConfig(config)) {
    throw new Error('設定の保存に失敗しました');
  }

  return newProject;
}

/**
 * プロジェクトの情報を更新する
 *
 * 更新日時を自動で設定し、変更を設定ファイルに保存します。
 */
export function updateProject(id: string, updates: Partial<Project>): Project {
  const config = loadConfig();
  const projectIndex = config.projects.findIndex(p => p.id === id);

  if (projectIndex === -1) {
    throw new Error('プロジェクトが見つかりません');
  }

  config.projects[projectIndex] = {
    ...config.projects[projectIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (!saveConfig(config)) {
    throw new Error('設定の保存に失敗しました');
  }

  return config.projects[projectIndex];
}

/**
 * プロジェクトを削除する
 *
 * 設定ファイルからプロジェクトを完全に削除します。
 */
export function deleteProject(id: string): boolean {
  const config = loadConfig();
  const initialLength = config.projects.length;
  config.projects = config.projects.filter(p => p.id !== id);

  if (config.projects.length === initialLength) {
    throw new Error('プロジェクトが見つかりません');
  }

  if (!saveConfig(config)) {
    throw new Error('設定の保存に失敗しました');
  }

  return true;
}

/**
 * 新しいクイックアクセスサイトを追加する
 *
 * 一意のIDと作成日時を自動で設定し、設定ファイルに保存します。
 */
export function addQuickAccessSite(
  siteData: Omit<QuickAccessSite, 'id' | 'createdAt'>
): QuickAccessSite {
  const config = loadConfig();

  const newSite: QuickAccessSite = {
    ...siteData,
    id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  config.quickAccessSites.push(newSite);

  if (!saveConfig(config)) {
    throw new Error('設定の保存に失敗しました');
  }

  return newSite;
}

/**
 * クイックアクセスサイトの情報を更新する
 */
export function updateQuickAccessSite(
  id: string,
  updates: Partial<QuickAccessSite>
): QuickAccessSite {
  const config = loadConfig();
  const siteIndex = config.quickAccessSites.findIndex(s => s.id === id);

  if (siteIndex === -1) {
    throw new Error('サイトが見つかりません');
  }

  config.quickAccessSites[siteIndex] = {
    ...config.quickAccessSites[siteIndex],
    ...updates,
  };

  if (!saveConfig(config)) {
    throw new Error('設定の保存に失敗しました');
  }

  return config.quickAccessSites[siteIndex];
}

/**
 * クイックアクセスサイトを削除する
 */
export function deleteQuickAccessSite(id: string): boolean {
  const config = loadConfig();
  const initialLength = config.quickAccessSites.length;
  config.quickAccessSites = config.quickAccessSites.filter(s => s.id !== id);

  if (config.quickAccessSites.length === initialLength) {
    throw new Error('サイトが見つかりません');
  }

  if (!saveConfig(config)) {
    throw new Error('設定の保存に失敗しました');
  }

  return true;
}

/**
 * プロジェクトの実行状態を更新する
 *
 * サーバー起動・停止時に呼び出され、設定ファイルに状態を保存します。
 */
export function updateProjectStatus(
  projectId: string,
  isRunning: boolean,
  port?: number
): void {
  try {
    const config = loadConfig();
    const projectIndex = config.projects.findIndex(p => p.id === projectId);

    if (projectIndex !== -1) {
      config.projects[projectIndex] = {
        ...config.projects[projectIndex],
        isRunning,
        ...(port && { port }),
        updatedAt: new Date().toISOString(),
      };
      saveConfig(config);
    }
  } catch (error) {
    console.error('プロジェクトステータスの更新に失敗しました:', error);
  }
}

/**
 * 全プロジェクトの実行状態をリセットする
 *
 * アプリケーション起動時に呼び出し、前回の実行状態をクリアします。
 */
export function resetProjectStatuses(): void {
  try {
    const config = loadConfig();
    config.projects = config.projects.map(project => ({
      ...project,
      isRunning: false,
      updatedAt: new Date().toISOString(),
    }));
    saveConfig(config);
  } catch (error) {
    console.error('プロジェクトステータスのリセットに失敗しました:', error);
  }
}
