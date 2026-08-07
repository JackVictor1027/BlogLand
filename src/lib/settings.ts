import { ADMIN } from '@/config';
import { gh, encodePath, b64ToUtf8, utf8ToB64 } from '@/lib/github';

export type SocialPlatform = 'github' | 'email' | 'xiaohongshu' | 'bilibili' | 'wechat';

export interface SocialLink {
  platform: SocialPlatform;
  /** 显示名称（如账号名） */
  label: string;
  /** 链接（外链或 mailto） */
  url: string;
}

export interface SiteSettings {
  site: {
    title: string;
    description: string;
    author: string;
    /** 首页 Hero 背景图（路径或完整 URL，留空则无） */
    heroBg: string;
    /** 首页 Hero 标题文字颜色（CSS 色值） */
    heroTitleColor: string;
    /** 首页 Hero 副标题文字颜色（CSS 色值） */
    heroSubtitleColor: string;
    /** 社交联系方式（Footer 联系栏 / 关于页） */
    social: SocialLink[];
  };
  comments: {
    repo: string;
    repoId: string;
    issueTerm: string;
    theme: string;
  };
}

const SETTINGS_PATH = 'src/site.config.json';

export async function getSettings(): Promise<{ settings: SiteSettings; sha: string }> {
  const f = await gh<{ content: string; sha: string }>(
    `/repos/${ADMIN.repo}/contents/${encodePath(SETTINGS_PATH)}`
  );
  return { settings: JSON.parse(b64ToUtf8(f.content)) as SiteSettings, sha: f.sha };
}

export async function saveSettings(settings: SiteSettings, sha: string): Promise<void> {
  const content = utf8ToB64(JSON.stringify(settings, null, 2) + '\n');
  await gh(`/repos/${ADMIN.repo}/contents/${encodePath(SETTINGS_PATH)}`, {
    method: 'PUT',
    body: { message: 'config: 更新站点设置', content, sha },
  });
}
