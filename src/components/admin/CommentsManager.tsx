import { useCallback, useEffect, useState } from 'react';
import {
  listThreads,
  listComments,
  deleteComment,
  setThreadState,
  type IssueThread,
  type IssueComment,
} from '@/lib/comments';
import { btnGhost, btnDanger, btnSmall, btnSmallActive, cardCls } from '@/components/admin/ui';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false });
}

export default function CommentsManager() {
  const [threads, setThreads] = useState<IssueThread[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, IssueComment[]>>({});
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setThreads(await listThreads());
    } catch (e) {
      setError(`${(e as Error).message}（若为 403/404，请确认令牌具备 Issues 读写权限）`);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleThread(number: number) {
    if (expanded === number) {
      setExpanded(null);
      return;
    }
    setExpanded(number);
    try {
      const cs = await listComments(number);
      setComments((prev) => ({ ...prev, [number]: cs }));
    } catch (e) {
      setError((e as Error).message || '加载评论失败');
    }
  }

  async function handleDeleteComment(thread: IssueThread, comment: IssueComment) {
    if (!window.confirm('确定删除该评论？')) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      await deleteComment(comment.id);
      setComments((prev) => ({
        ...prev,
        [thread.number]: (prev[thread.number] ?? []).filter((c) => c.id !== comment.id),
      }));
      await load();
      setMsg('评论已删除');
    } catch (e) {
      setError((e as Error).message || '删除失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleState(thread: IssueThread) {
    const next = thread.state === 'open' ? 'closed' : 'open';
    setBusy(true);
    setError('');
    setMsg('');
    try {
      await setThreadState(thread.number, next);
      setThreads((prev) =>
        (prev ?? []).map((t) => (t.number === thread.number ? { ...t, state: next } : t))
      );
      setMsg(next === 'closed' ? `已关闭「${thread.title}」的评论` : `已重新开启「${thread.title}」的评论`);
    } catch (e) {
      setError((e as Error).message || '操作失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="font-black text-2xl uppercase tracking-wider mb-5">评论管理</h2>

      {msg && <p className="mb-4 text-sm text-riso-green-deep font-bold">{msg}</p>}
      {error && <p className="mb-4 text-sm text-riso-orange-deep font-bold">{error}</p>}

      {!threads && <p className="text-gray-600">加载中……</p>}

      {threads && threads.length === 0 && (
        <div className={cardCls}>
          <p className="text-gray-600">
            还没有评论会话（评论基于 utterances / GitHub Issues，文章有评论后会出现在这里）。
          </p>
        </div>
      )}

      {threads && threads.length > 0 && (
        <div className="space-y-3">
          {threads.map((thread) => (
            <div key={thread.number} className={cardCls}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-sm border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        thread.state === 'open'
                          ? 'border-riso-green text-riso-green-deep'
                          : 'border-riso-orange text-riso-orange-deep'
                      }`}
                    >
                      {thread.state === 'open' ? '开放' : '已关闭'}
                    </span>
                    <span className="font-bold text-base truncate">#{thread.number} {thread.title}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span>{thread.comments_count} 条评论</span>
                    <span>{fmtDate(thread.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className={expanded === thread.number ? btnSmallActive : btnSmall}
                    onClick={() => toggleThread(thread.number)}
                  >
                    {expanded === thread.number ? '收起' : '查看评论'}
                  </button>
                  <button className={btnGhost} onClick={() => handleToggleState(thread)} disabled={busy}>
                    {thread.state === 'open' ? '关闭评论' : '重新开启'}
                  </button>
                </div>
              </div>

              {expanded === thread.number && (
                <div className="mt-4 border-t-2 border-ink pt-4 space-y-3">
                  {(comments[thread.number] ?? []).length === 0 && (
                    <p className="text-sm text-gray-600">该会话暂无评论。</p>
                  )}
                  {(comments[thread.number] ?? []).map((c) => (
                    <div key={c.id} className="rounded-sm border-2 border-ink bg-paper p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold">{c.user}</span>
                        <span className="text-xs text-gray-600">{fmtDate(c.created_at)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{c.body}</p>
                      <div className="mt-2">
                        <button className={btnDanger} onClick={() => handleDeleteComment(thread, c)} disabled={busy}>
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
