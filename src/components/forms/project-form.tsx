'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Project } from '@/types/type';
import { projectSchema } from '@/schemas/schema';


/**
 * プロジェクト登録・編集フォームコンポーネント
 *
 * 開発プロジェクトの登録・編集機能を提供します。
 * React Hook FormとZodを使用したバリデーション付きフォームです。
 */
export default function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project?: Project | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // React Hook Formのセットアップ（Zodスキーマでバリデーション）
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      path: project?.path || '',
      command: project?.command || '',
      port: project?.port?.toString() || '',
      description: project?.description || '',
    },
  });

  /**
   * フォルダ選択ダイアログを開く
   *
   * Electron APIを使用してネイティブのフォルダ選択ダイアログを表示し、
   * 選択されたパスをフォームのpathフィールドに設定します。
   */
  const handleSelectFolder = async () => {
    try {
      const response = await window.electronAPI.selectFolder();
      if (response.success && response.data) {
        setValue('path', response.data);
      }
    } catch (error) {
      alert('フォルダ選択中にエラーが発生しました: ' + error);
    }
  };

  /**
   * フォーム送信処理
   *
   * 新規作成または更新処理を実行します。
   * Electron APIを通じてメインプロセスと通信を行います。
   */
  const onSubmit = async (data: {
    name: string;
    path: string;
    command: string;
    port?: string;
    description?: string;
  }) => {
    setLoading(true);

    try {
      // フォームデータを適切な型に変換
      const projectData = {
        name: data.name.trim(),
        path: data.path.trim(),
        command: data.command.trim(),
        port: data.port ? Number(data.port) : undefined,
        description: data.description?.trim(),
      };

      // 編集モードと新規作成モードで異なるAPIを呼び出し
      let response;
      if (project) {
        response = await window.electronAPI.updateProject(
          project.id,
          projectData
        );
      } else {
        response = await window.electronAPI.addProject(projectData);
      }

      if (response.success) {
        onSave();
      } else {
        alert('保存に失敗しました: ' + response.error);
      }
    } catch (error) {
      alert('保存中にエラーが発生しました: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">
          {project ? 'プロジェクトを編集' : '新しいプロジェクトを追加'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* プロジェクト名 */}
          <div className="space-y-2">
            <Label htmlFor="project-name">プロジェクト名 *</Label>
            <Input
              id="project-name"
              type="text"
              {...register('name')}
              className={errors.name ? 'border-red-300' : ''}
              placeholder="例: My Blog App"
            />
            {errors.name && (
              <p className="text-red-600 text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* フォルダパス */}
          <div className="space-y-2">
            <Label htmlFor="project-path">フォルダパス *</Label>
            <div className="flex space-x-2">
              <Input
                id="project-path"
                type="text"
                {...register('path')}
                className={`flex-1 ${errors.path ? 'border-red-300' : ''}`}
                placeholder="プロジェクトフォルダのパス"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectFolder}
              >
                選択
              </Button>
            </div>
            {errors.path && (
              <p className="text-red-600 text-xs">{errors.path.message}</p>
            )}
          </div>

          {/* 起動コマンド */}
          <div className="space-y-2">
            <Label htmlFor="project-command">起動コマンド *</Label>
            <Input
              id="project-command"
              type="text"
              {...register('command')}
              className={`font-mono ${errors.command ? 'border-red-300' : ''}`}
              placeholder="例: npm run dev, npm start"
            />
            <p className="text-gray-500 text-xs">
              ※
              静的HTMLファイルの場合は、プロジェクト登録ではなく「クイックアクセス」機能で
              file:// プロトコルを使用してください
            </p>
            {errors.command && (
              <p className="text-red-600 text-xs">{errors.command.message}</p>
            )}
          </div>

          {/* ポート番号 */}
          <div className="space-y-2">
            <Label htmlFor="project-port">ポート番号（オプション）</Label>
            <Input
              id="project-port"
              type="number"
              {...register('port')}
              className={`w-32 ${errors.port ? 'border-red-300' : ''}`}
              placeholder="3000"
              min="1"
              max="65535"
            />
            <p className="text-gray-500 text-xs">
              未指定時は自動で利用可能なポートを選択
            </p>
            {errors.port && (
              <p className="text-red-600 text-xs">{errors.port.message}</p>
            )}
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="project-description">説明（オプション）</Label>
            <Textarea
              id="project-description"
              {...register('description')}
              placeholder="プロジェクトの説明"
              rows={3}
            />
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
              {loading ? '保存中...' : project ? '更新' : '追加'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
