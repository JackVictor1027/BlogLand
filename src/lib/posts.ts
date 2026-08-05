import { ADMIN } from '@/config';
import { gh, encodePath, b64ToUtf8, utf8ToB64 } from '@/lib/github';
import { parsePost, stringifyPost, type PostData } from '@/lib/frontmatter';

export interface PostFile {
  /** 仓库内路径，如 src/content/posts/hello.md */
  path: string;
  /** 文件名，如 hello.md */
  name: string;
  /** 当前 sha（写入/删除必需） */
  sha: string;
  data: PostData;
  body: string;
}

export async function listPosts(): Promise<PostFile[]> {
  const items = await gh<Array<{ path: string; name: string; sha: string }>>(
    `/repos/${ADMIN.repo}/contents/${encodePath(ADMIN.postsDir)}`
  );
  const result: PostFile[] = [];
  for (const item of items) {
    if (!item.name.endsWith('.md')) continue;
    const file = await gh<{ content: string; sha: string }>(
      `/repos/${ADMIN.repo}/contents/${encodePath(item.path)}`
    );
    const raw = b64ToUtf8(file.content);
    const { data, body } = parsePost(raw);
    result.push({ path: item.path, name: item.name, sha: file.sha, data, body });
  }
  result.sort((a, b) => (b.data.date || '').localeCompare(a.data.date || ''));
  return result;
}

export async function getPostFile(path: string): Promise<PostFile> {
  const file = await gh<{ content: string; sha: string }>(
    `/repos/${ADMIN.repo}/contents/${encodePath(path)}`
  );
  const raw = b64ToUtf8(file.content);
  const { data, body } = parsePost(raw);
  return { path, name: path.split('/').pop() ?? path, sha: file.sha, data, body };
}

export async function savePost(path: string, data: PostData, body: string, existingSha?: string): Promise<void> {
  const content = utf8ToB64(stringifyPost(data, body));
  const message = existingSha ? `post: 更新《${data.title}》` : `post: 新建《${data.title}》`;
  await gh(`/repos/${ADMIN.repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    body: { message, content, ...(existingSha ? { sha: existingSha } : {}) },
  });
}

export async function deletePost(path: string, sha: string): Promise<void> {
  await gh(`/repos/${ADMIN.repo}/contents/${encodePath(path)}`, {
    method: 'DELETE',
    body: { message: 'post: 删除文章', sha },
  });
}

/** 由标题生成仓库路径：src/content/posts/{slug}.md */
export function postPathFromSlug(slug: string): string {
  return `${ADMIN.postsDir}/${slug}.md`;
}
