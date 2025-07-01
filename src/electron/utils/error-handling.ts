import { IPCResponse } from "@/types/type";


/**
 * エラーレスポンスを作成するヘルパー関数
 */
export const createErrorResponse = <T = never>(
  error: unknown
): IPCResponse<T> => ({
  success: false,
  error: error instanceof Error ? error.message : String(error),
});

/**
 * 成功レスポンスを作成するヘルパー関数
 */
export const createSuccessResponse = <T>(data: T): IPCResponse<T> => ({
  success: true,
  data,
});

/**
 * 非同期関数をIPCレスポンス形式でラップするヘルパー関数
 */
export const wrapIPCHandler = <T, Args extends unknown[]>(
  handler: (...args: Args) => Promise<T>
) => {
  return async (...args: Args): Promise<IPCResponse<T>> => {
    try {
      const data = await handler(...args);
      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
};
