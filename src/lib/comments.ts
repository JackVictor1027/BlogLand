import { ADMIN } from '@/config';
import { gh } from '@/lib/github';

export interface IssueThread {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  comments_count: number;
  body: string;
}

export interface IssueComment {
  id: number;
  body: string;
  created_at: string;
  user: string;
}

interface RawIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  comments: number;
  body: string | null;
  pull_request?: unknown;
}

/** 列出全部评论会话（utterances 为每篇文章创建的带 comment 标签的 Issue） */
export async function listThreads(): Promise<IssueThread[]> {
  const issues = await gh<RawIssue[]>(
    `/repos/${ADMIN.repo}/issues?state=all&per_page=100&labels=comment`
  );
  return issues
    .filter((i) => !i.pull_request)
    .map((i) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      created_at: i.created_at,
      comments_count: i.comments,
      body: i.body ?? '',
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** 某 Issue 下的全部评论 */
export async function listComments(issueNumber: number): Promise<IssueComment[]> {
  const comments = await gh<
    Array<{ id: number; body: string; created_at: string; user: { login?: string } | null }>
  >(`/repos/${ADMIN.repo}/issues/${issueNumber}/comments`);
  return comments
    .map((c) => ({
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      user: c.user?.login ?? '未知用户',
    }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** 编辑某条评论 */
export async function updateComment(commentId: number, body: string): Promise<void> {
  await gh(`/repos/${ADMIN.repo}/issues/comments/${commentId}`, {
    method: 'PATCH',
    body: { body },
  });
}

/** 删除某条评论 */
export async function deleteComment(commentId: number): Promise<void> {
  await gh(`/repos/${ADMIN.repo}/issues/comments/${commentId}`, { method: 'DELETE' });
}

/** 开启/关闭某个评论会话（对应文章的评论开关） */
export async function setThreadState(issueNumber: number, state: 'open' | 'closed'): Promise<void> {
  await gh(`/repos/${ADMIN.repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: { state },
  });
}
