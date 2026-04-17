// 本地历史记录管理

export interface HistoryRecord {
  id: string;
  jdText: string;
  resumeText: string;
  optimizedText: string;
  jobType?: string;
  matchRate?: number;
  createdAt: string;
}

// 保存记录
export function saveToLocalHistory(record: Omit<HistoryRecord, 'id' | 'createdAt'>) {
  try {
    const history = getLocalHistory();
    const newRecord: HistoryRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    history.unshift(newRecord); // 最新记录放前面
    // 只保留最近 50 条
    const limitedHistory = history.slice(0, 50);
    
    localStorage.setItem('resume_history', JSON.stringify(limitedHistory));
    console.log('✅ 保存成功:', newRecord.id);
    return { success: true, record: newRecord };
  } catch (error) {
    console.error('保存失败:', error);
    return { success: false, error };
  }
}

// 获取所有历史记录
export function getLocalHistory(): HistoryRecord[] {
  try {
    const history = localStorage.getItem('resume_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('读取失败:', error);
    return [];
  }
}

// 删除单条记录
export function deleteLocalHistory(id: string): boolean {
  try {
    const history = getLocalHistory();
    const filtered = history.filter(record => record.id !== id);
    localStorage.setItem('resume_history', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('删除失败:', error);
    return false;
  }
}

// 清空所有记录
export function clearLocalHistory(): boolean {
  try {
    localStorage.removeItem('resume_history');
    return true;
  } catch (error) {
    console.error('清空失败:', error);
    return false;
  }
}