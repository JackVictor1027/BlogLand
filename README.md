# 老锦的代码与诗（BlogLand）

个人博客网站，基于 **Astro + GitHub Pages**，Risograph 印刷风设计，零服务器、零域名。

- 浏览端：静态预渲染，含文章、标签归档、站内搜索（Pagefind）、RSS、评论（utterances / GitHub Issues）。
- 管理端：`/admin`，通过 GitHub 浏览器登录（OAuth Device Flow）操作文章 CRUD、标签、图片与评论。

## 技术栈

Astro 7 · TypeScript · Tailwind CSS v4 · React 19（仅管理端）· GitHub Actions · pnpm

## 本地开发

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm check      # 类型检查
pnpm build      # 构建到 ./dist
```

## 部署

1. 创建 GitHub 仓库 **BlogLand** 并推送本项目。
2. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
3. push 到 `main`/`master` 后，`.github/workflows/deploy.yml` 自动构建并发布到 `https://{owner}.github.io/BlogLand/`。

## 目录结构

```
src/
├── components/    # Risograph 基础组件与页面组件
├── layouts/       # 布局外壳（BaseLayout / PostLayout / AdminLayout）
├── pages/         # 路由页面（含 /admin）
├── content/       # 文章 Markdown（git 版本管理）
├── content.config.ts  # 内容集合 schema
├── config.ts      # 站点与评论配置
├── lib/           # 管理端逻辑（GitHub API 封装）
└── styles/        # 设计 token 与全局样式
```

详细设计见本地 `docs/` 目录（开发阶段保密文档，不入库）。
