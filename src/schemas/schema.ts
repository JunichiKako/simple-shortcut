import { z } from 'zod';

/**
 * プロジェクト登録・編集用バリデーションスキーマ
 *
 * 開発プロジェクトの情報を検証します。
 * ポート番号は1-65535の範囲で検証。
 */
export const projectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
  path: z.string().min(1, 'フォルダパスは必須です'),
  command: z.string().min(1, '起動コマンドは必須です'),
  port: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 65535;
    }, 'ポート番号は1-65535の範囲で入力してください'),
  description: z.string().optional(),
});

/**
 * クイックアクセスサイト登録・編集用バリデーションスキーマ
 *
 * WebサイトやローカルHTMLファイルのURL情報を検証します。
 * URLは標準的なhttp/https/file プロトコルに対応。
 */
export const quickAccessSiteSchema = z.object({
  name: z.string().min(1, 'サイト名は必須です'),
  url: z.string().url('有効なURLを入力してください'),
  description: z.string().optional(),
  icon: z
    .string()
    .url('有効なURLを入力してください')
    .optional()
    .or(z.literal('')),
});

// TypeScript型推論用のエクスポート
export type ProjectFormData = z.infer<typeof projectSchema>;
export type QuickAccessSiteFormData = z.infer<typeof quickAccessSiteSchema>;
