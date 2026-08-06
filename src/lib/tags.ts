import { listPosts, savePost } from '@/lib/posts';

export interface TagInfo {
  name: string;
  count: number;
}

/** 聚合全部标签及使用次数（按次数降序，中文名排序） */
export async function getAllTags(): Promise<TagInfo[]> {
  const posts = await listPosts();
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

/** 重命名标签：改写所有使用该标签的文章，返回受影响篇数 */
export async function renameTag(oldName: string, newName: string): Promise<number> {
  const target = newName.trim();
  if (!target || target === oldName) return 0;
  const posts = await listPosts();
  let changed = 0;
  for (const post of posts) {
    if (post.data.tags.includes(oldName)) {
      const tags = post.data.tags.map((t) => (t === oldName ? target : t));
      await savePost(post.path, { ...post.data, tags }, post.body, post.sha);
      changed++;
    }
  }
  return changed;
}

/** 删除标签：从所有文章中移除，返回受影响篇数 */
export async function deleteTag(name: string): Promise<number> {
  const posts = await listPosts();
  let changed = 0;
  for (const post of posts) {
    if (post.data.tags.includes(name)) {
      const tags = post.data.tags.filter((t) => t !== name);
      await savePost(post.path, { ...post.data, tags }, post.body, post.sha);
      changed++;
    }
  }
  return changed;
}
