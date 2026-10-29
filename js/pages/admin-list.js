/**
 * 卖家管理端 · 作品列表
 * 统计 / 搜索 / 系列筛选 / 上下架 / 编辑 / 删除 / 导出
 */

import { CATEGORIES } from '../data/content.js';
import { esc, toast, confirmBox } from '../core/ui.js';
import * as store from '../core/store.js';
import { go, refresh } from '../core/router.js';
import { catOf, statusText, emptyBlock } from './parts.js';
import { getUrl, remove as mediaRemove } from '../core/media.js';
import { SEARCH, BOX, IMAGE } from '../core/icons.js';

let state = { kw: '', cat: 'all' };

export default {
  tab: null,
  title: () => '作品管理',

  render() {
    // 简单身份校验：未登录直接踢回登录页
    if (!store.isAdmin()) {
      setTimeout(() => go('/admin/login', { replace: true }), 0);
      return `<div class="page"><div class="page-body"></div></div>`;
    }

    const st = store.stats();
    return `<div class="page">
      <div class="appbar brand">
        <button class="back" data-act="back">‹</button>
        <div class="title">作品管理</div>
        <div class="right"><button data-act="logout" style="font-size:12.5px">退出</button></div>
      </div>

      <div class="search-bar">
        <div class="search-inp">
          <span class="ico">${SEARCH}</span>
          <input id="kw" placeholder="搜索名称 / SN / 纹样" value="${esc(state.kw)}">
        </div>
        <button class="btn sm" data-act="add">＋ 新增</button>
      </div>
      <div class="cat-bar">
        <button class="cat-chip ${state.cat === 'all' ? 'on' : ''}" data-cat="all">全部</button>
        ${CATEGORIES.map((c) => `<button class="cat-chip ${state.cat === c.key ? 'on' : ''}" data-cat="${c.key}">${esc(c.name)}</button>`).join('')}
      </div>

      <div class="page-body">
        <div class="ad-stat">
          <div class="s"><div class="n">${st.total}</div><div class="l">全部作品</div></div>
          <div class="s"><div class="n">${st.sold}</div><div class="l">已售出</div></div>
          <div class="s"><div class="n">${st.offSale}</div><div class="l">已下架</div></div>
        </div>

        <div class="pad-y" id="list"></div>

        <div class="pad-y" style="display:flex;gap:10px">
          <button class="btn gray block sm" data-act="export">导出 JSON</button>
          <button class="btn gray block sm" data-act="reset">恢复示例数据</button>
        </div>
        <div style="height:20px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    if (!store.isAdmin()) return;
    const box = el.querySelector('#list');
    const kw = el.querySelector('#kw');

    const paint = async () => {
      // 管理端必须看到全部作品（含已下架），否则无法重新上架
      let list = store.searchAllProducts(state.kw, state.cat);
      list = list.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      box.innerHTML = list.length ? '' : emptyBlock(BOX, '还没有作品', '点击右上角「＋ 新增」录入第一件');

      for (const p of list) {
        const c = catOf(p.category);
        const cover = (p.images && p.images[0]) || p.cover || '';
        const url = cover ? await getUrl(cover) : '';
        const node = document.createElement('div');
        node.className = 'ad-item';
        node.innerHTML = `
          <div class="ad-thumb">
            ${url ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover">`
                  : '<div class="ph small" style="height:100%"><div class="ph-ico">' + IMAGE + '</div><div class="ph-text">待上传</div></div>'}
          </div>
          <div class="ad-info">
            <div class="nm">${esc(p.name)}</div>
            <div class="sn">${esc(p.sn)}</div>
            <div class="mt">
              <span class="tag" style="background:${c.grad};color:#fff">${esc(c.name)}</span>
              <span class="tag ${p.status === 'sold' ? 'gray' : 'gold'}">${statusText(p.status)}</span>
              ${p.onSale === false ? '<span class="tag orange">已下架</span>' : ''}
              ${p.featured ? '<span class="tag blue">精选</span>' : ''}
            </div>
          </div>
          <div class="ad-ops">
            <button class="primary" data-edit="${esc(p.id)}">编辑</button>
            <button data-toggle="${esc(p.id)}">${p.onSale === false ? '上架' : '下架'}</button>
            <button class="danger" data-del="${esc(p.id)}">删除</button>
          </div>`;
        box.appendChild(node);
      }

      box.querySelectorAll('[data-edit]').forEach((b) => {
        b.onclick = () => go('/admin/edit?id=' + encodeURIComponent(b.dataset.edit));
      });
      box.querySelectorAll('[data-toggle]').forEach((b) => {
        b.onclick = () => { store.toggleOnSale(b.dataset.toggle); toast('已更新上下架状态'); refresh(); };
      });
      box.querySelectorAll('[data-del]').forEach((b) => {
        b.onclick = async () => {
          const p = store.getById(b.dataset.del);
          const ok = await confirmBox('删除作品', `确定删除「${p ? p.name : ''}」（${p ? p.sn : ''}）？此操作不可恢复。`, '删除');
          if (!ok) return;
          // 连同素材一起清理，避免 IndexedDB 里留下无法访问的孤儿文件
          const mediaIds = [...(p && p.images ? p.images : []), p && p.video ? p.video.id : '', p && p.video && p.video.poster ? p.video.poster : ''].filter(Boolean);
          store.removeProduct(b.dataset.del);
          for (const id of mediaIds) { try { await mediaRemove(id); } catch (e) { /* 忽略单个素材清理失败 */ } }
          toast('已删除');
          refresh();
        };
      });
    };

    let timer = null;
    kw.addEventListener('input', () => {
      state.kw = kw.value.trim();
      clearTimeout(timer);
      timer = setTimeout(paint, 180);
    });

    el.querySelectorAll('[data-cat]').forEach((b) => {
      b.onclick = () => {
        state.cat = b.dataset.cat;
        el.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b));
        paint();
      };
    });

    el.querySelector('[data-act="add"]').onclick = () => go('/admin/edit');
    el.querySelector('[data-act="back"]').onclick = () => go('/home', { replace: true });
    el.querySelector('[data-act="logout"]').onclick = () => {
      store.adminLogout();
      toast('已退出');
      go('/home', { replace: true });
    };
    el.querySelector('[data-act="export"]').onclick = () => {
      const blob = new Blob([store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'guyi-products-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      toast('已导出');
    };
    el.querySelector('[data-act="reset"]').onclick = async () => {
      const ok = await confirmBox('恢复示例数据', '将清空当前所有作品并恢复为 8 件示例作品，确定继续？', '恢复');
      if (ok) { store.resetSeed(); toast('已恢复'); refresh(); }
    };

    paint();
  }
};
