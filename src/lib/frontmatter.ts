export interface PostData {
  title: string;
  description?: string;
  slug?: string;
  date: string;
  updated?: string;
  tags: string[];
  cover?: string;
  draft: boolean;
}

/** YAML 安全字符串：含特殊字符时用双引号（JSON 转义在 YAML 双引号中合法） */
function yamlStr(v: string): string {
  if (/^[\w\u4e00-\u9fff\s\-./]*$/.test(v) && !/^[#\-]/.test(v)) return v;
  return JSON.stringify(v);
}

/** 解析标量值：去掉 YAML 引号（双引号支持转义） */
function parseScalar(val: string): string {
  if (val.length >= 2 && val.startsWith('"') && val.endsWith('"')) {
    try {
      return JSON.parse(val) as string;
    } catch {
      return val.slice(1, -1);
    }
  }
  if (val.length >= 2 && val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1);
  }
  return val;
}

/** 解析 Markdown 文件为 frontmatter + 正文 */
export function parsePost(raw: string): { data: PostData; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  const data: PostData = { title: '', date: '', tags: [], draft: false };
  if (m) {
    const lines = m[1].split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const kv = /^([\w-]+):\s*(.*)$/.exec(line);
      if (!kv) continue;
      const key = kv[1];
      let val = kv[2].trim();

      if (key === 'tags') {
        if (val === '') {
          const arr: string[] = [];
          i++;
          while (i < lines.length && /^\s+-\s+(.*)$/.test(lines[i])) {
            arr.push(lines[i].replace(/^\s+-\s+/, '').trim());
            i++;
          }
          i--;
          data.tags = arr;
        } else if (val.startsWith('[')) {
          data.tags = val
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        } else {
          data.tags = val
            .split(/[,，]/)
            .map((s) => s.trim())
            .filter(Boolean);
        }
        continue;
      }

      if (val === 'true' || val === 'false') {
        (data as unknown as Record<string, unknown>)[key] = val === 'true';
        continue;
      }
      (data as unknown as Record<string, unknown>)[key] = parseScalar(val);
    }
  }
  return { data, body: m ? m[2] : raw };
}

/** 序列化为标准 frontmatter 文件（Astro schema 可解析） */
export function stringifyPost(data: PostData, body: string): string {
  const lines: string[] = ['---'];
  lines.push(`title: ${yamlStr(data.title)}`);
  if (data.description) lines.push(`description: ${yamlStr(data.description)}`);
  if (data.slug) lines.push(`slug: ${yamlStr(data.slug)}`);
  lines.push(`date: ${data.date || new Date().toISOString().slice(0, 10)}`);
  if (data.updated) lines.push(`updated: ${data.updated}`);
  if (data.tags.length > 0) {
    lines.push(`tags: [${data.tags.map((t) => JSON.stringify(t)).join(', ')}]`);
  }
  if (data.cover) lines.push(`cover: ${yamlStr(data.cover)}`);
  lines.push(`draft: ${data.draft}`);
  lines.push('---');
  return lines.join('\n') + '\n\n' + body.trimStart();
}
