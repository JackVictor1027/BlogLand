export const SITE = {
  /** 博客名称 */
  title: '老锦的代码与诗',
  /** 站点描述（SEO） */
  description: '',
  /** 博主简介与社交链接（暂空占位） */
  author: '',
  social: {
    github: '',
    email: '',
  },
  /** GitHub 仓库名（决定 Pages 子路径） */
  repo: 'BlogLand',
  /** 文章列表每页条数 */
  postsPerPage: 10,
} as const;

/** utterances 评论区配置（待提供仓库后填写） */
export const COMMENTS = {
  /** 评论所属仓库，如 'owner/BlogLand' */
  repo: '',
  /** 仓库 id（从 GitHub 获取，用于 utterances 载入） */
  repoId: '',
  /** issue 匹配策略：pathname / title */
  issueTerm: 'pathname',
  /** 主题：github-light / github-dark */
  theme: 'github-light',
} as const;
