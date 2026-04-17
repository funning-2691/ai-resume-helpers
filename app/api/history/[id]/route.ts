import { NextResponse } from 'next/server';
import { getResumeRecordById, deleteResumeRecord } from '@/lib/db-sqlite';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }
    
    const result = await getResumeRecordById(id);
    
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }
    
    const result = await deleteResumeRecord(id);
    
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