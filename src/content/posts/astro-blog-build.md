---
title: 用 Astro 搭建零成本静态博客
date: 2026-08-03
tags: [Astro, 前端]
description: 从零到一，用 Astro + GitHub Pages 搭一个不花钱的博客，记录关键技术点。
---

这篇文章记录本站的技术选型与搭建过程，希望对同样想"白嫖"托管的朋友有帮助。

## 为什么选 Astro

Astro 是内容驱动的静态站点框架，编译产物是纯 HTML，托管在 GitHub Pages 上零成本、极快。

### 内容即文件

文章就是仓库里的 Markdown，天然带 Git 版本历史，改错了随时回滚。

## 两个关键配置

### base path

项目站点部署在 `https://{owner}.github.io/BlogLand/` 这样的子路径下，必须配置 `base`：

```ts
export default defineConfig({
  site: 'https://example.github.io/BlogLand/',
  base: '/BlogLand/',
});
```

### 评论接入

评论用 utterances，基于 GitHub Issues，每篇文章对应一个 Issue，无需任何后端。

## 遇到的坑

- 中文 slug 需要统一编码规则，否则列表和详情页对不上。
- GitHub Actions 构建时要带上 `SITE_URL` 和 `BASE_PATH` 两个环境变量。
- 移动端要保证触控目标不小于 44px。

## 结尾

搭建过程本身也是一篇文章的素材。这就是博客的意义——写下来，才算真正学会。
