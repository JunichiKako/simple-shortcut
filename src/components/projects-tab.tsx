'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ServerLogs from './server-logs';
import ProjectForm from './forms/project-form';
import { Project } from '@/types/type';

/**
 * プロジェクト管理タブのメインコンポーネント
 *
 * SWRを使用してプロジェクトデータの自動同期とキャッシュ管理を行い、
 * プロジェクトの一覧表示、追加、編集、削除、サーバー起動/停止機能を提供します。
 */
export default function ProjectsTab() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // SWRでプロジェクトデータを管理（自動キャッシュ・再取得・エラーハンドリング）
  const {
    data: projects = [],
    error,
    isLoading,
    mutate,
  } = useSWR('projects', async () => {
    const response = await window.electronAPI.getProjects();
    if (!response.success) {
      throw new Error(response.error || 'プロジェクトの読み込みに失敗しました');
    }
    return response.data || [];
  });

  /**
   * プロジェクトの更新後に実行されるハンドラー
   * フォームの非表示とSWRデータの再取得を行う
   */
  const handleProjectUpdate = () => {
    setShowAddForm(false);
    setEditingProject(null);
    mutate(); // SWRキャッシュを無効化して最新データを取得
  };

  if (error) {
    return (
      <div className="flex justify-center py-12 text-red-600">
        エラー: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-12">読み込み中...</div>;
  }

  /**
   * プロジェクト削除処理
   * ユーザー確認後にElectronAPI経由で削除を実行
   */
  async function handleProjectDelete(id: string) {
    if (!confirm('このプロジェクトを削除しますか？')) return;

    try {
      const response = await window.electronAPI.deleteProject(id);
      if (response.success) {
        mutate(); // 削除成功時にSWRデータを再取得
      } else {
        alert('削除に失敗しました: ' + response.error);
      }
    } catch (error) {
      alert('削除中にエラーが発生しました: ' + error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">プロジェクト一覧</h2>
        <Button onClick={() => setShowAddForm(true)}>
          新しいプロジェクトを追加
        </Button>
      </div>

      {/* プロジェクト追加・編集フォーム */}
      {(showAddForm || editingProject) && (
        <ProjectForm
          project={editingProject}
          onSave={handleProjectUpdate}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* プロジェクト一覧表示 */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📁</div>
              <CardTitle className="text-lg mb-2">
                プロジェクトが登録されていません
              </CardTitle>
              <p className="text-gray-500 mb-4">
                開発中のNext.js、React、Viteなどのプロジェクトを登録して、
                <br />
                ワンクリックでサーバーを起動できます。
                <br />
                <br />
                <span className="text-blue-600 font-medium">
                  💡
                  静的HTMLファイルの場合は「クイックアクセス」タブをご利用ください
                </span>
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                最初のプロジェクトを追加
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditingProject(project)}
              onDelete={() => handleProjectDelete(project.id)}
              onMutate={mutate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * プロジェクトカードコンポーネント
 *
 * 個別プロジェクトの詳細表示とサーバー操作（起動/停止）を担当します。
 * 楽観的UI更新のためにonMutateコールバックを使用してSWRデータを同期します。
 */
function ProjectCard({
  project,
  onEdit,
  onDelete,
  onMutate,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMutate: () => void;
}) {
  // サーバー操作中の状態管理（ユーザーフィードバック用）
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  /**
   * サーバー起動処理
   * 起動中の状態表示とエラーハンドリングを含む
   */
  const handleStartServer = async () => {
    setIsStarting(true);
    try {
      const response = await window.electronAPI.startServer(project.id);
      if (response.success) {
        onMutate(); // 起動成功時に親コンポーネントのデータを更新
      } else {
        alert('サーバー起動に失敗しました: ' + response.error);
      }
    } catch (error) {
      alert('サーバー起動中にエラーが発生しました: ' + error);
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * サーバー停止処理
   * 停止中の状態表示とエラーハンドリングを含む
   */
  const handleStopServer = async () => {
    setIsStopping(true);
    try {
      const response = await window.electronAPI.stopServer(project.id);
      if (response.success) {
        onMutate(); // 停止成功時に親コンポーネントのデータを更新
      } else {
        alert('サーバー停止に失敗しました: ' + response.error);
      }
    } catch (error) {
      alert('サーバー停止中にエラーが発生しました: ' + error);
    } finally {
      setIsStopping(false);
    }
  };

  /**
   * ブラウザでプロジェクトを開く
   * 設定されたポート番号でlocalhostアクセス
   */
  const handleOpenBrowser = async () => {
    const port = project.port || 3000;
    const url = `http://localhost:${port}`;
    await window.electronAPI.openUrl(url);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.isRunning && (
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                実行中
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={project.isRunning}
              className="text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50 disabled:opacity-50"
            >
              削除
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <div>
            <strong>パス:</strong> {project.path}
          </div>
          <div>
            <strong>コマンド:</strong>{' '}
            <code className="bg-gray-100 px-1 rounded">{project.command}</code>
          </div>
          {project.port && (
            <div>
              <strong>ポート:</strong> {project.port}
            </div>
          )}
          {project.description && (
            <div>
              <strong>説明:</strong> {project.description}
            </div>
          )}
        </div>

        {/* サーバー状態に応じた操作ボタン */}
        <div className="flex items-center space-x-2">
          {project.isRunning ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopServer}
                disabled={isStopping}
              >
                {isStopping ? '停止中...' : '停止'}
              </Button>
              <Button size="sm" onClick={handleOpenBrowser}>
                ブラウザで開く
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? 'ログを隠す' : 'ログを表示'}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleStartServer}
              disabled={isStarting}
              className="bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              {isStarting ? '起動中...' : '起動'}
            </Button>
          )}
        </div>

        {/* 実行中のサーバーのログ表示 */}
        {showLogs && project.isRunning && (
          <div className="mt-4">
            <Separator className="mb-4" />
            <ServerLogs projectId={project.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
