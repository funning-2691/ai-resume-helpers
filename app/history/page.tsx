// app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HistoryRecord {
  id: number;
  jdText: string;
  resumeText: string;
  optimizedText: string;
  jobType: string;
  matchRate: number;
  createdAt: string;
  title: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      // 兼容两种返回格式
      const recordsList = Array.isArray(data) ? data : (data.records || []);
      setRecords(recordsList);
    } catch (error) {
      console.error('获取历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未知时间';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getMatchColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 获取简短的预览文本
  const getPreview = (text: string, maxLen: number = 80) => {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg"></div>
              <span className="font-semibold text-xl text-slate-800">AI简历助手</span>
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
              ← 返回优化
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">历史记录</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-slate-400">暂无历史记录，先去优化一份简历吧</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              开始优化 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧历史列表 */}
            <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto">
              {records.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedRecord?.id === record.id
                    ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                    : 'bg-white border border-slate-200 hover:shadow-md hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  {/* ✅ 修改这里：显示 title 而不是 #{id} */}
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
                    {record.title || `记录 #${record.id}`}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMatchColor(record.matchRate || 50)}`}>
                    匹配 {record.matchRate || 0}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {formatDate(record.createdAt)}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {getPreview(record.jdText || '', 50)}
                </p>
              </button>
            ))}
          </div>

            {/* 右侧详情展开区 */}
            <div className="lg:col-span-2">
              {selectedRecord ? (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-700">优化详情</h2>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      收起
                    </button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* JD内容 */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        职位描述
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {selectedRecord.jdText || '无'}
                      </div>
                    </div>

                    {/* 原始简历 */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                        原始简历
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {selectedRecord.resumeText || '无'}
                      </div>
                    </div>

                    {/* 优化结果 */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        优化结果
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto border border-green-100">
                        {selectedRecord.optimizedText || '无'}
                      </div>
                    </div>

                    {/* 底部操作按钮 */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecord.optimizedText || '');
                          alert('已复制到剪贴板');
                        }}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        复制优化结果
                      </button>
                      <Link
                        href="/"
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        继续优化
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-slate-400">点击左侧任意记录，查看完整内容</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}