import { useEffect, useMemo, useState } from 'react';
import { listPosts, savePost, postPathFromSlug, type PostFile } from '@/lib/posts';
import { getEffectiveSlug, slugify } from '@/utils/slug';
import { renderMarkdown } from '@/lib/markdown';
import { btnPrimary, btnGhost, inputCls, labelCls, cardCls } from '@/components/admin/ui';

interface Props {
  slug?: string;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default function PostEditorView({ slug }: Props) {
  const editing = Boolean(slug);
  const [post, setPost] = useState<PostFile | null>(null);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slugField, setSlugField] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr());
  const [tagsText, setTagsText] = useState('');
  const [cover, setCover] = useState('');
  const [draft, setDraft] = useState(false);
  const [body, setBody] = useState('');

  const [preview, setPreview] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!editing) return;
    (async () => {
      setError('');
      try {
        const posts = await listPosts();
        const found = posts.find(
          (p) => getEffectiveSlug(p.data.slug, p.data.title) === slug
        );
        if (!found) {
          setError('未找到该文章（slug 可能已变更，请返回列表重新进入）');
          return;
        }
        setPost(found);
        setTitle(found.data.title);
        setSlugField(found.data.slug ?? '');
        setDescription(found.data.description ?? '');
        setDate(found.data.date || todayStr());
        setTagsText(found.data.tags.join(', '));
        setCover(found.data.cover ?? '');
        setDraft(found.data.draft);
        setBody(found.body);
      } catch (e) {
        setError((e as Error).message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [editing, slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setPreview(renderMarkdown(body));
      } catch {
        setPreview('');
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [body]);

  const effectiveSlug = useMemo(() => slugField.trim() || slugify(title), [slugField, title]);

  async function handleSave() {
    setError('');
    setMsg('');
    if (!title.trim()) {
      setError('请填写文章标题');
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        slug: slugField.trim() || undefined,
        date,
        updated: editing ? todayStr() : undefined,
        tags: tagsText
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
        cover: cover.trim() || undefined,
        draft,
      };
      const path = editing && post ? post.path : postPathFromSlug(effectiveSlug);
      await savePost(path, data, body, editing && post ? post.sha : undefined);
      setMsg(
        '已保存：commit 已提交，GitHub Actions 正在重新构建部署（约 1 分钟）。由于 GitHub Pages 页面缓存为 10 分钟，游客端可能短暂显示旧内容，可强刷（Ctrl/Cmd+Shift+R）立即查看最新版。'
      );
      window.setTimeout(() => {
        window.location.hash = '#/posts';
      }, 2500);
    } catch (e) {
      setError((e as Error).message || '保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-gray-600">加载中……</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-black text-2xl uppercase tracking-wider">
          {editing ? '编辑文章' : '新建文章'}
        </h2>
        <a href="#/posts" className={btnGhost}>
          ← 返回列表
        </a>
      </div>

      {error && <p className="mb-4 text-sm text-riso-orange font-bold">{error}</p>}
      {msg && <p className="mb-4 text-sm text-riso-green font-bold">{msg}</p>}

      <div className="space-y-4">
        <div className={`${cardCls} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelCls}>标题 *</span>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="文章标题"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Slug（留空自动生成）</span>
              <input
                className={inputCls}
                value={slugField}
                onChange={(e) => setSlugField(e.target.value)}
                placeholder={effectiveSlug}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelCls}>摘要</span>
            <input
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="文章摘要（SEO 与列表展示）"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className={labelCls}>发布日期</span>
              <input
                type="date"
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelCls}>标签（逗号分隔）</span>
              <input
                className={inputCls}
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="前端, Astro"
              />
            </label>
            <label className="block">
              <span className={labelCls}>封面图路径</span>
              <input
                className={inputCls}
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="/assets/images/xxx.png"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#ff6b9d]"
              checked={draft}
              onChange={(e) => setDraft(e.target.checked)}
            />
            <span className="text-sm font-bold uppercase tracking-wider">
              草稿（不对外发布）
            </span>
          </label>
        </div>

        <div className={`${cardCls} space-y-3`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div>
              <span className={labelCls}>正文（Markdown）</span>
              <textarea
                className={`${inputCls} min-h-[520px] leading-6`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="在此输入 Markdown 正文……"
              />
            </div>
            <div>
              <span className={labelCls}>实时预览</span>
              <div
                className="prose-riso border-2 border-ink rounded-sm bg-paper p-4 min-h-[520px] max-h-[520px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: preview || '<p class="text-gray-500">（输入正文后此处预览）</p>' }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className={btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? '保存中……' : '保存'}
          </button>
          <a href="#/posts" className={btnGhost}>
            取消
          </a>
        </div>
      </div>
    </div>
  );
}
