import { ADMIN } from '@/config';
import { gh, encodePath, fileToB64 } from '@/lib/github';

export interface ImageFile {
  path: string;
  name: string;
  sha: string;
}

/** 上传图片到仓库 assets/images，返回可插入文章的相对路径 */
export async function uploadImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.\u4e00-\u9fff-]/g, '_');
  const name = `${Date.now()}-${safeName}`;
  const path = `${ADMIN.imagesDir}/${name}`;
  const content = await fileToB64(file);
  await gh(`/repos/${ADMIN.repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    body: { message: `image: 上传 ${safeName}`, content },
  });
  return `/${path}`;
}

export async function listImages(): Promise<ImageFile[]> {
  const items = await gh<Array<{ path: string; name: string; sha: string }>>(
    `/repos/${ADMIN.repo}/contents/${encodePath(ADMIN.imagesDir)}`
  );
  return items;
}

export async function deleteImage(path: string, sha: string): Promise<void> {
  await gh(`/repos/${ADMIN.repo}/contents/${encodePath(path)}`, {
    method: 'DELETE',
    body: { message: 'image: 删除图片', sha },
  });
}
