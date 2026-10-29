/**
 * 产品列表页（Tab）：搜索 + 四大系列切换 + 网格浏览
 */

import { CATEGORIES } from '../data/content.js';
import { esc } from '../core/ui.js';
import * as store from '../core/store.js';
import { go } from '../core/router.js';
import { productCard, hydrateMedia, emptyBlock, ICO_SEARCH } from './parts.js';

let state = { kw: '', cat: 'all' };

export default {
  tab: 'products',
  title: () => '产品展示',

  render(params) {
    if (params && params.cat) state.cat = params.cat;
    const counts = store.countByCategory();

    return `<div class="page">
      <div class="search-bar">
        <div class="search-inp">
          <span class="ico">${ICO_SEARCH}</span>
          <input id="kw" placeholder="搜索作品名 / 序列号 / 纹样" value="${esc(state.kw)}">
          <button class="search-clear" data-act="clear" ${state.kw ? '' : 'style="display:none"'}>×</button>
        </div>
      </div>
      <div class="cat-bar">
        <button class="cat-chip ${state.cat === 'all' ? 'on' : ''}" data-cat="all">全部<span class="cat-count">${counts.all || 0}</span></button>
        ${CATEGORIES.map((c) => `
          <button class="cat-chip ${state.cat === c.key ? 'on' : ''}" data-cat="${c.key}">${esc(c.name)}<span class="cat-count">${counts[c.key] || 0}</span></button>
        `).join('')}
      </div>
      <div class="page-body">
        <div class="list-meta" id="listMeta"></div>
        <div class="grid-2" id="grid"></div>
        <div style="height:20px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    const grid = el.querySelector('#grid');
    const meta = el.querySelector('#listMeta');
    const input = el.querySelector('#kw');

    const paint = () => {
      const list = store.searchProducts(state.kw, state.cat);
      meta.textContent = `共 ${list.length} 件作品`;
      grid.innerHTML = list.length
        ? list.map(productCard).join('')
        : emptyBlock(ICO_SEARCH, '没有找到相关作品', '换个关键词，或切换到「全部」系列');
      hydrateMedia(grid);
      grid.querySelectorAll('[data-sn]').forEach((b) => {
        b.onclick = () => go('/product?sn=' + encodeURIComponent(b.dataset.sn));
      });
    };

    // 分类切换
    el.querySelectorAll('[data-cat]').forEach((b) => {
      b.onclick = () => {
        state.cat = b.dataset.cat;
        el.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b));
        paint();
      };
    });

    // 搜索
    let timer = null;
    input.addEventListener('input', () => {
      state.kw = input.value.trim();
      el.querySelector('[data-act="clear"]').style.display = state.kw ? '' : 'none';
      clearTimeout(timer);
      timer = setTimeout(paint, 180);
    });
    el.querySelector('[data-act="clear"]').onclick = () => {
      input.value = ''; state.kw = '';
      el.querySelector('[data-act="clear"]').style.display = 'none';
      paint();
    };

    paint();
  }
};
