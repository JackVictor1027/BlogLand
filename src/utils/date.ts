/** zh-CN 日期格式化：2026年8月5日 */
const dateFmt = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(date: Date): string {
  return dateFmt.format(date);
}

/** 中文字符数 + 拉丁单词数 */
export function wordCount(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const latin = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return cjk + latin;
}

/** 阅读时长（分钟，按 300 字/分钟），最少 1 分钟 */
export function readingTime(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 300));
}
