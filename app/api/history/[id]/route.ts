// app/api/history/[id]/route.ts
import { NextResponse } from 'next/server';
import { getResumeRecordById, deleteResumeRecord } from '@/lib/db-sqlite';

// ✅ Next.js 15+ 的写法：params 是 Promise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;  // ✅ 需要 await
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }
    
    const result = await getResumeRecordById(idNum);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        record: result.record,
      });
    } else {
      return NextResponse.json(
        { error: result.error || '记录不存在' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// ✅ DELETE 也要同样修改
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }
    
    const result = await deleteResumeRecord(idNum);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '删除成功',
      });
    } else {
      return NextResponse.json(
        { error: result.error || '删除失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}