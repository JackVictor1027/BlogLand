import { useCallback, useEffect, useState } from 'react';
import { uploadImage, listImages, deleteImage, type ImageFile } from '@/lib/images';
import { ADMIN } from '@/config';
import { btnPrimary, btnGhost, btnDanger, cardCls } from '@/components/admin/ui';

export default function ImagesView() {
  const [images, setImages] = useState<ImageFile[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setImages(await listImages());
    } catch (e) {
      setError((e as Error).message || '加载失败');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const path = await uploadImage(file);
      await navigator.clipboard?.writeText(path).catch(() => undefined);
      setCopied(path);
      await load();
    } catch (e) {
      setError((e as Error).message || '上传失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy(path: string) {
    await navigator.clipboard?.writeText(path).catch(() => undefined);
    setCopied(path);
    window.setTimeout(() => setCopied(''), 2000);
  }

  async function handleDelete(image: ImageFile) {
    if (!window.confirm(`确定删除 ${image.name}？`)) return;
    setBusy(true);
    try {
      await deleteImage(image.path, image.sha);
      await load();
    } catch (e) {
      setError((e as Error).message || '删除失败');
    } finally {
      setBusy(false);
    }
  }

  const rawUrl = (path: string) =>
    `https://raw.githubusercontent.com/${ADMIN.repo}/${ADMIN.branch}/${path}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-black text-2xl uppercase tracking-wider">图片管理</h2>
        <label className={btnPrimary}>
          {busy ? '上传中……' : '上传图片'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
      </div>

      {copied && (
        <p className="mb-4 text-sm text-riso-green-deep font-bold break-all">
          已复制路径：{copied}
        </p>
      )}
      {error && <p className="mb-4 text-sm text-riso-orange-deep font-bold">{error}</p>}

      {!images && <p className="text-gray-600">加载中……</p>}

      {images && images.length === 0 && (
        <div className={cardCls}>
          <p className="text-gray-600">还没有图片，点击「上传图片」上传到仓库。</p>
        </div>
      )}

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.path} className={`${cardCls} space-y-2`}>
              <div className="rounded-sm border-2 border-ink overflow-hidden bg-white">
                <img
                  src={rawUrl(image.path)}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-gray-600 truncate" title={image.name}>
                {image.name}
              </p>
              <div className="flex gap-2">
                <button className={btnGhost} onClick={() => handleCopy(`/${image.path}`)}>
                  复制路径
                </button>
                <button className={btnDanger} onClick={() => handleDelete(image)} disabled={busy}>
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
