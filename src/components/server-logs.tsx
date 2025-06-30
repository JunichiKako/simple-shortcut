'use client';

import useSWR from 'swr';

/**
 * サーバーログリアルタイム表示コンポーネント
 *
 * 指定されたプロジェクトIDのサーバーログを定期的に取得し、
 * ターミナル風のUIでリアルタイム表示します。
 */
export default function ServerLogs({ projectId }: { projectId: string }) {
  // ログデータを管理（高頻度更新＋重複制御でパフォーマンス最適化）
  const {
    data: logs = [],
    error,
    isLoading,
  } = useSWR(
    `serverLogs-${projectId}`,
    async () => {
      const response = await window.electronAPI.getServerLogs(projectId);
      if (!response.success) {
        throw new Error(response.error || 'ログの読み込みに失敗しました');
      }
      return response.data || [];
    },
    {
      refreshInterval: 5000, // 5秒間隔で自動更新（ログの新規出力を定期的に取得）
      dedupingInterval: 1000, // 1秒以内の重複リクエストを防ぐ（パフォーマンス最適化）
    }
  );

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 rounded text-sm text-red-600">
        ログの読み込みでエラーが発生しました
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        ログ読み込み中...
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-gray-900 rounded text-emerald-400 font-mono text-xs max-h-60 overflow-y-auto">
      {logs.length === 0 ? (
        <div className="text-gray-500">ログがありません</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap break-words">
            {log}
          </div>
        ))
      )}
    </div>
  );
}
