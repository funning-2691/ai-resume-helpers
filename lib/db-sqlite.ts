// lib/db-sqlite.ts
import db from './sqlite';

export interface ResumeRecord {
  id?: number | string;
  jdText: string;
  resumeText: string;
  optimizedText: string;
  jobType?: string;
  matchRate?: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 保存优化记录
export async function saveResumeRecord(record: Omit<ResumeRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const stmt = db.prepare(`
      INSERT INTO resume_history (jd_text, resume_text, optimized_text, job_type, match_rate, title)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      record.jdText,
      record.resumeText,
      record.optimizedText,
      record.jobType || null,
      record.matchRate || null,
      record.title || ''
    );
    
    console.log('✅ 保存成功，ID:', result.lastInsertRowid);
    return { success: true, id: result.lastInsertRowid };
    
  } catch (error) {
    console.error('❌ 保存失败:', error);
    return { success: false, error };
  }
}

// 获取所有历史记录
export async function getResumeHistory(limit: number = 50) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM resume_history 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const records = stmt.all(limit);
    
    const formattedRecords = (records as any[]).map((record) => ({
      id: record.id,
      jdText: record.jd_text,
      resumeText: record.resume_text,
      optimizedText: record.optimized_text,
      jobType: record.job_type,
      matchRate: record.match_rate,
      title: record.title || '',
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));
    
    return { success: true, records: formattedRecords };
    
  } catch (error) {
    console.error('获取失败:', error);
    return { success: false, error, records: [] };
  }
}

// 获取单条记录
export async function getResumeRecordById(id: number) {
  try {
    const stmt = db.prepare('SELECT * FROM resume_history WHERE id = ?');
    const record = stmt.get(id) as any;
    
    if (!record) {
      return { success: false, error: '记录不存在' };
    }
    
    return {
      success: true,
      record: {
        id: record.id,
        jdText: record.jd_text,
        resumeText: record.resume_text,
        optimizedText: record.optimized_text,
        jobType: record.job_type,
        matchRate: record.match_rate,
        title: record.title || '',
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      }
    };
    
  } catch (error) {
    console.error('获取失败:', error);
    return { success: false, error };
  }
}

// 删除记录
export async function deleteResumeRecord(id: number) {
  try {
    const stmt = db.prepare('DELETE FROM resume_history WHERE id = ?');
    const result = stmt.run(id);
    return { success: true, deletedCount: result.changes };
  } catch (error) {
    console.error('删除失败:', error);
    return { success: false, error };
  }
}

// 更新记录标题
export async function updateRecordTitle(id: number, title: string) {
  try {
    const stmt = db.prepare('UPDATE resume_history SET title = ? WHERE id = ?');
    stmt.run(title, id);
    return { success: true };
  } catch (error) {
    console.error('更新标题失败:', error);
    return { success: false, error };
  }
}