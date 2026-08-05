import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    /** 文章标题 */
    title: z.string(),
    /** 摘要（缺省时自动截取正文） */
    description: z.string().optional(),
    /** URL slug（缺省用标题生成中文 slug） */
    slug: z.string().optional(),
    /** 发布日期 */
    date: z.coerce.date(),
    /** 更新日期 */
    updated: z.coerce.date().optional(),
    /** 标签 */
    tags: z.array(z.string()).default([]),
    /** 封面图相对路径 */
    cover: z.string().optional(),
    /** 草稿标记（true 时不渲染到浏览端） */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
