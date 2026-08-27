// 本地历史记录管理（仅浏览器 localStorage，客户端专用）

const STORAGE_KEY = 'ai-resume-helper:history:v1';
const MAX_RECORDS = 10;

export interface LocalHistoryRecord {
  id: string;
  createdAt: string;
  title: string;
  matchScore: number;
  keywordCount?: number;
  optimizedResume: string;
}

/**
 * 校验记录结构是否合法，损坏记录应被忽略
 */
function isValidRecord(value: unknown): value is LocalHistoryRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.title === 'string' &&
    typeof record.matchScore === 'number' &&
    Number.isFinite(record.matchScore) &&
    (record.keywordCount === undefined ||
      (typeof record.keywordCount === 'number' && Number.isFinite(record.keywordCount))) &&
    typeof record.optimizedResume === 'string'
  );
}

/**
 * 读取全部历史记录（按时间倒序）。
 * 任何读取失败或内容损坏都不会抛出异常，返回空数组。
 */
export function getLocalHistory(): LocalHistoryRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // 运行时结构校验：只保留合法记录，损坏记录忽略
    const validRecords = parsed.filter(isValidRecord);

    // 按 createdAt 倒序，保证最新在前
    validRecords.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return validRecords.slice(0, MAX_RECORDS);
  } catch (error) {
    console.error('读取本地历史失败:', error);
    return [];
  }
}

/**
 * 写入一条记录（最新在前，最多保留 MAX_RECORDS 条）。
 * 写入失败时返回明确结果，不允许静默失败。
 */
export function saveToLocalHistory(
  record: Omit<LocalHistoryRecord, 'id' | 'createdAt'>
): { success: true; record: LocalHistoryRecord } | { success: false; error: unknown } {
  if (typeof window === 'undefined') {
    return { success: false, error: new Error('localStorage 只能在客户端访问') };
  }

  try {
    const existing = getLocalHistory();

    const newRecord: LocalHistoryRecord = {
      ...record,
      // 规范化 matchScore 为 0~100 的有限数字
      matchScore: normalizeMatchScore(record.matchScore),
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
    };

    if (!isValidRecord(newRecord)) {
      return { success: false, error: new Error('记录结构无效') };
    }

    const next = [newRecord, ...existing].slice(0, MAX_RECORDS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (writeError) {
      console.error('写入本地历史失败:', writeError);
      return { success: false, error: writeError };
    }

    return { success: true, record: newRecord };
  } catch (error) {
    console.error('保存本地历史失败:', error);
    return { success: false, error };
  }
}

/**
 * 删除单条记录
 */
export function deleteLocalHistory(id: string): { success: boolean; error?: unknown } {
  if (typeof window === 'undefined') {
    return { success: false, error: new Error('localStorage 只能在客户端访问') };
  }

  try {
    const existing = getLocalHistory();
    const filtered = existing.filter((record) => record.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (writeError) {
      console.error('删除本地历史失败:', writeError);
      return { success: false, error: writeError };
    }

    return { success: true };
  } catch (error) {
    console.error('删除本地历史失败:', error);
    return { success: false, error };
  }
}

/**
 * 清空全部记录
 */
export function clearLocalHistory(): { success: boolean; error?: unknown } {
  if (typeof window === 'undefined') {
    return { success: false, error: new Error('localStorage 只能在客户端访问') };
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('清空本地历史失败:', error);
    return { success: false, error };
  }
}

/**
 * 将 matchScore 规范化为 0~100 的有限数字
 */
function normalizeMatchScore(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(100, Math.max(0, Math.round(num)));
}