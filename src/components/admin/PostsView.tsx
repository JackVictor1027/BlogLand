import { useCallback, useEffect, useState } from 'react';
import { listPosts, deletePost, savePost, type PostFile } from '@/lib/posts';
import { getEffectiveSlug } from '@/utils/slug';
import { btnPrimary, btnGhost, btnDanger, btnSmall, btnSmallActive, cardCls } from '@/components/admin/ui';

type Filter = 'all' | 'draft' | 'published';

export default function PostsView() {
  const [posts, setPosts] = useState<PostFile[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setPosts(await listPosts());
    } catch (e) {
      setError((e as Error).message || '加载失败');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(post: PostFile) {
    if (!window.confirm(`确定删除《${post.data.title}》？该操作会提交一次 git commit，可回滚。`)) return;
    setBusy(true);
    try {
      await deletePost(post.path, post.sha);
      await load();
    } catch (e) {
      setError((e as Error).message || '删除失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleDraft(post: PostFile) {
    setBusy(true);
    try {
      await savePost(
        post.path,
        { ...post.data, draft: !post.data.draft, updated: new Date().toISOString().slice(0, 10) },
        post.body,
        post.sha
      );
      await load();
    } catch (e) {
      setError((e as Error).message || '切换失败');
    } finally {
      setBusy(false);
    }
  }

  const shown = (posts ?? []).filter((p) => {
    if (filter === 'draft') return p.data.draft;
    if (filter === 'published') return !p.data.draft;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-black text-2xl uppercase tracking-wider">文章列表</h2>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as Filter[]).map((f) => (
            <button
              key={f}
              className={filter === f ? btnSmallActive : btnSmall}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'draft' ? '草稿' : '已发布'}
            </button>
          ))}
          <a href="#/posts/new" className={btnPrimary}>
            新建文章
          </a>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-riso-orange font-bold">{error}</p>}

      {!posts && <p className="text-gray-600">加载中……</p>}

      {posts && posts.length === 0 && (
        <div className={cardCls}>
          <p className="text-gray-600">仓库中还没有文章，点击右上角「新建文章」开始。</p>
        </div>
      )}

      {posts && posts.length > 0 && shown.length === 0 && (
        <div className={cardCls}>
          <p className="text-gray-600">当前筛选条件下没有文章。</p>
        </div>
      )}

      {shown.length > 0 && (
        <div className="space-y-3">
          {shown.map((post) => {
            const slug = getEffectiveSlug(post.data.slug, post.data.title);
            return (
              <div
                key={post.path}
                className={`${cardCls} flex flex-col sm:flex-row sm:items-center gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-sm border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        post.data.draft
                          ? 'border-riso-orange text-riso-orange'
                          : 'border-riso-green text-riso-green'
                      }`}
                    >
                      {post.data.draft ? '草稿' : '已发布'}
                    </span>
                    <a
                      href={`#/posts/${encodeURIComponent(slug)}`}
                      className="font-bold text-base md:text-lg hover:text-riso-blue hover:underline underline-offset-4"
                    >
                      {post.data.title || '(无标题)'}
                    </a>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span>{post.data.date || '未设置日期'}</span>
                    {post.data.tags.length > 0 && <span>标签：{post.data.tags.join('、')}</span>}
                    <span className="truncate">{post.path}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={`#/posts/${encodeURIComponent(slug)}`} className={btnGhost}>
                    编辑
                  </a>
                  <button className={btnGhost} onClick={() => handleToggleDraft(post)} disabled={busy}>
                    {post.data.draft ? '发布' : '转草稿'}
                  </button>
                  <button className={btnDanger} onClick={() => handleDelete(post)} disabled={busy}>
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
