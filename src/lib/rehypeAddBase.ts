interface RehypeNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: RehypeNode[];
}

/**
 * 为 Markdown 正文中以 / 开头的本地资源路径补上 base（避免子路径部署下图片/链接 404）。
 * 用法：rehypePlugins: [[rehypeAddBase, { base }]]
 */
export function rehypeAddBase(options: { base: string }) {
  const { base } = options;
  return (tree: RehypeNode) => {
    const walk = (node: RehypeNode): void => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'element' && node.properties) {
        for (const key of ['src', 'href']) {
          const value = node.properties[key];
          if (
            typeof value === 'string' &&
            value.startsWith('/') &&
            !value.startsWith(base) &&
            !value.startsWith('//')
          ) {
            node.properties[key] = base.replace(/\/$/, '') + value;
          }
        }
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };
    walk(tree);
  };
}
