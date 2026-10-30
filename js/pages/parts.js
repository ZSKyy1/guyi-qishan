/**
 * 页面公共零件：顶栏、产品卡片、分类/状态映射、素材回填
 */

import { CATEGORIES } from '../data/content.js';
import { esc, placeholderHtml } from '../core/ui.js';
import { urlMap } from '../core/media.js';

/** 分类字典 */
export function catOf(key) {
  return CATEGORIES.find((c) => c.key === key) || { key, name: '其他', desc: '', grad: 'var(--grad-brand)', color: '#0FA98F' };
}

export function catName(key) {
  return catOf(key).name;
}

export function statusText(s) {
  return s === 'sold' ? '已售出' : '未售出';
}

/** 内联 SVG 图标（不依赖 emoji 字体，任何机型都不会出现破图方框） */
export const ICO_SEARCH = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.4" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M15.9 15.9L21 21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;

/** 二级页顶部导航栏 */
export function appBar(title, opts = {}) {
  const right = opts.right || '';
  return `<div class="appbar ${opts.brand ? 'brand' : ''}">
    <button class="back" data-act="back">${opts.brand ? '' : '‹'}</button>
    <div class="title">${esc(title)}</div>
    <div class="right">${right}</div>
  </div>`;
}

/** 页面骨架：顶栏 + 内容区 */
export function pageShell(title, bodyHtml, opts = {}) {
  return `<div class="page">
    ${appBar(title, opts)}
    <div class="page-body">${bodyHtml}</div>
  </div>`;
}

/** 无顶栏页面骨架（Tab 页自己画头部） */
export function pageShellPlain(bodyHtml, withBody = true) {
  return `<div class="page">
    <div class="page-body" style="padding-bottom:0">${bodyHtml}</div>
  </div>`;
}

/** SN 徽章
 *  compact=true 时把固定前缀 GY- 收进标签位，卡片内保证单行不折行
 */
export function snBadge(sn, big = false, compact = false) {
  const full = String(sn || '');
  if (compact) {
    const body = full.replace(/^GY-/, '');
    const prefix = body === full ? 'SN' : 'GY-';
    return `<span class="sn-badge compact"><span class="lab">${esc(prefix)}</span><span class="val">${esc(body)}</span></span>`;
  }
  return `<span class="sn-badge ${big ? 'lg' : ''}"><span class="lab">SN</span><span class="val">${esc(full)}</span></span>`;
}

/** 产品缩略图容器
 * 有素材 → 空容器（mount 阶段回填 img）；无素材 → 占位块（提示替换真实产品图）
 */
export function thumbHtml(p, cls = 'p-img', small = false, tip = '') {
  const first = (p.images && p.images[0]) || p.cover || '';
  if (first) {
    return `<div class="${cls}" data-mid="${esc(first)}"></div>`;
  }
  return `<div class="${cls}" data-mid="">${placeholderHtml('image', small ? 'small' : 'large', tip)}</div>`;
}

/** 产品网格卡片
 *  层级：图上系列角标 → 作品名 → 子类型 → 底部一行「SN + 状态」
 *  不展示价格（按需求：产品只作成果展示，不标注价格）
 */
export function productCard(p) {
  const c = catOf(p.category);
  const sold = p.status === 'sold';
  return `<div class="p-card" data-sn="${esc(p.sn)}">
    <div class="p-media">
      ${thumbHtml(p, 'p-img', true)}
      <span class="p-cat" style="background:${c.grad}">${esc(c.name)}</span>
      ${sold ? '<span class="p-flag">已售出</span>' : ''}
    </div>
    <div class="p-info">
      <div class="p-name">${esc(p.name)}</div>
      <div class="p-sub">${esc(p.subType || '')}</div>
      <div class="p-foot">
        ${snBadge(p.sn, false, true)}
        <span class="p-status ${sold ? 'sold' : 'unsold'}">${sold ? '已售出' : '在售'}</span>
      </div>
    </div>
  </div>`;
}

/** 空态 */
export function emptyBlock(icon, title, sub) {
  return `<div class="empty"><div class="e-ico">${icon}</div><div class="e-t">${esc(title)}</div>${sub ? `<div class="e-s">${esc(sub)}</div>` : ''}</div>`;
}

/**
 * 素材回填：把 [data-mid] 容器替换成 <img>
 * 在页面 mount 时调用（异步）
 */
export async function hydrateMedia(root) {
  const nodes = Array.from(root.querySelectorAll('[data-mid]'));
  const ids = [...new Set(nodes.map((n) => n.dataset.mid).filter(Boolean))];
  if (!ids.length) return;
  let map = {};
  try {
    map = await urlMap(ids);
  } catch (e) {
    console.warn('[media] 读取失败', e);
    return;
  }
  nodes.forEach((n) => {
    const id = n.dataset.mid;
    const url = map[id];
    if (!url) return;
    const img = new Image();
    img.src = url;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
    n.innerHTML = '';
    n.appendChild(img);
  });
}

/** 视频区块（有素材则 video 标签，无则占位） */
export function videoBlock(p) {
  if (p.video && p.video.id) {
    return `<div class="pd-video" data-vid="${esc(p.video.id)}" data-poster="${esc(p.video.poster || '')}">
      ${placeholderHtml('video')}
    </div>`;
  }
  return `<div class="pd-video">${placeholderHtml('video')}</div>`;
}

/** 填充视频（mount 阶段） */
export async function hydrateVideo(root) {
  const box = root.querySelector('[data-vid]');
  if (!box) return;
  const id = box.dataset.vid;
  const posterId = box.dataset.poster;
  const { getUrl } = await import('../core/media.js');
  const src = await getUrl(id);
  const poster = posterId ? await getUrl(posterId) : '';
  if (!src) return;
  const v = document.createElement('video');
  v.src = src;
  v.controls = true;
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.setAttribute('webkit-playsinline', '');
  if (poster) v.poster = poster;
  v.style.cssText = 'width:100%;height:210px;display:block;background:#000';
  box.innerHTML = '';
  box.appendChild(v);
}
