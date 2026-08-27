// components/SafeMarkdown.tsx
// 安全的 Markdown 文本渲染组件：
// - 不使用 dangerouslySetInnerHTML，无 XSS 风险
// - 仅支持简历场景所需的基础格式：加粗、斜体、标题、列表、空行分隔
// - 所有内容均作为 React 文本节点渲染，不会执行任何 HTML

import { ReactNode } from 'react';

/** 将行内文本中的 **加粗** 与 *斜体* 安全渲染为 React 节点 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // 匹配 **加粗** 或 *斜体*，按顺序处理
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    // 匹配之前的普通文本
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-${index}`}>{token.slice(2, -2)}</strong>
      );
    } else {
      nodes.push(<em key={`${keyPrefix}-${index}`}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
    index++;
  }

  // 剩余普通文本
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/** 渲染一行文本，处理行内加粗/斜体 */
function renderLine(line: string, key: string): ReactNode {
  const trimmed = line.trim();

  // 标题：### / ## / #
  const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const content = headingMatch[2];
    const inline = renderInline(content, `${key}-heading`);
    switch (level) {
      case 1:
        return <h1 key={key}>{inline}</h1>;
      case 2:
        return <h2 key={key}>{inline}</h2>;
      default:
        return <h3 key={key}>{inline}</h3>;
    }
  }

  return <p key={key}>{renderInline(line, key)}</p>;
}

interface SafeMarkdownProps {
  text: string;
  className?: string;
}

export default function SafeMarkdown({ text, className = '' }: SafeMarkdownProps) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key}>
          {listItems.map((item, i) => (
            <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // 列表项：- 或 * 开头
    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      listItems.push(listMatch[1]);
      return;
    }

    // 非列表项：先结束进行中的列表
    flushList(`list-${listKey}`);
    listKey++;

    // 空行：跳过（用段落间距代替）
    if (trimmed === '') return;

    blocks.push(renderLine(line, `line-${i}`));
  });

  // 结尾有列表时也要刷新
  flushList(`list-final-${listKey}`);

  return <div className={`whitespace-pre-wrap ${className}`}>{blocks}</div>;
}