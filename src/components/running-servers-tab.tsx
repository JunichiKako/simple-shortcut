'use client';

import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import ServerLogs from './server-logs';

/**
 * 実行中サーバー監視タブのメインコンポーネント
 *
 * SWRの自動更新機能を使用して、実行中のサーバー状態をリアルタイムで監視し、
 * 一元的なサーバー管理機能（停止、ブラウザアクセス、ログ表示）を提供します。
 */
export default function RunningServersTab() {
  // SWRで実行中サーバーデータを管理（3秒間隔でリアルタイム監視）
  const {
    data: runningServers = [],
    error,
    isLoading,
    mutate,
  } = useSWR(
    'runningServers',
    async () => {
      const response = await window.electronAPI.getRunningServers();
      if (!response.success) {
        throw new Error(
          response.error || '実行中サーバーの読み込みに失敗しました'
        );
      }
      return response.data || [];
    },
    {
      refreshInterval: 3000, // 3秒間隔で自動更新（サーバー状態の変化を即座に反映）
    }
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">実行中のサーバー</h2>
        <div className="text-sm text-gray-500">
          {runningServers.length} 個のサーバーが実行中
        </div>
      </div>

      {runningServers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              実行中のサーバーはありません
            </h3>
            <p className="text-gray-500">
              プロジェクトタブからサーバーを起動してください
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {runningServers.map(server => (
            <div
              key={server.projectId}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {server.projectName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>ポート:</strong> {server.port} |
                    <strong> 状態:</strong>{' '}
                    {/* サーバー状態に応じた色分け表示 */}
                    <span
                      className={`font-medium ${
                        server.status === 'running'
                          ? 'text-emerald-600'
                          : server.status === 'starting'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {server.status}
                    </span>{' '}
                    |<strong> 開始:</strong>{' '}
                    {new Date(server.startedAt).toLocaleString()}
                  </p>
                </div>

                {/* サーバー操作ボタン */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() =>
                      window.electronAPI.openUrl(
                        `http://localhost:${server.port}`
                      )
                    }
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    ブラウザで開く
                  </Button>
                  <Button
                    onClick={async () => {
                      const response = await window.electronAPI.stopServer(
                        server.projectId
                      );
                      if (response.success) {
                        mutate(); // 停止成功時にSWRデータを即座に更新
                      }
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    停止
                  </Button>
                </div>
              </div>

              {/* リアルタイムログ表示 */}
              <ServerLogs projectId={server.projectId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
