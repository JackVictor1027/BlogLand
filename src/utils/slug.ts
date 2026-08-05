/**
 * 文章 slug 生成：中文标题默认转为中文 slug（去除标点/空格，拉丁部分转小写），
 * 可在文章 frontmatter 显式指定 slug 覆盖。
 */
export function slugify(title: string): string {
  return title
    .normalize('NFC')
    .trim()
    .replace(
      /[\s，。！？、；：""''（）《》【】！·…—–‘’“”,.:;!?()\[\]{}+=_\\/@#$%^&*~`|<>]+/g,
      '-'
    )
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/** 取文章最终 slug：优先 frontmatter 的 slug，否则由标题生成 */
export function getEffectiveSlug(slug?: string, title?: string): string {
  if (slug && slug.trim()) return slug.trim();
  return slugify(title ?? '');
}
