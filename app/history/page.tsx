// app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getLocalHistory,
  deleteLocalHistory,
  clearLocalHistory,
  type LocalHistoryRecord,
} from '@/lib/localHistory';

export default function HistoryPage() {
  const [records, setRecords] = useState<LocalHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<LocalHistoryRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const data = getLocalHistory();
      setRecords(data);
      // 若当前选中的记录已被删除，清除选中状态
      setSelectedRecord((current) =>
        current && !data.some((record) => record.id === current.id) ? null : current
      );
      setErrorMessage('');
    } catch (error) {
      console.error('获取历史失败:', error);
      setRecords([]);
      setErrorMessage('历史记录读取失败，请检查浏览器存储设置。');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未知时间';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '未知时间';
    return date.toLocaleString('zh-CN');
  };

  const getMatchColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 是否存在可计算关键词（历史记录中 keywordCount 为 0 或 undefined 时视为无可计算关键词）
  const hasKeywords = (record: LocalHistoryRecord) => (record.keywordCount ?? 0) > 0;

  // 获取简短的预览文本
  const getPreview = (text: string, maxLen: number = 80) => {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除这条记录吗？此操作无法撤销。')) return;
    const result = deleteLocalHistory(id);
    if (!result.success) {
      alert('删除失败，请重试。');
      return;
    }
    loadHistory();
  };

  const handleClearAll = () => {
    if (records.length === 0) return;
    if (!confirm('确定清空全部历史记录吗？此操作无法撤销。')) return;
    const result = clearLocalHistory();
    if (!result.success) {
      alert('清空失败，请重试。');
      return;
    }
    setSelectedRecord(null);
    loadHistory();
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800">历史记录</h1>
          {records.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              清空全部
            </button>
          )}
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
          历史记录仅保存在当前浏览器，清除浏览器数据后无法恢复，请勿在公共设备保存敏感信息。
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

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
                <div
                  key={record.id}
                  className={`w-full text-left p-4 rounded-xl transition-all relative ${
                    selectedRecord?.id === record.id
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                      : 'bg-white border border-slate-200 hover:shadow-md hover:border-blue-300'
                  }`}
                >
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="w-full text-left pr-8"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">
                        {record.title || '未命名岗位'}
                      </span>
                      {hasKeywords(record) ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMatchColor(record.matchScore || 0)}`}>
                          覆盖率 {record.matchScore || 0}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 bg-slate-100 whitespace-nowrap">
                          暂无可计算关键词
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {formatDate(record.createdAt)}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {getPreview(record.optimizedResume || '', 50)}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="删除该记录"
                    aria-label="删除该记录"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* 右侧详情展开区 */}
            <div className="lg:col-span-2">
              {selectedRecord ? (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-700">
                      {selectedRecord.title || '未命名岗位'}
                    </h2>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      收起
                    </button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* 岗位关键词覆盖率 */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        岗位关键词覆盖率
                      </h3>
                      {hasKeywords(selectedRecord) ? (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-blue-600">
                              {selectedRecord.matchScore || 0}%
                            </span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, selectedRecord.matchScore || 0))}%` }}
                              ></div>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                            仅反映岗位关键词在简历中的覆盖情况，不代表实际胜任程度或面试概率。
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          未从岗位描述中识别到可计算的关键词，无法计算覆盖率。
                        </p>
                      )}
                    </div>

                    {/* 优化结果 */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        优化结果
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto border border-green-100">
                        {selectedRecord.optimizedResume || '无'}
                      </div>
                    </div>

                    {/* 底部操作按钮 */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecord.optimizedResume || '');
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