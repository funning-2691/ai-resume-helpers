// app/api/parse-file/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    const fileType = file.name.split('.').pop()?.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';

    switch (fileType) {
      // 暂时注释掉 PDF 解析
      // case 'pdf': {
      //   return NextResponse.json(
      //     { error: 'PDF解析功能正在优化中，请使用Word或TXT格式' },
      //     { status: 400 }
      //   );
      // }
      
      case 'doc':
      case 'docx': {
        try {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } catch (wordError) {
          console.error('Word解析错误:', wordError);
          throw new Error('Word文件解析失败');
        }
        break;
      }
      
      case 'txt':
        text = buffer.toString('utf-8');
        break;
      
      default:
        return NextResponse.json(
          { error: '不支持的文件格式，请上传 Word 或 TXT 文件（PDF暂不支持）' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      text: text || '', 
      fileName: file.name 
    });

  } catch (error) {
    console.error('文件解析失败:', error);
    return NextResponse.json(
      { 
        error: '文件解析失败: ' + (error instanceof Error ? error.message : '未知错误'),
        details: String(error)
      },
      { status: 500 }
    );
  }
}