import clientPromise from './mongodb';

export interface ResumeRecord {
  _id?: string;
  jdText: string;
  resumeText: string;
  optimizedText: string;
  jobType?: string;
  matchRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 保存优化记录
export async function saveResumeRecord(record: Omit<ResumeRecord, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const client = await clientPromise;
    const db = client.db('ai-resume-helper');
    const collection = db.collection('resume_history');
    
    const now = new Date();
    const result = await collection.insertOne({
      ...record,
      createdAt: now,
      updatedAt: now,
    });
    
    return { success: true, id: result.insertedId };
  } catch (error) {
    console.error('保存记录失败:', error);
    return { success: false, error };
  }
}

// 获取所有历史记录
export async function getResumeHistory(limit: number = 50) {
  try {
    const client = await clientPromise;
    const db = client.db('ai-resume-helper');
    const collection = db.collection('resume_history');
    
    const records = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    return { success: true, records };
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return { success: false, error, records: [] };
  }
}

// 获取单条记录
export async function getResumeRecordById(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db('ai-resume-helper');
    const collection = db.collection('resume_history');
    const { ObjectId } = await import('mongodb');
    
    const record = await collection.findOne({ _id: new ObjectId(id) });
    
    return { success: true, record };
  } catch (error) {
    console.error('获取记录失败:', error);
    return { success: false, error };
  }
}

// 删除记录
export async function deleteResumeRecord(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db('ai-resume-helper');
    const collection = db.collection('resume_history');
    const { ObjectId } = await import('mongodb');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('删除记录失败:', error);
    return { success: false, error };
  }
}