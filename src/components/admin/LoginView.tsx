import { useState } from 'react';
import { setToken, clearToken } from '@/lib/auth';
import { gh } from '@/lib/github';
import { btnPrimary, inputCls, labelCls, cardCls } from '@/components/admin/ui';

interface Props {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: Props) {
  const [pat, setPat] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!pat.trim()) {
      setError('请输入令牌');
      return;
    }
    setLoading(true);
    try {
      setToken(pat);
      await gh('/user');
      onLogin();
    } catch (e) {
      clearToken();
      setError((e as Error)?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-mono flex items-center justify-center px-4">
      <div className={`${cardCls} w-full max-w-md`}>
        <h1 className="font-black text-2xl md:text-3xl uppercase tracking-wider mb-2">
          管理后台
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          本站为纯静态托管，管理端通过 GitHub 令牌（PAT）访问仓库完成文章管理。
        </p>

        <label className="block">
          <span className={labelCls}>GitHub 令牌（PAT）</span>
          <input
            type="password"
            className={inputCls}
            placeholder="github_pat_xxx 或 ghp_xxx"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="off"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-riso-orange font-bold" role="alert">
            {error}
          </p>
        )}

        <button className={`${btnPrimary} w-full mt-6`} onClick={handleLogin} disabled={loading}>
          {loading ? '验证中……' : '登录'}
        </button>

        <details className="mt-6 text-xs text-gray-600 leading-6">
          <summary className="cursor-pointer font-bold uppercase tracking-wider">
            如何创建令牌
          </summary>
          <ol className="mt-2 list-decimal pl-5 space-y-1">
            <li>打开 GitHub → Settings → Developer settings → Personal access tokens</li>
            <li>选择 Fine-grained tokens → Generate new token</li>
            <li>Repository access 选择本博客仓库</li>
            <li>Permissions → Contents 设为 Read and write</li>
            <li>生成后复制令牌（仅显示一次）粘贴到此处</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
