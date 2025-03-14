/**
 * 進捗記録機能のカスタムエラークラス
 * メッセージ、エラーコード、エラーが発生したフィールド名を保持する
 */
export class ProgressError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ProgressError';
  }
}
