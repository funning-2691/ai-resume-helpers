// app/api/optimize/route.ts
import { NextResponse } from 'next/server';
import { saveResumeRecord } from '@/lib/db-sqlite';
import { analyzeJD, calculateMatchRate } from '@/lib/jdAnalyzer';

// 生成标题：岗位名称 + 优化强度
function generateTitle(jd: string, strength: string): string {
  // 从JD中提取岗位名称
  let jobTitle = '';
  const lines = jd.split('\n');
  
  // 常见岗位关键词列表
  const jobKeywords = [
    '产品', '前端', '后端', '运营', '测试', '开发', '设计', 
    '实习', '助理', '经理', '工程师', '分析师', '专员',
    '产品经理', '项目经理', 'UI', 'UX', '全栈', '大数据',
    '人工智能', '机器学习', '运维', '销售', '市场', 'HR'
  ];
  
  for (const line of lines) {
    for (const keyword of jobKeywords) {
      const match = line.match(new RegExp(`(${keyword}[\\w]*|${keyword})`));
      if (match && match[0].length >= 2) {
        jobTitle = match[0];
        break;
      }
    }
    if (jobTitle) break;
  }
  
  // 如果没提取到，取前15个字符
  if (!jobTitle && jd.length > 0) {
    jobTitle = jd.substring(0, 18).trim();
    if (jobTitle.length > 18) {
      jobTitle = jobTitle.substring(0, 15) + '...';
    }
  }
  
  // 强度映射
  const strengthMap: Record<string, string> = {
    '保守（保持原意）': '保守',
    '平衡（推荐）': '平衡',
    '激进（大幅优化）': '激进'
  };
  const strengthShort = strengthMap[strength] || '平衡';
  
  return `${jobTitle || '简历'} · ${strengthShort}`;
}

export async function POST(request: Request) {
  try {
    const { jd, resume, options } = await request.json();

    if (!jd || !resume) {
      return NextResponse.json(
        { error: '请提供JD和简历内容' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SILICONFLOW_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key未配置，请在.env.local中设置SILICONFLOW_API_KEY' },
        { status: 500 }
      );
    }

    // 从JD中提取关键信息
    const jdAnalysis = analyzeJD(jd);
    
    const systemPrompt = generateSystemPrompt(jdAnalysis, options);
    const userPrompt = generateUserPrompt(jd, resume, jdAnalysis, options);

    // 调用硅基流动API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: getTemperature(options?.strength),
        max_tokens: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API错误:', data);
      throw new Error(data.error?.message || `API错误: ${response.status}`);
    }

    const optimizedText = data.choices[0].message.content;
    
    // 计算匹配度
    const matchRate = calculateMatchRate(optimizedText, jdAnalysis.keywords);
    
    // 生成标题
    const title = generateTitle(jd, options?.strength || '平衡（推荐）');
    
    // 异步保存到数据库
    saveResumeRecord({
      jdText: jd,
      resumeText: resume,
      optimizedText: optimizedText,
      jobType: jdAnalysis.jobType,
      matchRate: matchRate,
      title: title,
    }).catch(err => console.error('保存历史记录失败:', err));

    // 如果需要高亮关键词
    let finalText = optimizedText;
    if (options?.highlightKeywords && jdAnalysis.keywords.length > 0) {
      finalText = highlightKeywordsInText(optimizedText, jdAnalysis.keywords);
    }

    return NextResponse.json({
      success: true,
      optimized: finalText,
      matchRate: matchRate,
    });

  } catch (error) {
    console.error('优化失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '优化过程出现错误' },
      { status: 500 }
    );
  }
}

// 根据优化强度设置温度参数
function getTemperature(strength: string): number {
  switch (strength) {
    case '保守（保持原意）':
      return 0.1;
    case '激进（大幅优化）':
      return 0.6;
    default:
      return 0.3;
  }
}

// 高亮关键词
function highlightKeywordsInText(text: string, keywords: string[]): string {
  let highlightedText = text;
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(keyword => {
    if (keyword.length < 2) return;
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '**$1**');
  });
  return highlightedText;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 生成系统提示词（通用版本）
