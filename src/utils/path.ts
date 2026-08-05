export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (path.startsWith('http')) return path;
  return `${base}${path.replace(/^\//, '')}`;
}
