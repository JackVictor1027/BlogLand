import { getToken } from '@/lib/auth';

const API = 'https://api.github.com';

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface GhOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/** 统一 GitHub REST API 调用（自动携带 token，处理限流与错误） */
export async function gh<T>(path: string, options: GhOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body = options.body !== undefined ? JSON.stringify(options.body) : undefined;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
  });

  if (!res.ok) {
    let msg = `GitHub API 请求失败 (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string };
      if (err.message) msg = err.message;
    } catch {
      /* ignore */
    }
    if (res.status === 401) msg = '令牌无效或已过期，请重新登录';
    if (res.status === 403) msg = '没有权限或触发限流，请检查令牌权限（需仓库 Contents 读写）';
    if (res.status === 404) msg = '资源不存在或令牌无权访问该仓库';
    if (res.status === 429) msg = 'GitHub API 限流，请稍后再试';
    throw new GitHubError(res.status, msg);
  }

  return res.json() as Promise<T>;
}

/** 仓库内路径 URL 编码（保留斜杠） */
export function encodePath(path: string): string {
  return path
    .split('/')
    .map(encodeURIComponent)
    .join('/');
}

/** base64 -> UTF-8 文本 */
export function b64ToUtf8(b64: string): string {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** UTF-8 文本 -> base64 */
export function utf8ToB64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

/** File -> base64（原始字节） */
export function fileToB64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const b64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(b64);
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}
