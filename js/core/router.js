/**
 * 极简 hash 路由
 * - 路由格式：#/home、#/product?sn=GY-2026-0001&from=nfc
 * - 页面定义：{ tab, title, render(params)->html, mount(el, params), onShow() }
 *   tab 非空 → 属于底部 Tab 页（显示 TabBar）；否则为二级页（隐藏 TabBar，带返回栏）
 */

import { h, esc } from './ui.js';

const routes = new Map();
let currentPath = '';
let currentDef = null;
let currentEl = null;

export function define(path, def) {
  routes.set(path, def);
}

/** 解析 hash（格式 #/products?sn=xxx，注意 hash 自带前导斜杠） */
function parse() {
  const raw = (location.hash || '').replace(/^#/, '');          // '/products?sn='
  const seg = raw.split('?');
  // ⚠️ 这里必须先去掉前导斜杠再拼 '/'，否则会变成 '//products' 永远匹配不到路由
  // （曾因此导致所有 Tab 点击都回落到首页）
  const name = (seg[0] || '').replace(/^\/+/, '');
  const q = seg[1] || '';
  const path = routes.has('/' + name) ? '/' + name : '/home';
  const params = {};
  if (q) {
    q.split('&').forEach((kv) => {
      const [k, v] = kv.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }
  return { path, params };
}

/** 跳转 */
export function go(path, opts = {}) {
  const target = '#' + path;
  if (opts.replace) {
    location.replace(target);
  } else {
    location.hash = path;
  }
  if (opts.replace) render();
}

/** 返回上一页；无历史时回首页 */
export function back(fallback = '/home') {
  if (history.length > 1) history.back();
  else go(fallback, { replace: true });
}

/** 刷新当前页（数据变更后重绘） */
export function refresh() {
  render(true);
}

function setTab(active) {
  const bar = document.getElementById('tabBar');
  if (!bar) return;
  if (active) {
    bar.classList.remove('hidden');
    bar.querySelectorAll('.tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === active);
    });
  } else {
    bar.classList.add('hidden');
  }
}

function setStatusTitle(text) {
  const el = document.getElementById('sbTitle');
  if (el) el.textContent = text || '古艺新创';
}

function render(keepScroll = false) {
  const { path, params } = parse();
  const def = routes.get(path) || routes.get('/home');
  if (!def) return;

  const view = document.getElementById('view');
  const prevScroll = keepScroll && currentEl
    ? currentEl.querySelector('.page-body')?.scrollTop || 0
    : 0;

  const html = def.render(params);
  const el = h(html);
  el.classList.add('page');
  if (!def.tab) el.classList.add('is-sub');

  view.innerHTML = '';
  view.appendChild(el);

  currentPath = path;
  currentDef = def;
  currentEl = el;

  setTab(def.tab || null);
  setStatusTitle(typeof def.title === 'function' ? def.title(params) : (def.title || '古艺新创'));

  if (def.mount) {
    try { def.mount(el, params); } catch (e) { console.error('[mount error]', path, e); }
  }

  if (prevScroll) {
    const body = el.querySelector('.page-body');
    if (body) body.scrollTop = prevScroll;
  }
}

/** 启动路由 */
export function start() {
  window.addEventListener('hashchange', () => render());

  document.getElementById('tabBar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    const tab = btn.dataset.tab;
    const target = '/' + tab;
    if ('/' + (currentPath.split('/')[1] || '') === target) {
      // 已在当前 Tab：回到该 Tab 顶部（scrollTo 在个别环境不存在，需兜底）
      const body = currentEl && currentEl.querySelector('.page-body');
      if (body) {
        if (typeof body.scrollTo === 'function') body.scrollTo({ top: 0, behavior: 'smooth' });
        else body.scrollTop = 0;
      }
      return;
    }
    go(target, { replace: true });
  });

  if (!location.hash) location.replace('#/home');
  render();
}

export function getPath() { return currentPath; }
export { esc };
