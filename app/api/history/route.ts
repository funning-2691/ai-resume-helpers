// app/api/history/route.ts
import { NextResponse } from 'next/server';
import { getResumeHistory } from '@/lib/db-sqlite';

export async function GET() {
  try {
    const result = await getResumeHistory(50);
    
    if (result.success && result.records) {
      // 直接返回数组，匹配前端期望
      return NextResponse.json(result.records);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json([]);
  }
}