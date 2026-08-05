import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

/** 客户端 Markdown 渲染（管理端预览用，与浏览端 Astro 渲染保持一致观感） */
export function renderMarkdown(src: string): string {
  return marked.parse(src) as string;
}
