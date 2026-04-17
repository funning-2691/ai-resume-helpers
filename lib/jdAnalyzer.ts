// lib/jdAnalyzer.ts

// 分析JD，提取关键信息
export function analyzeJD(jd: string) {
  const jdLower = jd.toLowerCase();
  
  // 岗位类型识别
  let jobType = 'general';
  
  const jobPatterns: Record<string, string[]> = {
    product: ['产品', '产品经理', '产品助理', 'product manager', '产品运营', '产品设计', '需求分析'],
    frontend: ['前端', 'react', 'vue', 'angular', 'web前端', 'h5', '小程序', 'uniapp'],
    backend: ['后端', 'java', 'python', 'go', 'php', 'c++', 'node.js', 'spring', 'django', 'flask'],
    operation: ['运营', '用户运营', '内容运营', '活动运营', '社群运营', '增长', '新媒体'],
    design: ['设计', 'ui', 'ux', '交互设计', '视觉设计', 'figma', 'sketch', 'photoshop'],
    test: ['测试', '测试工程师', 'qa', '质量保证', '自动化测试', '性能测试'],
    devops: ['运维', 'devops', 'sre', 'k8s', 'docker', 'ci/cd', '云原生'],
    data: ['数据', '数据分析', '数据工程师', '数据挖掘', 'bi', 'sql', '数据仓库'],
    intern: ['实习', 'intern', '应届生', '校招', '管培生'],
    manager: ['经理', '主管', 'leader', '负责人', '总监', '管理'],
  };
  
  for (const [type, patterns] of Object.entries(jobPatterns)) {
    if (patterns.some(pattern => jdLower.includes(pattern))) {
      jobType = type;
      break;
    }
  }

  const keywords = extractKeywords(jd);
  const requirements = extractRequirements(jd);
  
  return { jobType, keywords, requirements };
}

// 提取关键词
function extractKeywords(jd: string): string[] {
  const allKeywords = [
    // 通用能力
    '经验', '项目', '团队', '沟通', '协调', '分析', '解决问题', 
    '学习能力', '创新', '责任心', '执行力', '抗压',
    // 技术技能
    'java', 'python', 'javascript', 'typescript', 'react', 'vue', 'angular',
    'node.js', 'spring', 'django', 'flask', 'mysql', 'postgresql', 'mongodb',
    'redis', 'docker', 'kubernetes', 'aws', 'git', 'jenkins', 'ci/cd',
    'html', 'css', 'sass', 'webpack', 'vite', 'next.js', 'nuxt',
    // 产品/运营
    '产品', '用户', '需求', 'prd', '原型', 'axure', 'figma', 'sketch',
    '数据', '分析', '增长', '转化', '留存', '活跃', 'a/b测试',
    '内容', '活动', '社群', '新媒体', '文案', '策划',
    // 管理
    '管理', '协调', '推进', '优化', '指标', 'okr', 'kpi',
    // 英语
    '英语', 'cet', '托福', '雅思', '留学',
  ];
  
  const jdLower = jd.toLowerCase();
  return allKeywords.filter(keyword => jdLower.includes(keyword.toLowerCase()));
}

// 提取要求列表
function extractRequirements(jd: string): string[] {
  const sentences = jd.split(/[。！？\n]/);
  const requirements: string[] = [];
  
  const requirementIndicators = ['要求', '负责', '熟悉', '掌握', '具备', '有', '本科', '硕士', '学历', '专业'];
  
  for (const sentence of sentences) {
    if (requirementIndicators.some(ind => sentence.includes(ind))) {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 5 && cleanSentence.length < 100) {
        requirements.push(cleanSentence);
      }
    }
  }
  
  return requirements.slice(0, 8);
}

// 计算匹配度
export function calculateMatchRate(resume: string, keywords: string[]): number {
  if (!resume || keywords.length === 0) return 50;
  
  const resumeLower = resume.toLowerCase();
  let matchCount = 0;
  
  keywords.forEach(keyword => {
    if (keyword.length >= 2 && resumeLower.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });
  
  const rate = 50 + Math.min(45, Math.floor((matchCount / Math.max(1, keywords.length)) * 45));
  return Math.min(95, Math.max(40, rate));
}