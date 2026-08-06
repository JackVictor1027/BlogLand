import { useCallback, useEffect, useState } from 'react';
import { getAllTags, renameTag, deleteTag, type TagInfo } from '@/lib/tags';
import { btnDanger, btnSmall, cardCls } from '@/components/admin/ui';

export default function TagsManager() {
  const [tags, setTags] = useState<TagInfo[] | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setTags(await getAllTags());
    } catch (e) {
      setError((e as Error).message || '加载失败');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRename(tag: TagInfo) {
    const next = window.prompt(`将标签「${tag.name}」重命名为：`, tag.name);
    if (!next || next.trim() === tag.name) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const n = await renameTag(tag.name, next.trim());
      setMsg(`已将「${tag.name}」重命名为「${next.trim()}」，影响 ${n} 篇文章（每次改动即一次 commit）`);
      await load();
    } catch (e) {
      setError((e as Error).message || '重命名失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(tag: TagInfo) {
    if (!window.confirm(`确定删除标签「${tag.name}」？将影响 ${tag.count} 篇文章。`)) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const n = await deleteTag(tag.name);
      setMsg(`已删除标签「${tag.name}」，影响 ${n} 篇文章`);
      await load();
    } catch (e) {
      setError((e as Error).message || '删除失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="font-black text-2xl uppercase tracking-wider mb-5">标签管理</h2>

      {msg && <p className="mb-4 text-sm text-riso-green font-bold">{msg}</p>}
      {error && <p className="mb-4 text-sm text-riso-orange font-bold">{error}</p>}

      {!tags && <p className="text-gray-600">加载中……</p>}

      {tags && tags.length === 0 && (
        <div className={cardCls}>
          <p className="text-gray-600">还没有任何标签。</p>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="space-y-3">
          {tags.map((tag) => (
            <div key={tag.name} className={`${cardCls} flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-base md:text-lg truncate">{tag.name}</span>
                <span className="rounded-sm border-2 border-ink bg-paper px-2 py-0.5 text-xs text-gray-600">
                  {tag.count} 篇
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className={btnSmall} onClick={() => handleRename(tag)} disabled={busy}>
                  重命名
                </button>
                <button className={btnDanger} onClick={() => handleDelete(tag)} disabled={busy}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
