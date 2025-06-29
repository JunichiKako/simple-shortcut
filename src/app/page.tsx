'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuickAccessTab from '@/components/quick-access-tab';

/**
 * ホームページのメインコンポーネント
 *
 * ローカル開発サーバー管理アプリケーションのメイン画面を提供します。
 * プロジェクト管理、実行中サーバー表示、クイックアクセス機能の
 * 3つのタブを切り替えて表示します。
 */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    'projects' | 'running' | 'quickaccess'
  >('projects');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white">
        <div className="px-6 py-8 sm:pt-12">
          <div className="relative flex items-center justify-center">
            {/* アプリケーションタイトル部分 */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-zinc-100 border rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡️</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Simple Shortcut
                </h1>
                <p className="text-sm text-gray-500">
                  ローカル開発サーバー管理
                </p>
              </div>
            </div>

            {/* 右上の閉じるボタン */}
            <div className="absolute right-0 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.close()}
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={value =>
          setActiveTab(value as 'projects' | 'running' | 'quickaccess')
        }
        className="bg-zinc-100"
      >
        {/* タブナビゲーション */}
        <nav className="bg-white border-b border-gray-200">
          <TabsList className="grid w-full gap-20 px-6 grid-cols-3 py-0 bg-transparent h-auto rounded-none">
            <TabsTrigger
              value="projects"
              className="py-4 px-1 data-[state=active]:shadow-none border-0 border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 rounded-none text-gray-400"
            >
              <span className="mr-2">🚀</span>
              プロジェクト
            </TabsTrigger>
            <TabsTrigger
              value="running"
              className="py-4 px-1 data-[state=active]:shadow-none border-0 border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 rounded-none text-gray-400"
            >
              <span className="mr-2">🟢</span>
              実行中
            </TabsTrigger>
            <TabsTrigger
              value="quickaccess"
              className="py-4 px-1 data-[state=active]:shadow-none border-0 border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 rounded-none text-gray-400"
            >
              <span className="mr-2">⚡</span>
              クイックアクセス
            </TabsTrigger>
          </TabsList>
        </nav>

        {/* メインコンテンツ */}
        <main className="p-6 px-12 bg-zinc-100">
          <TabsContent value="projects" className="mt-0">
            このあと作成
          </TabsContent>
          <TabsContent value="running" className="mt-0">
            このあと作成
          </TabsContent>
          <TabsContent value="quickaccess" className="mt-0">
            <QuickAccessTab />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
