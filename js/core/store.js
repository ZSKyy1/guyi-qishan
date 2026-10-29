/**
 * 数据层：localStorage 持久化（APP 版无需云开发，离线可用）
 * 集合：products / collection / counters / admin
 * 说明：字段设计与小程序云开发版保持一致（sn / category / status / images / video / nfcTagId），
 *       便于后续把数据导出成云数据库 JSON 直接导入。
 */

import { DEMO_PRODUCTS } from '../data/content.js';
import { formatSn, seqOf, normalize } from './sn.js';

const K = {
  products: 'gy:products',
  collection: 'gy:collection',
  counters: 'gy:counters',
  admin: 'gy:admin',
  inited: 'gy:inited',
  seedVer: 'gy:seedVer'
};

/**
 * 示例数据版本号。
 * 每次修改 DEMO_PRODUCTS 的内容字段（价格 / 名称 / 故事等）都要 +1，
 * 已初始化过的设备会在下次打开时自动做一次「保留素材与状态」的内容升级。
 * v2：团扇/发圈 19.9、折扇 29.9、纸伞 49.9
 * v3：全系价格下调至 80 元以内（发夹与发圈同为 19.9）
 */
const SEED_VERSION = 3;

const listeners = new Set();

function read(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch (e) {
    return def;
  }
}

function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
  emit();
}

