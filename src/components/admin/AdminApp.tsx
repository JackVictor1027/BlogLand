import { useEffect, useState } from 'react';
import { getToken, clearToken } from '@/lib/auth';
import LoginView from '@/components/admin/LoginView';
import PostsView from '@/components/admin/PostsView';
import PostEditorView from '@/components/admin/PostEditorView';
import ImagesView from '@/components/admin/ImagesView';
import { navLinkCls, btnGhost } from '@/components/admin/ui';

type Route =
  | { view: 'posts' }
  | { view: 'new' }
  | { view: 'edit'; slug: string }
  | { view: 'images' };

function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [view, param] = parts;
  if (view === 'posts' && param === 'new') return { view: 'new' };
  if (view === 'posts' && param) return { view: 'edit', slug: decodeURIComponent(param) };
  if (view === 'images') return { view: 'images' };
  return { view: 'posts' };
}

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(getToken());
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== 'undefined' ? parseRoute(window.location.hash) : { view: 'posts' }
  );

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!token) {
    return <LoginView onLogin={() => setToken(getToken())} />;
  }

  const navItems: Array<{ label: string; href: string; active: boolean }> = [
    { label: '文章列表', href: '#/posts', active: route.view === 'posts' },
    { label: '新建文章', href: '#/posts/new', active: route.view === 'new' },
    { label: '图片管理', href: '#/images', active: route.view === 'images' },
    { label: '站点设置', href: '#/settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-mono">
      <header className="bg-riso-pink border-b-2 md:border-b-4 border-ink px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <span className="font-black text-lg md:text-2xl tracking-wider">管理后台</span>
          <button
            className={btnGhost}
            onClick={() => {
              clearToken();
              setToken(null);
            }}
          >
            退出登录
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto px-4 md:px-8 py-6">
        <nav className="md:w-44 shrink-0 space-y-2" aria-label="管理导航">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={navLinkCls(item.active)}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <main className="flex-1 min-w-0">
          {route.view === 'posts' && <PostsView />}
          {route.view === 'new' && <PostEditorView />}
          {route.view === 'edit' && <PostEditorView slug={route.slug} />}
          {route.view === 'images' && <ImagesView />}
        </main>
      </div>
    </div>
  );
}
