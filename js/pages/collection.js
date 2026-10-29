/**
 * 我的藏品（Tab）：本地登记的藏品列表 + 统计 + 空态引导
 */

import { esc, toast, confirmBox } from '../core/ui.js';
import * as store from '../core/store.js';
import { go, refresh } from '../core/router.js';
import { productCard, hydrateMedia, emptyBlock } from './parts.js';
import { capability, readOnce } from '../core/nfc.js';
import { BOOKMARK, NFC } from '../core/icons.js';

export default {
  tab: 'collection',
  title: () => '我的藏品',

  render() {
    const list = store.collectionProducts();
    const sold = list.filter((p) => p.status === 'sold').length;

    return `<div class="page">
      <div class="page-body" style="padding-bottom:0">
        <section class="col-head">
          <div class="deco-hill"></div>
          <h2>我的藏品</h2>
          <p>每一次碰一碰，都是一次与平凉山水的相遇</p>
        </section>

        <div class="col-stat">
          <div class="s"><div class="n">${list.length}</div><div class="l">藏品总数</div></div>
          <div class="s"><div class="n">${sold}</div><div class="l">已售出</div></div>
          <div class="s"><div class="n">${list.length - sold}</div><div class="l">在售/展示</div></div>
        </div>

        <section class="block">
          <div class="sec-head">
            <h2>藏品清单</h2>
            <span class="more" data-act="add">＋ 添加</span>
          </div>
        </section>

        <div id="colGrid">
          ${list.length
            ? `<div class="grid-2">${list.map(productCard).join('')}</div>`
            : emptyBlock(BOOKMARK, '还没有藏品', '碰一碰作品上的 NFC 芯片，或手动输入序列号')}
        </div>

        <div class="pad" style="display:flex;gap:10px">
          <button class="btn block" data-act="nfc">${NFC} 碰一碰添加</button>
          <button class="btn ghost block" data-act="sn">输入序列号</button>
        </div>

        <div style="height:20px"></div>
        <div class="ab-foot">藏品数据保存在本机浏览器，清空浏览器数据会一并清除，建议定期在管理端导出备份</div>
        <div style="height:14px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    const grid = el.querySelector('#colGrid');
    hydrateMedia(grid);

    grid.querySelectorAll('[data-sn]').forEach((b) => {
      b.onclick = () => go('/product?sn=' + encodeURIComponent(b.dataset.sn));
    });

    el.querySelector('[data-act="add"]').onclick = () => go('/sn-query');
    el.querySelector('[data-act="sn"]').onclick = () => go('/sn-query');
    el.querySelector('[data-act="nfc"]').onclick = async () => {
      const cap = capability();
      if (!cap.canRead) { toast(cap.reason, 2600); return; }
      const btn = el.querySelector('[data-act="nfc"]');
      const old = btn.textContent;
      btn.textContent = '请把手机贴近芯片…';
      try {
        const sn = await readOnce(30000);
        const p = store.getBySn(sn);
        if (!p) { toast('未找到该序列号对应的作品'); btn.textContent = old; return; }
        store.addCollection(sn);
        toast('已加入藏品：' + sn);
        refresh();
      } catch (e) {
        toast(e.message || '读取失败');
        btn.textContent = old;
      }
    };
  }
};
