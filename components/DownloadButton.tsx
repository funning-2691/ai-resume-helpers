import { useState } from 'react';
import { downloadAsFile } from '@/utils/fileHandler';

interface DownloadButtonProps {
  content: string;
  filename?: string;
  className?: string;
}

export default function DownloadButton({ 
  content, 
  filename = '优化简历', 
  className = '' 
}: DownloadButtonProps) {
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleDownload = (format: 'txt' | 'doc' | 'pdf') => {
    downloadAsFile(content, filename, format);
    setShowFormatMenu(false);
  };

  if (!content) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
        title="下载"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {showFormatMenu && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowFormatMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleDownload('txt')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="w-6 text-slate-400">📄</span>
                文本文件 (.txt)
              </button>
              <button
                onClick={() => handleDownload('doc')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="w-6 text-slate-400">📝</span>
                Word文档 (.doc)
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="w-6 text-slate-400">📕</span>
                PDF文件 (.pdf)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}