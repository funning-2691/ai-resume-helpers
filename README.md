# 📄 AI简历助手 (AI Resume Helper)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> 🚀 一个帮助求职者针对目标岗位优化简历内容的 AI 工具。

## ✨ 项目简介

**AI简历助手** 让用户输入目标岗位描述（JD）和个人简历，调用大模型生成优化后的简历文本，并基于 JD 关键词计算简历的关键词覆盖率，帮助用户快速了解简历与岗位的文字覆盖情况。

> **项目特点**：开箱即用 | 数据本地优先 | 事实保真 | 免费开源

## 🎯 核心特性

| 功能 | 描述 |
| :--- | :--- |
| ✍️ **AI 简历优化** | 输入岗位描述与简历，AI 以"事实保真"为最高原则调整表达与顺序，不虚构经历。 |
| 📊 **关键词覆盖率** | 基于 JD 提取关键词，计算简历的关键词覆盖率（0-100%），并提示该指标仅供参考。 |
| 🕒 **本地历史记录** | 自动保存最近 10 条优化结果到浏览器 localStorage，支持查看、删除与清空。 |
| 📁 **结果导出** | 一键复制，或下载为 TXT / Word 格式。 |
| 📄 **文件上传** | 支持上传 .txt / .docx 文件自动解析文本。 |
| 🔒 **数据隐私** | 历史记录仅保存在当前浏览器，不涉及登录与云端数据库。 |

## 📦 快速开始

### 本地运行

1. **克隆项目**
   ```bash
   git clone https://github.com/funning-2691/ai-resume-helpers.git
   cd ai-resume-helpers
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 AI 接口**
   - 在项目根目录创建 `.env.local` 文件
   - 添加 API 密钥：
     ```env
     SILICONFLOW_API_KEY=你自己的密钥
     ```
   - 本项目默认调用 SiliconFlow 的 OpenAI 兼容接口，模型为 `Qwen/Qwen3-8B`。

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

## 🧑‍💻 使用说明

### 如何优化简历

1. 在左侧"职位描述 (JD)"输入框中粘贴或上传岗位描述。
2. 在左侧"个人简历"输入框中粘贴或上传个人简历。
3. 可选设置"优化强度"（保守 / 平衡 / 激进）和"匹配关键词高亮"。
4. 点击右上角 **"开始优化"** 按钮。
5. 右侧显示 AI 优化结果、关键词覆盖率，以及"AI 生成结果仅供参考，请人工核对后再投递使用"的提示。

### 历史记录

- 每次优化成功后，结果会自动保存到当前浏览器的 localStorage（最多 10 条）。
- 访问"历史记录"页面可查看、删除单条或清空全部记录。
- 历史记录仅保存在当前浏览器，清除浏览器数据后将无法恢复。

### 关键词覆盖率说明

- 覆盖率 = 简历中命中的 JD 关键词数 ÷ JD 关键词总数。
- 该指标仅反映岗位关键词在简历文字中的覆盖情况，不代表实际胜任程度或面试概率。
- 当 JD 中无法识别到关键词时，页面显示"暂无可计算关键词"。

## 🧪 开发命令

```bash
npm run dev     # 启动开发服务器
npm run lint    # ESLint 检查
npm run build   # 生产构建
npm run start   # 启动生产服务器
```

## 🗂️ 技术栈

- **框架**：Next.js 16（App Router）
- **UI**：React 19 + Tailwind CSS 4
- **AI 接口**：SiliconFlow（OpenAI 兼容 API）
- **本地存储**：浏览器 localStorage（历史记录）
- **文件解析**：mammoth（Word）、原生文本（TXT）

## 🚫 暂未实现的功能

- PDF 上传 / 下载（当前只支持 Word 和 TXT）
- 登录与账号体系
- 云端数据库与跨设备同步
- 简历排版可视化编辑
- 多维度匹配算法（当前仅为关键词覆盖率）

## 🤝 贡献指南

我们欢迎任何形式的贡献：修复 bug、改进 UI、完善文档等。

1. **Fork 本仓库**
2. **克隆你的 fork** → `git clone https://github.com/你的用户名/ai-resume-helpers.git`
3. **创建新分支** → `git checkout -b feature/你的功能名称`
4. **提交修改** → `git commit -m 'feat: 添加xxx功能'`
5. **推送分支** → `git push origin feature/你的功能名称`
6. **发起 Pull Request (PR)**

## 📜 开源协议

本项目采用 **MIT 协议**，详见 [LICENSE](LICENSE) 文件。

## 📞 联系与支持

- 项目维护者：**funning-2691**
- GitHub Issue：[提交问题或建议](https://github.com/funning-2691/ai-resume-helpers/issues)
- 项目主页：[GitHub 仓库](https://github.com/funning-2691/ai-resume-helpers)

如果这个项目对你有所帮助，欢迎 ⭐️ Star 支持一下～