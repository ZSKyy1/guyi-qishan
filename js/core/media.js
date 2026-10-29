/**
 * 素材库：图片 / 视频存本机 IndexedDB（Blob），完全离线可用
 * - 小程序版用云存储 fileID；APP 版改为本地 mediaId，二者字段语义一致，便于后续迁移
 * - 对外只暴露 getUrl(mediaId) → 可直接用于 <img src> / <video src> 的对象 URL
 */

const DB_NAME = 'guyi-media';
const DB_VER = 1;
const STORE = 'files';

let _db = null;
const _urlCache = new Map(); // mediaId -> objectURL

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(mode) {
  return openDB().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** 生成素材 id */
function newId(prefix = 'm') {
  return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * 保存一个文件（File/Blob）到素材库
 * @returns {Promise<string>} mediaId
 */
export async function put(file, meta = {}) {
  const id = newId(meta.type === 'video' ? 'v' : 'i');
  const rec = {
    id,
    type: meta.type || (file.type && file.type.startsWith('video') ? 'video' : 'image'),
    name: file.name || '',
    mime: file.type || '',
    size: file.size || 0,
    blob: file,
    createdAt: Date.now()
  };
  const store = await tx('readwrite');
  await wrap(store.put(rec));
  return id;
}

/** 读取素材记录 */
export async function get(mediaId) {
  if (!mediaId) return null;
  const store = await tx('readonly');
  return wrap(store.get(mediaId));
}

/** 取得可用于 src 的对象 URL（带缓存） */
export async function getUrl(mediaId) {
  if (!mediaId) return '';
  if (_urlCache.has(mediaId)) return _urlCache.get(mediaId);
  const rec = await get(mediaId);
  if (!rec || !rec.blob) return '';
  const url = URL.createObjectURL(rec.blob);
  _urlCache.set(mediaId, url);
  return url;
}

/** 同步取 URL（若已缓存），否则返回空串；随后异步回填由调用方处理 */
export function peekUrl(mediaId) {
  return _urlCache.get(mediaId) || '';
}

/** 删除素材 */
export async function remove(mediaId) {
  if (!mediaId) return;
  const u = _urlCache.get(mediaId);
  if (u) { URL.revokeObjectURL(u); _urlCache.delete(mediaId); }
  const store = await tx('readwrite');
  await wrap(store.delete(mediaId));
}

/** 列出全部素材 id（用于清理孤儿素材） */
export async function listIds() {
  const store = await tx('readonly');
  const all = await wrap(store.getAllKeys());
  return all || [];
}

/**
 * 批量把已上传的素材转为 URL（用于渲染列表）
 * @param {string[]} ids
 * @returns {Promise<Object>} { id: url }
 */
export async function urlMap(ids = []) {
  const out = {};
  await Promise.all(ids.map(async (id) => { out[id] = await getUrl(id); }));
  return out;
}

/* ============ 文件选择（图片 / 视频） ============ */
/**
 * 唤起文件选择（移动端会调用系统相册/拍摄）
 * @param {'image'|'video'} accept
 * @param {boolean} multiple
 */
export function pickMedia(accept = 'image', multiple = false) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept === 'video' ? 'video/*' : 'image/*';
    input.multiple = multiple;
    // 注意：不要设置 capture，否则移动端会被强制拉起摄像头，无法从相册选已有视频
    input.style.display = 'none';
    document.body.appendChild(input);

    let settled = false;
    const done = (files) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('focus', onFocus);
      clearTimeout(guard);
      input.remove();
      resolve(files);
    };
    // iOS Safari 等不派发 cancel 事件：用「窗口重新获得焦点且未选中文件」兜底
    const onFocus = () => { setTimeout(() => { if (!input.files || !input.files.length) done([]); }, 350); };
    const guard = setTimeout(() => { if (!input.files || !input.files.length) done([]); }, 10 * 60 * 1000);

    input.addEventListener('change', () => done(Array.from(input.files || [])));
    input.addEventListener('cancel', () => done([]));
    window.addEventListener('focus', onFocus);
    input.click();
  });
}

/**
 * 选择并保存（可多张），返回 mediaId 数组
 */
export async function pickAndSave(accept = 'image', multiple = false) {
  const files = await pickMedia(accept, multiple);
  if (!files.length) return [];
  const ids = [];
  for (const f of files) ids.push(await put(f, { type: accept }));
  return ids;
}

/* ============ 备份 / 恢复（把 Blob 转成可写进 JSON 的 base64） ============ */

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error || new Error('读取素材失败'));
    r.readAsDataURL(blob);
  });
}

function dataUrlToBlob(url) {
  const idx = url.indexOf(',');
  const head = url.slice(0, idx);
  const b64 = url.slice(idx + 1);
  const mime = (/:(.*?);/.exec(head) || [, ''])[1] || '';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * 导出素材为 { id: { type, mime, data(base64 dataURL) } }
 * @param {string[]} ids
 */
export async function dumpMedia(ids = []) {
  const out = {};
  for (const id of ids) {
    const rec = await get(id);
    if (!rec || !rec.blob) continue;
    try {
      out[id] = { type: rec.type, mime: rec.mime, name: rec.name || '', data: await blobToDataUrl(rec.blob) };
    } catch (e) {
      console.warn('[media] 导出失败，跳过', id, e);
    }
  }
  return out;
}

/** 把 dumpMedia 的结果写回 IndexedDB，返回成功条数 */
export async function restoreMedia(map = {}) {
  let n = 0;
  for (const [id, item] of Object.entries(map)) {
    if (!item || !item.data) continue;
    try {
      const blob = dataUrlToBlob(item.data);
      const store = await tx('readwrite');
      await wrap(store.put({
        id,
        type: item.type || (item.mime && item.mime.startsWith('video') ? 'video' : 'image'),
        name: item.name || '',
        mime: item.mime || '',
        size: blob.size,
        blob,
        createdAt: Date.now()
      }));
      n += 1;
    } catch (e) {
      console.warn('[media] 恢复失败，跳过', id, e);
    }
  }
  return n;
}
