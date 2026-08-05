import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@/config';
import { getPostSlug } from '@/utils/posts';

export const GET = async (context: APIContext) => {
  const posts = await getCollection('posts');
  const published = posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const site = context.site ?? new URL(import.meta.env.BASE_URL, 'http://localhost:4321');

  const items = published.map((post) => {
    const slug = getPostSlug(post);
    const url = new URL(`${import.meta.env.BASE_URL}posts/${slug}/`, site);
    return {
      title: post.data.title,
      description: post.data.description ?? '',
      pubDate: post.data.date,
      link: url.href,
      content: post.body ?? '',
    };
  });

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: site.href,
    items,
    customData: '<language>zh-cn</language>',
  });
};
