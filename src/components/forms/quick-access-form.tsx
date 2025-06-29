'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { QuickAccessSite } from '@/types/type';
import { quickAccessSiteSchema } from '@/schemas/schema';


/**
 * クイックアクセスサイト登録・編集フォームコンポーネント
 *
 * WebサイトやローカルHTMLファイルへのクイックアクセス機能を提供します。
 * React Hook FormとZodを使用したバリデーション付きフォームです。
 */
export default function QuickAccessForm({
  site,
  onSave,
  onCancel,
}: {
  site?: QuickAccessSite | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // React Hook Formのセットアップ（Zodスキーマでバリデーション）
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quickAccessSiteSchema),
    defaultValues: {
      name: site?.name || '',
      url: site?.url || '',
      description: site?.description || '',
      icon: site?.icon || '',
    },
  });

  /**
   * フォーム送信処理
   *
   * 新規作成または更新処理を実行します。
   * Electron APIを通じてメインプロセスと通信を行います。
   */
  const onSubmit = async (data: {
    name: string;
    url: string;
    description?: string;
    icon?: string;
  }) => {
    setLoading(true);

    try {
      // フォームデータをクリーンアップして適切な形式に変換
      const siteData = {
        name: data.name.trim(),
        url: data.url.trim(),
        description: data.description?.trim(),
        icon: data.icon?.trim() || undefined,
      };

      // 編集モードと新規作成モードで異なるAPIを呼び出し
      let response;
      if (site) {
        response = await window.electronAPI.updateQuickAccessSite(
          site.id,
          siteData
        );
      } else {
        response = await window.electronAPI.addQuickAccessSite(siteData);
      }

      if (response.success) {
        onSave();
      } else {
        alert('保存に失敗しました: ' + response.error);
      }
    } catch {
      alert('保存中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">
          {site ? 'サイトを編集' : '新しいサイトを追加'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* サイト名 */}
          <div className="space-y-2">
            <Label htmlFor="site-name">サイト名 *</Label>
            <Input
              id="site-name"
              type="text"
              {...register('name')}
              className={errors.name ? 'border-red-300' : ''}
              placeholder="例: GitHub"
            />
            {errors.name && (
              <p className="text-red-600 text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="site-url">URL *</Label>
            <Input
              id="site-url"
              type="url"
              {...register('url')}
              className={errors.url ? 'border-red-300' : ''}
              placeholder="https://github.com または file:///path/to/file.html"
            />
            <p className="text-gray-500 text-xs">
              Webサイトの場合は https://、ローカルHTMLファイルの場合は file:///
              で始まるパスを入力
            </p>
            {errors.url && (
              <p className="text-red-600 text-xs">{errors.url.message}</p>
            )}
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="site-description">説明（オプション）</Label>
            <Input
              id="site-description"
              type="text"
              {...register('description')}
              placeholder="ソースコード管理"
            />
          </div>

          {/* カスタムアイコン */}
          <div className="space-y-2">
            <Label htmlFor="site-icon">アイコンURL（オプション）</Label>
            <Input
              id="site-icon"
              type="url"
              {...register('icon')}
              className={errors.icon ? 'border-red-300' : ''}
              placeholder="未指定時は自動でfaviconを取得"
            />
            {errors.icon && (
              <p className="text-red-600 text-xs">{errors.icon.message}</p>
            )}
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : site ? '更新' : '追加'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
