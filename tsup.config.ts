/**
 * TypeScript Build 設定（tsup）
 *
 * ElectronアプリのメインプロセスとプリロードスクリプトをTypeScriptからJavaScriptに
 * トランスパイルするためのtsup設定です。tsupは高速なTypeScriptビルドツールで、
 * esbuildベースの軽量なバンドラーです。
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  // コンパイル対象ファイル（Electronの2つの主要プロセス）
  entry: ['./electron/main.ts', './electron/preload.ts'],

  // ビルド成果物の出力ディレクトリ
  outDir: 'dist',

  // Node.js 18をターゲットにコンパイル（Electronが使用するNode.jsバージョンに合わせる）
  target: 'node18',

  // Node.js環境用にビルド（ブラウザ環境ではない）
  platform: 'node',

  // CommonJS形式で出力（ElectronのメインプロセスはCommonJSを使用）
  format: ['cjs'],

  // コード分割を無効化（Electronアプリでは単一ファイル出力が適している）
  splitting: false,

  // ソースマップを生成しない（プロダクションビルドの軽量化）
  sourcemap: false,

  // ビルド前に出力ディレクトリをクリーンアップ
  clean: true,

  // コードの最小化を無効化（デバッグしやすさを優先）
  minify: false,

  // Node.jsの組み込みモジュールをバンドルに含めない（パフォーマンス最適化）
  skipNodeModulesBundle: true,

  // Electronランタイムは外部依存として扱う（バンドルサイズ削減）
  external: ['electron'],
});