function emit() {
  listeners.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ============ 初始化 ============ */
export function ensureSeed() {
  if (localStorage.getItem(K.inited)) { migrateSeed(); return; }
  const now = Date.now();
  const products = DEMO_PRODUCTS.map((p, i) => ({
    id: 'seed_' + (i + 1),
    createdAt: now - (DEMO_PRODUCTS.length - i) * 86400000,
    updatedAt: now,
    ...p
  }));
  // 保证字段完整
  products.forEach((p) => {
    p.images = p.images || [];
    p.video = p.video || null;
    p.onSale = p.onSale !== false;
    p.featured = !!p.featured;
  });
  write(K.products, products);
  write(K.collection, ['GY-2026-0001']); // 示例：0001 已在「我的藏品」中（已售出）
  write(K.counters, { sn: { '2026': 8 } });
  localStorage.setItem(K.inited, '1');
  localStorage.setItem(K.seedVer, String(SEED_VERSION));
}

/**
 * 示例数据内容升级：只更新「内容字段」，保留 id / 素材(images, video) / 状态(status, onSale) / NFC 绑定。
 * 这样改价格不会把用户已上传的图片视频冲掉。
 */
function migrateSeed() {
  const ver = Number(localStorage.getItem(K.seedVer) || 1);
  if (ver >= SEED_VERSION) return;
  try {
    const list = allProducts();
    if (list.length) {
      const map = new Map(DEMO_PRODUCTS.map((s) => [s.sn, s]));
      const next = list.map((p) => {
        const s = map.get(p.sn);
        if (!s) return p; // 用户自己新增的作品不动
        return Object.assign({}, p, {
          name: s.name,
          category: s.category,
          subType: s.subType,
          patternName: s.patternName,
          patternStory: s.patternStory,
          craft: s.craft,
          usage: s.usage,
          price: s.price,
          featured: s.featured
        });
      });
      write(K.products, next);
    }
  } catch (e) {
    // 升级失败不影响使用
  }
  localStorage.setItem(K.seedVer, String(SEED_VERSION));
}

/** 强制重置为示例数据 */
export function resetSeed() {
  ['products', 'collection', 'counters', 'inited', 'seedVer'].forEach((k) => localStorage.removeItem(K[k]));
  ensureSeed();
}

/* ============ 产品 ============ */
export function allProducts() {
  const list = read(K.products, []);
  return list.filter((p) => p !== null && typeof p === 'object');
}

/** 上架且可选的产品（买家端展示） */
export function onSaleProducts() {
  return allProducts().filter((p) => p.onSale !== false);
}

export function getBySn(sn) {
  const key = normalize(sn);
  return allProducts().find((p) => normalize(p.sn) === key) || null;
}

export function getById(id) {
  return allProducts().find((p) => p.id === id) || null;
}

export function featuredProducts() {
  return onSaleProducts().filter((p) => p.featured).slice(0, 6);
}

export function byCategory(cat) {
  const list = onSaleProducts();
  return cat && cat !== 'all' ? list.filter((p) => p.category === cat) : list;
}

/** 通用检索：pool 决定数据源（买家端只上架、管理端全部） */
function searchIn(pool, kw, cat) {
  let list = cat && cat !== 'all' ? pool.filter((p) => p.category === cat) : pool;
  const k = String(kw || '').trim().toLowerCase();
  if (!k) return list;
  return list.filter((p) =>
    [p.name, p.sn, p.patternName, p.subType, p.category, p.patternStory, p.craft, p.usage]
      .filter(Boolean)
      .some((f) => String(f).toLowerCase().includes(k))
  );
}

/** 买家端检索：仅上架作品 */
export function searchProducts(kw, cat = 'all') {
  return searchIn(onSaleProducts(), kw, cat);
}

/**
 * 管理端检索：含已下架作品
 * （此前管理端复用 searchProducts，导致下架作品在列表里消失、无法重新上架 —— 已修正）
 */
export function searchAllProducts(kw, cat = 'all') {
  return searchIn(allProducts(), kw, cat);
}

export function countByCategory() {
  const m = {};
  onSaleProducts().forEach((p) => { m[p.category] = (m[p.category] || 0) + 1; });
  m.all = onSaleProducts().length;
  return m;
}

/** SN 是否已被占用（唯一性校验：与云端唯一索引同效） */
export function snTaken(sn, excludeId) {
  const key = normalize(sn);
  return allProducts().some((p) => normalize(p.sn) === key && p.id !== excludeId);
}

/** 生成下一个 SN（按当年流水号自增） */
export function genSn(year) {
  const y = year || new Date().getFullYear();
  const counters = read(K.counters, { sn: {} });
  counters.sn = counters.sn || {};
  let seq = (counters.sn[String(y)] || 0) + 1;
  // 双重保险：若已存在则继续 +1
  while (snTaken(formatSn(y, seq))) seq += 1;
  counters.sn[String(y)] = seq;
  write(K.counters, counters);
  return formatSn(y, seq);
}

/** 同步计数器（导入数据时用） */
export function syncCounters() {
  const counters = read(K.counters, { sn: {} });
  counters.sn = counters.sn || {};
  allProducts().forEach((p) => {
    const m = String(p.sn || '').match(/^([A-Z]{2,4})-(\d{4})-(\d{3,6})$/);
    if (!m) return;
    const y = m[2];
    const s = parseInt(m[3], 10);
    if (!counters.sn[y] || counters.sn[y] < s) counters.sn[y] = s;
  });
  write(K.counters, counters);
}

/** 新增或更新产品；返回 {ok, msg, product} */
export function saveProduct(p) {
  const list = allProducts();
  const sn = normalize(p.sn);
  if (!sn) return { ok: false, msg: '序列号不能为空' };
  if (snTaken(sn, p.id)) return { ok: false, msg: '序列号已存在：' + sn };

  if (p.id) {
    const i = list.findIndex((x) => x.id === p.id);
    if (i >= 0) {
      list[i] = { ...list[i], ...p, sn, updatedAt: Date.now() };
      write(K.products, list);
      syncCounters();
      return { ok: true, msg: '已保存', product: list[i] };
    }
  }
  const np = {
    id: p.id || ('p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    featured: false,
    onSale: true,
    status: 'unsold',
    images: [],
    video: null,
    ...p,
    sn
  };
  list.push(np);
  write(K.products, list);
  syncCounters();
  return { ok: true, msg: '已新增', product: np };
}

export function removeProduct(id) {
  const p = getById(id);
  const list = allProducts().filter((x) => x.id !== id);
  write(K.products, list);
  // 同步移除藏品中的引用，避免出现空壳条目
  if (p && p.sn) removeCollection(p.sn);
  return true;
}

export function toggleOnSale(id) {
  const list = allProducts();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return;
  list[i].onSale = !list[i].onSale;
  list[i].updatedAt = Date.now();
  write(K.products, list);
}

export function setStatus(id, status) {
  const list = allProducts();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return;
  list[i].status = status;
  list[i].updatedAt = Date.now();
  write(K.products, list);
}

/* ============ 我的藏品（本地收藏） ============ */
export function getCollection() {
  return read(K.collection, []);
}

export function inCollection(sn) {
  return getCollection().some((x) => normalize(x) === normalize(sn));
}

export function addCollection(sn) {
  const list = getCollection();
  if (!list.some((x) => normalize(x) === normalize(sn))) {
    list.unshift(normalize(sn));
    write(K.collection, list);
  }
  return list;
}

export function toggleCollection(sn) {
  if (inCollection(sn)) {
    write(K.collection, getCollection().filter((x) => normalize(x) !== normalize(sn)));
    return false;
  }
  addCollection(sn);
  return true;
}

export function removeCollection(sn) {
  write(K.collection, getCollection().filter((x) => normalize(x) !== normalize(sn)));
}

/** 藏品对应的产品对象（过滤掉已删除的） */
export function collectionProducts() {
  const list = getCollection();
  return list.map((sn) => getBySn(sn)).filter(Boolean);
}

/* ============ 管理端鉴权 ============ */
/**
 * ⚠️ 安全说明：这是纯前端校验，仅用于「防止普通访客误入管理页」，
 *    不能防御有意攻击者（前端代码对用户完全可见）。
 *    上线请改为：登录请求发往服务端校验，会话用服务端签发的 token；
 *    并把 isAdmin() 的判断替换为服务端校验结果。
 */
const ADMIN_DEF = { user: 'admin', pass: 'GyF7oMXJtmqrl' };
const SESSION_HOURS = 2;

/** 会话签名：防止随手在控制台 setItem 伪造登录态（非加密，仅提高门槛） */
function signSession(sess) {
  const raw = `${sess.user}|${sess.at}|${sess.exp}|guyi-app`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function adminLogin(user, pass) {
  if (user === ADMIN_DEF.user && pass === ADMIN_DEF.pass) {
    const sess = { user, at: Date.now(), exp: Date.now() + SESSION_HOURS * 3600 * 1000 };
    sess.sig = signSession(sess);
    localStorage.setItem(K.admin, JSON.stringify(sess));
    return true;
  }
  return false;
}

export function isAdmin() {
  const s = read(K.admin, null);
  if (!s || !s.user || !s.exp) return false;
  if (Date.now() > s.exp) { localStorage.removeItem(K.admin); return false; }
  const expect = signSession({ user: s.user, at: s.at, exp: s.exp });
  if (s.sig !== expect) { localStorage.removeItem(K.admin); return false; }
  return true;
}

export function adminLogout() {
  localStorage.removeItem(K.admin);
}

/* ============ 导入导出（备份 / 与小程序云开发互通） ============ */
/** 仅档案（不含图片/视频文件），体积小，可直接导入微信云开发 */
export function exportJSON() {
  return JSON.stringify({
    app: 'guyi-pingliang-qishan',
    version: 1,
    withMedia: false,
    exportedAt: new Date().toISOString(),
    products: allProducts(),
    collection: getCollection(),
    counters: read(K.counters, {})
  }, null, 2);
}

/**
 * 完整备份：档案 + 图片视频（base64）
 * 说明：此前导出的 JSON 只带 mediaId，换设备/清缓存后素材会全部丢失 —— 现已补齐
 */
export async function exportFullJSON() {
  const products = allProducts();
  const ids = new Set();
  products.forEach((p) => {
    (p.images || []).forEach((i) => ids.add(i));
    if (p.cover) ids.add(p.cover);
    if (p.video && p.video.id) ids.add(p.video.id);
    if (p.video && p.video.poster) ids.add(p.video.poster);
  });
  const { dumpMedia } = await import('./media.js');
  const media = await dumpMedia([...ids]);
  return JSON.stringify({
    app: 'guyi-pingliang-qishan',
    version: 2,
    withMedia: true,
    exportedAt: new Date().toISOString(),
    products,
    collection: getCollection(),
    counters: read(K.counters, {}),
    media
  }, null, 2);
}

/** 字段白名单 + 类型校验：过滤脏数据，避免导入损坏/恶意 JSON 后页面崩溃 */
function sanitizeProducts(raw) {
  const out = [];
  let skipped = 0;
  (Array.isArray(raw) ? raw : []).forEach((p) => {
    if (!p || typeof p !== 'object') { skipped++; return; }
    const sn = typeof p.sn === 'string' ? p.sn.trim() : '';
    const name = typeof p.name === 'string' ? p.name.trim() : '';
    if (!sn || !name) { skipped++; return; }   // SN 与名称是最小必填
    out.push({
      id: typeof p.id === 'string' && p.id ? p.id : ('p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      sn: sn.toUpperCase(),
      name,
      category: ['fan', 'accessory', 'home', 'culture'].includes(p.category) ? p.category : 'fan',
      subType: typeof p.subType === 'string' ? p.subType : '',
      patternName: typeof p.patternName === 'string' ? p.patternName : '',
      patternStory: typeof p.patternStory === 'string' ? p.patternStory : '',
      craft: typeof p.craft === 'string' ? p.craft : '',
      usage: typeof p.usage === 'string' ? p.usage : '',
      price: (p.price === '' || p.price === null || p.price === undefined) ? '' : (Number.isFinite(Number(p.price)) ? Number(p.price) : ''),
      status: p.status === 'sold' ? 'sold' : 'unsold',
      onSale: p.onSale !== false,
      featured: !!p.featured,
      images: Array.isArray(p.images) ? p.images.filter((x) => typeof x === 'string') : [],
      video: (p.video && typeof p.video === 'object' && typeof p.video.id === 'string')
        ? { id: p.video.id, poster: typeof p.video.poster === 'string' ? p.video.poster : '' }
        : null,
      nfcTagId: typeof p.nfcTagId === 'string' ? p.nfcTagId : '',
      createdAt: Number.isFinite(p.createdAt) ? p.createdAt : Date.now(),
      updatedAt: Number.isFinite(p.updatedAt) ? p.updatedAt : Date.now()
    });
  });
  // 同批次内 SN 去重（保留第一条）
  const seen = new Set();
  const dedup = out.filter((p) => {
    if (seen.has(p.sn)) { skipped++; return false; }
    seen.add(p.sn);
    return true;
  });
  return { list: dedup, skipped };
}

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.products)) throw new Error('文件格式不正确：缺少 products');
  const { list, skipped } = sanitizeProducts(data.products);
  if (!list.length) throw new Error('文件中没有有效的作品记录');
  write(K.products, list);
  write(K.collection, Array.isArray(data.collection) ? data.collection.filter((x) => typeof x === 'string') : []);
  write(K.counters, data.counters || {});
  localStorage.setItem(K.inited, '1');
  syncCounters();
  return { products: list.length, media: 0, skipped };
}

/** 完整恢复：档案 + 素材写回 IndexedDB（异步） */
export async function importFullJSON(text) {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.products)) throw new Error('文件格式不正确：缺少 products');
  const { list, skipped } = sanitizeProducts(data.products);
  if (!list.length) throw new Error('文件中没有有效的作品记录');
  write(K.products, list);
  write(K.collection, Array.isArray(data.collection) ? data.collection.filter((x) => typeof x === 'string') : []);
  write(K.counters, data.counters || {});
  localStorage.setItem(K.inited, '1');
  syncCounters();
  let mediaCount = 0;
  if (data.media && Object.keys(data.media).length) {
    const { restoreMedia } = await import('./media.js');
    mediaCount = await restoreMedia(data.media);
  }
  return { products: list.length, media: mediaCount, skipped };
}

/** 统计（管理端用） */
export function stats() {
  const list = allProducts();
  return {
    total: list.length,
    sold: list.filter((p) => p.status === 'sold').length,
    unsold: list.filter((p) => p.status !== 'sold').length,
    onSale: list.filter((p) => p.onSale !== false).length,
    offSale: list.filter((p) => p.onSale === false).length
  };
}
