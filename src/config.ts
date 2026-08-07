import siteConfig from './site.config.json';

/** 站点可编辑配置（来源 site.config.json，管理端「站点设置」可修改） */
export const SITE = siteConfig.site;
export const COMMENTS = siteConfig.comments;

/** 文章列表每页条数 */
export const POSTS_PER_PAGE = 10;

/** 管理端配置（静态，不受后台编辑影响） */
export const ADMIN = {
  /** GitHub 仓库（owner/repo），管理端全部写操作的目标 */
  repo: 'JackVictor1027/BlogLand',
  /** 文章目录（相对仓库根） */
  postsDir: 'src/content/posts',
  /** 图片目录（相对仓库根，须在 public/ 下才会被构建部署） */
  imagesDir: 'public/assets/images',
  /** 默认分支（raw 图片预览用） */
  branch: 'master',
} as const;
