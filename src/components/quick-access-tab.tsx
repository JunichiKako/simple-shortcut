'use client';

import { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QuickAccessForm from './forms/quick-access-form';
import { QuickAccessSite } from '@/types/type';

/**
 * クイックアクセスタブのメインコンポーネント
 *
 * よく使うWebサイトやローカルファイルへのショートカット機能を提供します。
 * SWRを使用してサイトデータの自動同期とキャッシュ管理を行います。
 */
export default function QuickAccessTab() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSite, setEditingSite] = useState<QuickAccessSite | null>(null);

  // クイックアクセスサイトデータを取得・管理
  const {
    data: sites = [],
    error,
    isLoading,
    mutate,
  } = useSWR('quickAccessSites', async () => {
    const response = await window.electronAPI.getConfig();
    if (!response.success) {
      throw new Error(response.error || 'サイトの読み込みに失敗しました');
    }
    return response.data?.quickAccessSites || [];
  });

  /**
   * サイトの更新後に実行されるハンドラー
   * フォームの非表示とSWRデータの再取得を行う
   */
  const handleSiteUpdate = () => {
    setShowAddForm(false);
    setEditingSite(null);
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
   * クイックアクセスサイト削除処理
   * ユーザー確認後にElectronAPI経由で削除を実行
   */
  async function handleSiteDelete(id: string) {
    if (!confirm('このサイトを削除しますか？')) return;

    try {
      const response = await window.electronAPI.deleteQuickAccessSite(id);
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
        <h2 className="text-lg font-medium text-gray-900">クイックアクセス</h2>
        <Button onClick={() => setShowAddForm(true)}>サイトを追加</Button>
      </div>

      {/* サイト追加・編集フォーム */}
      {(showAddForm || editingSite) && (
        <QuickAccessForm
          site={editingSite}
          onSave={handleSiteUpdate}
          onCancel={() => {
            setShowAddForm(false);
            setEditingSite(null);
          }}
        />
      )}

      {/* サイト一覧表示 */}
      {sites.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              クイックアクセスサイトがありません
            </h3>
            <p className="text-gray-500 mb-4">
              よく使うサイト（GitHub、Vercel、Netlifyなど）や
              <br />
              ローカルHTMLファイル（file://プロトコル）を登録して、
              <br />
              トレイメニューから素早くアクセスできます。
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              最初のサイトを追加
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map(site => (
            <QuickAccessCard
              key={site.id}
              site={site}
              onEdit={() => setEditingSite(site)}
              onDelete={() => handleSiteDelete(site.id)}
              onOpen={() => window.electronAPI.openUrl(site.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * クイックアクセスサイトをカード形式で表示
 *
 * 個別サイトの表示とファビコン取得を担当します。
 * Googleファビコンサービスを利用してサイトアイコンを動的に取得します。
 */
function QuickAccessCard({
  site,
  onEdit,
  onDelete,
  onOpen,
}: {
  site: QuickAccessSite;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  // ファビコン画像の読み込みエラー状態の管理
  const [faviconError, setFaviconError] = useState(false);

  /**
   * URLからファビコンURLを生成
   * GoogleのファビコンサービスAPIを使用して外部サイトのアイコンを取得
   */
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // カスタムアイコンまたは自動取得したファビコンを使用
  const faviconUrl = site.icon || getFaviconUrl(site.url);

  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* ファビコン表示（エラー時は代替アイコンを表示） */}
            {faviconUrl && !faviconError ? (
              <Image
                src={faviconUrl}
                alt=""
                width={24}
                height={24}
                className="rounded"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs">
                🌐
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{site.name}</h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {site.url}
              </p>
            </div>
          </div>

          {/* 編集・削除ボタン */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-1 h-auto text-gray-400 hover:text-blue-600"
              aria-label="編集"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="p-1 h-auto text-gray-400 hover:text-red-600"
              aria-label="削除"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {site.description && (
          <p className="text-xs text-gray-600 mb-3">{site.description}</p>
        )}

        <Button
          onClick={onOpen}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="sm"
        >
          開く
        </Button>
      </CardContent>
    </Card>
  );
}
