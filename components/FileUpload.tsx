import { useState, useRef } from 'react';

// 组件属性说明
interface FileUploadProps {
  // 当文件解析出文本内容时调用，传递解析后的字符串
  onFileContent: (content: string) => void;
  // 上传控件的文字标签（当前未在 UI 中使用，但保留以备扩展）
  label?: string;
  // 允许外部传入额外的 className，用于布局/样式定制
  className?: string;
}

/**
 * FileUpload 组件
 * - 支持点击选择或拖拽文件
 * - 将文件以 FormData POST 到 `/api/parse-file`，期望返回 JSON: { text: string }
 * - 当前只支持 Word（.doc/.docx）和 TXT，PDF 被临时禁用（在前端提示）
 */
export default function FileUpload({ onFileContent, label = '上传文件', className = '' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false); // 是否正在上传/解析
  const [fileName, setFileName] = useState<string>(''); // 当前文件名（用于展示）
  const [error, setError] = useState<string>(''); // 错误消息
  const fileInputRef = useRef<HTMLInputElement>(null); // 用于重置文件输入

  // 处理通过文件选择器上传的文件
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return; // 没有文件时直接返回

    // 根据扩展名判断类型（简单判断，不依赖MIME）
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    // 暂时禁用 PDF：前端提示用户将 PDF 转换为 Word 或复制粘贴内容
    if (fileType === 'pdf') {
      setError('暂时只支持 Word 和 TXT 格式，请先将 PDF 转换为 Word 或直接复制内容粘贴');
      // 重置文件输入，避免用户无法再次选择相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setError('');
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 将文件发送到后端解析接口
      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      // 这里先以文本方式读取响应以便更好地诊断非 JSON 响应
      const responseText = await response.text();
      console.log('服务器响应:', responseText);

      // 尝试解析 JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        // 抛出更明确的错误，包含服务器返回的前100字符以便调试
        throw new Error('服务器返回格式错误: ' + responseText.substring(0, 100));
      }

      // 非 2xx 响应时，从返回的 data 中提取错误信息
      if (!response.ok) {
        throw new Error(data.error || '解析失败');
      }

      // 校验后端必须返回的字段
      if (!data.text) {
        throw new Error('解析结果为空');
      }

      // 成功：将解析出的文本通过回调传出
      onFileContent(data.text);
      
    } catch (err) {
      console.error('文件上传失败:', err);
      setError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      setUploading(false);
      // 始终重置文件输入，允许用户再次选择相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 拖拽时阻止默认行为以允许 drop 事件触发
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理拖拽放下的文件（逻辑与选择上传类似，保持单文件处理）
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    // 同样在拖拽场景中禁止 PDF
    if (fileType === 'pdf') {
      setError('暂时只支持 Word 和 TXT 格式，请先将 PDF 转换为 Word 或直接复制内容粘贴');
      return;
    }

    setUploading(true);
    setError('');
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log('服务器响应:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        throw new Error('服务器返回格式错误: ' + responseText.substring(0, 100));
      }

      if (!response.ok) {
        throw new Error(data.error || '解析失败');
      }

      if (!data.text) {
        throw new Error('解析结果为空');
      }

      onFileContent(data.text);
      
    } catch (err) {
      console.error('文件拖拽上传失败:', err);
      setError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
          uploading 
            ? 'border-blue-300 bg-blue-50' 
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.doc,.docx"  // 去掉 .pdf，前端控件限制上传类型
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="text-center">
          {uploading ? (
            <div className="space-y-2">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-600">正在解析 {fileName}...</p>
            </div>
          ) : fileName && !error ? (
            <div className="space-y-1">
              <svg className="w-6 h-6 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-600">上传成功：{fileName}</p>
              <p className="text-xs text-slate-400">点击或拖拽更换文件</p>
            </div>
          ) : error ? (
            <div className="space-y-1">
              <svg className="w-6 h-6 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm font-medium text-red-600">{error}</p>
              <p className="text-xs text-slate-400">点击或拖拽重新上传</p>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-blue-600">点击上传</span> 或拖拽文件到此处
              </p>
              <p className="text-xs text-slate-400 mt-1">支持 Word、TXT 格式（PDF暂不支持）</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}