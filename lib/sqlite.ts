// lib/sqlite.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'resume_history.db');
const db = new Database(dbPath);

// 创建表（如果不存在）
db.exec(`
  CREATE TABLE IF NOT EXISTS resume_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jd_text TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    optimized_text TEXT NOT NULL,
    job_type TEXT,
    match_rate INTEGER,
    title TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 兼容旧表：如果没有title字段就添加
try {
  db.exec(`ALTER TABLE resume_history ADD COLUMN title TEXT DEFAULT ''`);
} catch (e) {
  // 字段已存在，忽略
}

export default db;