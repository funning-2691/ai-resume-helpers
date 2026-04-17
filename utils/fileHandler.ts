// 注意：这个文件现在只保留下载功能，PDF解析移到API路由
// 下载文本为文件
export function downloadAsFile(content: string, filename: string, format: 'txt' | 'doc' | 'pdf' = 'txt') {
  let blob: Blob;
  let extension = format;
  
  switch (format) {
    case 'doc':
      const docContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>优化简历</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 2cm; }
              h1 { color: #333; font-size: 24px; }
              h2 { color: #333; font-size: 20px; }
              h3 { color: #333; font-size: 18px; }
              p { line-height: 1.6; margin: 10px 0; }
              ul, ol { margin: 10px 0; padding-left: 30px; }
            </style>
          </head>
          <body>
            ${content.split('\n').map(line => {
              if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
              if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
              if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
              if (line.trim() === '') return '<br>';
              if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
              return `<p>${line}</p>`;
            }).join('\n')}
          </body>
        </html>
      `;
      blob = new Blob([docContent], { type: 'application/msword' });
      extension = 'doc';
      break;
    
    case 'pdf':
      blob = new Blob([content], { type: 'text/plain' });
      extension = 'txt';
      alert('PDF导出功能需要更专业的库，已保存为TXT格式');
      break;
    
    default:
      blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      extension = 'txt';
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}