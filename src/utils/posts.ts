import { getCollection, type CollectionEntry } from 'astro:content';
import { getEffectiveSlug } from '@/utils/slug';

export type Post = CollectionEntry<'posts'>;

/** 取文章最终 slug（frontmatter slug 优先，否则标题生成） */
export function getPostSlug(post: Post): string {
  return getEffectiveSlug(post.data.slug, post.data.title);
}

/** 已发布文章，按日期倒序 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 按 slug 查找已发布文章 */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((p) => getPostSlug(p) === slug);
}

/** 聚合全部标签及使用次数 */
export async function getAllTags(): Promise<Array<{ name: string; count: number }>> {
  const posts = await getPublishedPosts();
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}