function generateSystemPrompt(jdAnalysis: any, options?: any): string {
  const { jobType, keywords } = jdAnalysis;
  const strength = options?.strength || '平衡（推荐）';
  
  const baseInstruction = `你是一位专业的简历优化专家。

【核心原则】
1. 使用纯文本格式，不要使用任何Markdown符号（如#、*、-、**等）
2. 保持原有简历的基本结构（个人信息、教育背景、工作经历、项目经验、技能证书）
3. 不要虚构经历、技能或成果，只优化表达方式
4. 使用积极、专业的语言，多用行为动词（如"负责"改为"主导"、"参与"改为"核心参与"）
5. 成果尽可能量化（如"提升了30%效率"、"服务了1000+用户"）
6. 用STAR法则优化项目描述（情境→任务→行动→结果）`;

  let jobSpecificGuide = '';
  switch (jobType) {
    case 'product':
      jobSpecificGuide = `【产品岗侧重】用户需求分析、产品设计、跨部门协作、数据驱动决策、逻辑思维。将经历转化为"发现问题→解决问题"的产品视角。`;
      break;
    case 'frontend':
      jobSpecificGuide = `【前端岗侧重】技术栈(React/Vue/Angular)、页面性能优化、响应式设计、组件化开发、浏览器兼容性、用户体验。`;
      break;
    case 'backend':
      jobSpecificGuide = `【后端岗侧重】系统架构设计、数据库优化、API设计、高并发处理、微服务、缓存技术、安全性。`;
      break;
    case 'operation':
      jobSpecificGuide = `【运营岗侧重】用户增长、活动策划、数据分析、内容运营、社群管理、转化率提升。`;
      break;
    case 'design':
      jobSpecificGuide = `【设计岗侧重】设计工具(Figma/Sketch/PS)、用户体验、设计系统、视觉规范、交互逻辑。`;
      break;
    case 'test':
      jobSpecificGuide = `【测试岗侧重】测试用例设计、自动化测试、性能测试、缺陷管理、质量保障。`;
      break;
    case 'data':
      jobSpecificGuide = `【数据岗侧重】SQL、数据分析工具、数据可视化、数据挖掘、业务指标、报表开发。`;
      break;
    case 'intern':
      jobSpecificGuide = `【实习岗侧重】学习能力、执行力、团队协作、责任心、基础技能掌握。突出潜力和成长速度。`;
      break;
    default:
      jobSpecificGuide = `【通用侧重】突出与职位描述最匹配的经验和能力，用成果说话。`;
  }

  let strengthInstruction = '';
  switch (strength) {
    case '保守（保持原意）':
      strengthInstruction = '【强度】保守模式：小幅优化，主要修正语法和关键词匹配，保持原文结构。';
      break;
    case '激进（大幅优化）':
      strengthInstruction = '【强度】激进模式：可大幅改写，重新组织语言，突出亮点和成果，让表达更有冲击力。';
      break;
    default:
      strengthInstruction = '【强度】平衡模式：适度优化，保持原意基础上提升专业性和说服力。';
  }

  const keywordsHint = keywords.length > 0 
    ? `【JD关键词】请将以下关键词自然融入简历：${keywords.slice(0, 8).join('、')}`
    : '';

  return `${baseInstruction}

${jobSpecificGuide}

${strengthInstruction}

${keywordsHint}

【禁止事项】
- ❌ 严禁虚构：不要添加原始简历中不存在的数字（百分比、用户数、天数等）
- ❌ 严禁添加：不要添加JD或原始简历中没有的技能、证书、经历
- ❌ 严禁改动：不要改变原有的时间、公司名称、学校名称
- ❌ 严禁格式：不要使用SITUATION/TASK/RESULT等英文标签
- ✅ 保留原文：如果原始简历没有数据，就保持原样，不要编造
- ✅ 只做优化：只优化语言表达、修正语法、调整关键词

【输出要求】
直接输出优化后的简历，不要任何解释。如果不确定某个信息，保留原样。`;
}

// 生成用户提示词（通用版本）
function generateUserPrompt(jd: string, resume: string, jdAnalysis: any, options?: any): string {
  const { jobType, keywords } = jdAnalysis;
  
  const jobTypeMap: Record<string, string> = {
    product: '产品岗侧重用户需求和产品思维',
    frontend: '前端岗侧重技术栈和用户体验',
    backend: '后端岗侧重架构和性能',
    operation: '运营岗侧重增长和数据',
    design: '设计岗侧重视觉和用户体验',
    test: '测试岗侧重质量保障和自动化',
    data: '数据岗侧重SQL和数据分析能力',
    intern: '实习岗侧重学习能力和执行力',
  };
  
  const jobHint = jobTypeMap[jobType] 
    ? `\n\n【岗位提示】${jobTypeMap[jobType]}，请相应调整表述重点。`
    : '';

  const keywordsHint = keywords.length > 0 
    ? `\n\n【JD关键词】${keywords.slice(0, 10).join('、')}`
    : '';

  return `请根据以下职位描述，优化我的简历。

【职位描述】
${jd}
${keywordsHint}

【我的原始简历】
${resume}
${jobHint}

【优化要求】
1. 匹配JD中的关键词和技能要求
2. 用自然流畅的中文段落描述，不要使用任何标签（如"情境："、"任务："等）
3. 量化成果（有数据的地方尽量保留和优化）
4. 保持真实，不虚构经历
5. 直接返回优化后的简历，不要任何解释

请开始优化。`;
}