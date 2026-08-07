import { useEffect, useState } from 'react';
import {
  getSettings,
  saveSettings,
  type SiteSettings,
  type SocialLink,
  type SocialPlatform,
} from '@/lib/settings';
import { btnPrimary, btnGhost, btnDanger, inputCls, labelCls, cardCls } from '@/components/admin/ui';

const PLATFORMS: Array<{ value: SocialPlatform; label: string }> = [
  { value: 'github', label: 'GitHub' },
  { value: 'email', label: '邮箱' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'bilibili', label: 'B 站' },
  { value: 'wechat', label: '微信公众号' },
];

const EMPTY: SiteSettings = {
  site: {
    title: '',
    description: '',
    author: '',
    heroBg: '',
    heroTitleColor: '#1a1a1a',
    heroSubtitleColor: '#1a1a1a',
    social: [],
  },
  comments: { repo: '', repoId: '', issueTerm: 'pathname', theme: 'github-light' },
};

export default function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(EMPTY);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { settings, sha } = await getSettings();
        setSettings({
          ...settings,
          site: {
            ...settings.site,
            heroBg: settings.site.heroBg ?? '',
            heroTitleColor: settings.site.heroTitleColor ?? '#1a1a1a',
            heroSubtitleColor: settings.site.heroSubtitleColor ?? '#1a1a1a',
            social: Array.isArray(settings.site.social)
              ? settings.site.social
              : [],
          },
        });
        setSha(sha);
      } catch (e) {
        setError((e as Error).message || '加载设置失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateSocial(list: SocialLink[]) {
    update('site', { ...settings.site, social: list });
  }

  function addSocial() {
    updateSocial([...settings.site.social, { platform: 'github', label: '', url: '' }]);
  }

  function updateSocialAt(index: number, patch: Partial<SocialLink>) {
    const list = settings.site.social.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateSocial(list);
  }

  function removeSocialAt(index: number) {
    updateSocial(settings.site.social.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setMsg('');
    try {
      await saveSettings(settings, sha);
      const { sha: nextSha } = await getSettings();
      setSha(nextSha);
      setMsg('已保存。GitHub Actions 约 1 分钟后重新部署，页面缓存最长 10 分钟后生效（可强刷查看）。');
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
      <h2 className="font-black text-2xl uppercase tracking-wider mb-5">站点设置</h2>
      <p className="text-sm text-gray-600 mb-5">
        修改会写入仓库的 src/site.config.json，提交后触发重新构建部署。
      </p>

      {msg && <p className="mb-4 text-sm text-riso-green-deep font-bold">{msg}</p>}
      {error && <p className="mb-4 text-sm text-riso-orange-deep font-bold">{error}</p>}

      <div className={`${cardCls} space-y-4`}>
        <h3 className="font-bold text-lg uppercase tracking-wider border-b-2 border-ink pb-2">站点信息</h3>
        <label className="block">
          <span className={labelCls}>博客名称</span>
          <input
            className={inputCls}
            value={settings.site.title}
            onChange={(e) => update('site', { ...settings.site, title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelCls}>描述</span>
          <input
            className={inputCls}
            value={settings.site.description}
            onChange={(e) => update('site', { ...settings.site, description: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelCls}>博主简介</span>
          <input
            className={inputCls}
            value={settings.site.author}
            onChange={(e) => update('site', { ...settings.site, author: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelCls}>首页 Hero 背景图</span>
          <input
            className={inputCls}
            value={settings.site.heroBg}
            onChange={(e) => update('site', { ...settings.site, heroBg: e.target.value })}
            placeholder="/assets/images/hero.jpg（留空则无背景图）"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className={labelCls}>Hero 标题颜色</span>
            <input
              className={inputCls}
              value={settings.site.heroTitleColor}
              onChange={(e) => update('site', { ...settings.site, heroTitleColor: e.target.value })}
              placeholder="#1a1a1a"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Hero 副标题颜色</span>
            <input
              className={inputCls}
              value={settings.site.heroSubtitleColor}
              onChange={(e) =>
                update('site', { ...settings.site, heroSubtitleColor: e.target.value })
              }
              placeholder="#1a1a1a"
            />
          </label>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={labelCls}>联系方式（显示在页脚与关于页）</span>
            <button className={btnGhost} onClick={addSocial} type="button">
              + 添加
            </button>
          </div>
          {settings.site.social.length === 0 && (
            <p className="text-xs text-gray-600">暂无联系方式，点击「+ 添加」新增。</p>
          )}
          {settings.site.social.map((s, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_1fr_auto] gap-2 items-end">
              <label className="block">
                <span className={labelCls}>平台</span>
                <select
                  className={inputCls}
                  value={s.platform}
                  onChange={(e) => updateSocialAt(i, { platform: e.target.value as SocialPlatform })}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>名称</span>
                <input
                  className={inputCls}
                  value={s.label}
                  onChange={(e) => updateSocialAt(i, { label: e.target.value })}
                  placeholder="账号名"
                />
              </label>
              <label className="block">
                <span className={labelCls}>链接</span>
                <input
                  className={inputCls}
                  value={s.url}
                  onChange={(e) => updateSocialAt(i, { url: e.target.value })}
                  placeholder="https://… 或 mailto:…"
                />
              </label>
              <button className={btnDanger} onClick={() => removeSocialAt(i)} type="button">
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardCls} space-y-4 mt-6`}>
        <h3 className="font-bold text-lg uppercase tracking-wider border-b-2 border-ink pb-2">评论（utterances）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className={labelCls}>仓库（owner/repo）</span>
            <input
              className={inputCls}
              value={settings.comments.repo}
              onChange={(e) => update('comments', { ...settings.comments, repo: e.target.value })}
              placeholder="如 JackVictor1027/BlogLand"
            />
          </label>
          <label className="block">
            <span className={labelCls}>仓库 id</span>
            <input
              className={inputCls}
              value={settings.comments.repoId}
              onChange={(e) => update('comments', { ...settings.comments, repoId: e.target.value })}
              placeholder="在 github.com 仓库主页查看"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className={labelCls}>issue 匹配方式</span>
            <select
              className={inputCls}
              value={settings.comments.issueTerm}
              onChange={(e) => update('comments', { ...settings.comments, issueTerm: e.target.value })}
            >
              <option value="pathname">pathname（页面路径）</option>
              <option value="title">title（文章标题）</option>
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>主题</span>
            <select
              className={inputCls}
              value={settings.comments.theme}
              onChange={(e) => update('comments', { ...settings.comments, theme: e.target.value })}
            >
              <option value="github-light">github-light</option>
              <option value="github-dark">github-dark</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-gray-600">
          配置好仓库与仓库 id 后，文章评论区即启用；未配置时显示占位提示。
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? '保存中……' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
