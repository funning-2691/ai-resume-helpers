// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import DownloadButton from '@/components/DownloadButton';
import SafeMarkdown from '@/components/SafeMarkdown';
import Link from 'next/link';
import { saveToLocalHistory } from '@/lib/localHistory';

export default function Home() {
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentMatchRate, setCurrentMatchRate] = useState(0);
  const [keywordCount, setKeywordCount] = useState(0);
  const [historySaveFailed, setHistorySaveFailed] = useState(false);

  // 加载保存的数据
  useEffect(() => {
    const savedJD = localStorage.getItem('jdText');
    const savedResume = localStorage.getItem('resumeText');
    const savedOptimized = localStorage.getItem('optimizedText');
    
    if (savedJD) setJdText(savedJD);
    if (savedResume) setResumeText(savedResume);
    if (savedOptimized) setOptimizedText(savedOptimized);
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('jdText', jdText);
  }, [jdText]);

  useEffect(() => {
    localStorage.setItem('resumeText', resumeText);
  }, [resumeText]);

  useEffect(() => {
    localStorage.setItem('optimizedText', optimizedText);
  }, [optimizedText]);

  // 生成本地历史标题：取JD第一个非空行并截取18字，取不到用"未命名岗位"
  const buildLocalTitle = (jd: string): string => {
    if (!jd) return '未命名岗位';
    const firstLine = jd
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0);
    if (!firstLine) return '未命名岗位';
    return firstLine.length > 18 ? firstLine.slice(0, 18) + '...' : firstLine;
  };

  // 复制功能
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedText || '暂无优化结果');
      setCopySuccess('复制成功！');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      setCopySuccess('复制失败');
    }
  };

  const handleOptimize = async () => {
    if (!jdText || !resumeText) {
      alert('请填写JD和简历内容');
      return;
    }

    setIsOptimizing(true);
    setOptimizedText('AI正在优化中，请稍候...');
    setCurrentMatchRate(0);
    setKeywordCount(0);
    
    try {
      // 获取高级选项的值
      const strengthSelect = document.querySelector('select') as HTMLSelectElement;
      const optimizationStrength = strengthSelect?.value || '平衡（推荐）';
      
      const highlightCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const highlightKeywords = highlightCheckbox?.checked || false;
      
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jd: jdText,
          resume: resumeText,
          options: {
            strength: optimizationStrength,
            highlightKeywords: highlightKeywords
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      const finalText = data.optimized || data.result || '优化失败，请重试';
      setOptimizedText(finalText);
      setCurrentMatchRate(data.matchRate || 0);
      setKeywordCount(data.keywordCount || 0);

      // API 成功后保存本地历史（仅当前浏览器）
      const saveResult = saveToLocalHistory({
        title: buildLocalTitle(jdText),
        matchScore: data.matchRate || 0,
        keywordCount: data.keywordCount || 0,
        optimizedResume: finalText,
      });

      setHistorySaveFailed(!saveResult.success);
    } catch (error) {
      console.error('优化失败:', error);
      setHistorySaveFailed(false);
      setOptimizedText('优化失败，请稍后重试。错误信息：' + (error as Error).message);
      setCurrentMatchRate(0);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg"></div>
              <span className="font-semibold text-xl text-slate-800">AI简历助手</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/history" 
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                历史记录
              </Link>
              
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ${
                  isOptimizing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isOptimizing ? '优化中...' : '开始优化'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          
          {/* 左侧输入区 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                输入信息
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* JD输入框 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center justify-between">
                  <span>职位描述 (JD)</span>
                  <span className="text-xs text-slate-400">{jdText.length} 字符</span>
                </label>
                
                <FileUpload 
                  onFileContent={(content) => setJdText(content)}
                  label="上传JD文件"
                />
                
                <textarea 
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"
                  placeholder="或者直接粘贴JD内容..."
                />
              </div>

              {/* 简历输入框 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center justify-between">
                  <span>个人简历</span>
                  <span className="text-xs text-slate-400">{resumeText.length} 字符</span>
                </label>
                
                <FileUpload 
                  onFileContent={(content) => setResumeText(content)}
                  label="上传简历文件"
                />
                
                <textarea 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-48 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"
                  placeholder="或者直接粘贴简历内容..."
                />
              </div>

              {/* 高级选项 */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">高级选项</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">优化强度</span>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm" defaultValue="平衡（推荐）">
                      <option>保守（保持原意）</option>
                      <option>平衡（推荐）</option>
                      <option>激进（大幅优化）</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span className="text-sm">匹配关键词高亮</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧结果区 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                优化结果
              </h2>
              <div className="flex items-center gap-2 relative">
                <DownloadButton content={optimizedText} filename="优化简历" />
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors relative"
                  title="复制"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                {copySuccess && (
                  <span className="absolute -top-1 right-12 text-sm bg-green-100 text-green-600 px-2 py-1 rounded whitespace-nowrap">
                    {copySuccess}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* 岗位关键词覆盖率指示器 - 基于原始简历计算 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">岗位关键词覆盖率</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {keywordCount > 0 ? `${currentMatchRate}%` : '暂无可计算关键词'}
                  </span>
                </div>
                {keywordCount > 0 ? (
                  <>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${currentMatchRate}%` }}
                      ></div>
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

              {historySaveFailed && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                  结果已生成，但历史记录保存失败
                </div>
              )}

              {/* 优化后的简历内容 */}
              <div className="prose prose-sm max-w-none">
                {optimizedText ? (
                  <div className="bg-white rounded-lg p-4 prose prose-slate max-w-none">
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs leading-relaxed">
                      AI 生成结果仅供参考，请人工核对后再投递使用。
                    </div>
                    <SafeMarkdown text={optimizedText} />
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-8 text-center">
                    <p className="text-slate-400">
                      {'在左侧输入JD和简历，点击"开始优化"生成结果'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}