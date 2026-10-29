/**
 * 首页：品牌头图 + NFC 查询卡 + 四宫格导航 + 精选作品 + 漂漆六步法 + 平凉色谱 + 作品网格
 */

import { BRAND, PIAOQI_STEPS, PINGLIANG_COLORS } from '../data/content.js';
import { esc, toast } from '../core/ui.js';
import * as store from '../core/store.js';
import { go } from '../core/router.js';
import { productCard, hydrateMedia, catOf } from './parts.js';
import { capability, readOnce } from '../core/nfc.js';

const NAV = [
  { key: 'products', icon: '🪭', name: '产品展示', grad: 'var(--grad-brand)' },
  { key: 'culture', icon: '📜', name: '非遗文化', grad: 'var(--grad-gold)' },
  { key: 'collection', icon: '🔖', name: '我的藏品', grad: 'var(--grad-pink)' },
  { key: 'project', icon: '🏛', name: '项目介绍', grad: 'var(--grad-orange)' }
];

export default {
  tab: 'home',
  title: () => BRAND.shortName,

  render() {
    const featured = store.featuredProducts();
    const list = store.onSaleProducts().slice(0, 6);

    return `<div class="page">
      <div class="page-body" style="padding-bottom:0">

        <!-- 品牌头图 -->
        <section class="hero">
          <div class="deco-cloud c1"></div>
          <div class="deco-cloud c2"></div>
          <div class="deco-hill"></div>
          <div class="hero-top">
            <div class="hero-logo">
              <img src="icons/icon-192.png" alt="logo">
              <div>
                <div class="n">${esc(BRAND.shortName)}</div>
                <div class="s">${esc(BRAND.region)}</div>
              </div>
            </div>
            <div class="hero-badge">${esc(BRAND.heritage.split(' · ')[0])}</div>
          </div>
          <h1 class="hero-slogan font-serif">${esc(BRAND.slogan)}</h1>
          <p class="hero-sub">${esc(BRAND.subSlogan)}</p>
          <p class="hero-intro" id="heroIntro">${esc(BRAND.intro)}</p>
          <button class="hero-more" data-act="toggle-intro">展开全文 ›</button>
        </section>

        <!-- NFC 碰一碰卡 -->
        <section class="nfc-card">
          <div class="nfc-head">
            <div class="nfc-ico">📡</div>
            <div>
              <h3>碰一碰，验明正身</h3>
              <p>贴近产品上的 NFC 芯片，直达你的专属藏品</p>
            </div>
          </div>
          <div class="nfc-acts">
            <button class="btn" data-act="nfc">碰一碰读芯片</button>
            <button class="btn ghost" data-act="sn">输入序列号</button>
          </div>
        </section>

        <!-- 四宫格导航 -->
        <section class="nav-grid">
          ${NAV.map((n) => `
            <button class="nav-item" data-nav="${n.key}">
              <div class="nav-ico" style="background:${n.grad}">${n.icon}</div>
              <span>${n.name}</span>
            </button>`).join('')}
        </section>

        <!-- 精选作品 -->
        <section class="block">
          <div class="sec-head">
            <h2>精选作品</h2>
            <span class="more" data-act="more-product">查看全部 ›</span>
          </div>
        </section>
        <div class="hscroll">
          ${featured.length ? featured.map((p) => `
            <div class="feat-card" data-sn="${esc(p.sn)}">
              <div class="feat-img" data-mid="${esc((p.images && p.images[0]) || p.cover || '')}">${
                ((p.images && p.images[0]) || p.cover) ? '' : '<div class="ph" style="height:100%"><div class="ph-ico">🖼</div><div class="ph-text">替换为真实产品图</div></div>'
              }</div>
              <div class="feat-body">
                <h4>${esc(p.name)}</h4>
                <div class="sub">${esc(catOf(p.category).name)} · ${esc(p.patternName || '')}</div>
                <div class="row">
                  <div class="feat-price">${p.price ? '¥' + esc(p.price) : '非卖品'}</div>
                  <span class="tag ${p.status === 'sold' ? 'gray' : ''}">${p.status === 'sold' ? '已售出' : '在售'}</span>
                </div>
              </div>
            </div>`).join('') : '<div style="padding:0 16px 12px;color:var(--gray-2);font-size:13px">暂无精选作品，可在管理端设置</div>'}
        </div>

        <!-- 漂漆六步法 -->
        <section class="block">
          <div class="sec-head">
            <h2>漂漆六步法</h2>
            <span class="more" data-act="more-culture">了解详情 ›</span>
          </div>
        </section>
        <div class="hscroll">
          ${PIAOQI_STEPS.map((s, i) => `
            <div class="step-card" style="background:${s.grad}" data-act="more-culture">
              <div class="no">STEP ${i + 1}</div>
              <div class="big font-serif">${s.name}</div>
              <div class="full">${esc(s.full)}</div>
              <div class="desc">${esc(s.desc)}</div>
            </div>`).join('')}
        </div>

        <!-- 平凉色谱 -->
        <section class="block">
          <div class="sec-head">
            <h2>平凉色谱</h2>
            <span class="more" data-act="more-color">六色含义 ›</span>
          </div>
        </section>
        <div class="palette">
          ${PINGLIANG_COLORS.map((c) => `
            <div class="pal-item" data-act="more-color">
              <div class="pal-swatch" style="background:${c.hex}"><span class="hex">${c.hex}</span></div>
              <div class="pal-body">
                <div class="nm">${esc(c.name)}</div>
                <div class="from">${esc(c.from)}</div>
              </div>
            </div>`).join('')}
        </div>

        <!-- 作品网格 -->
        <section class="block">
          <div class="sec-head">
            <h2>作品一览</h2>
            <span class="more" data-act="more-product">共 ${store.onSaleProducts().length} 件 ›</span>
          </div>
        </section>
        <div class="grid-2">
          ${list.length ? list.map(productCard).join('') : ''}
        </div>

        <div style="height:26px"></div>
        <div class="ab-foot">${esc(BRAND.heritage)}<br>数据保存在本机 · 离线可用</div>
        <div style="height:14px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    hydrateMedia(el);

    // 宫格导航
    el.querySelectorAll('[data-nav]').forEach((b) => {
      b.onclick = () => go('/' + b.dataset.nav);
    });

    // 作品卡
    el.querySelectorAll('[data-sn]').forEach((b) => {
      b.onclick = () => go('/product?sn=' + encodeURIComponent(b.dataset.sn));
    });

    // 跳转（页面上有多处「查看全部」，必须全部绑定，否则部分入口点了没反应）
    el.querySelectorAll('[data-act="more-product"]').forEach((b) => {
      b.onclick = () => go('/products');
    });
    el.querySelectorAll('[data-act="more-culture"]').forEach((b) => {
      b.onclick = () => go('/culture?tab=step');
    });
    el.querySelectorAll('[data-act="more-color"]').forEach((b) => {
      b.onclick = () => go('/culture?tab=color');
    });

    el.querySelector('[data-act="sn"]').onclick = () => go('/sn-query');
    el.querySelector('[data-act="nfc"]').onclick = () => doNfc(el);

    // 简介展开 / 收起
    const intro = el.querySelector('#heroIntro');
    const introBtn = el.querySelector('[data-act="toggle-intro"]');
    introBtn.onclick = () => {
      const open = intro.classList.toggle('open');
      introBtn.textContent = open ? '收起 ‹' : '展开全文 ›';
    };
  }
};

/** 碰一碰：读取标签 → 跳详情页 */
async function doNfc(el) {
  const cap = capability();
  if (!cap.canRead) {
    toast(cap.reason, 2600);
    setTimeout(() => go('/sn-query'), 900);
    return;
  }
  const btn = el.querySelector('[data-act="nfc"]');
  const old = btn.textContent;
  btn.textContent = '请把手机贴近芯片…';
  btn.disabled = true;
  try {
    const sn = await readOnce(30000, (s) => { btn.textContent = s; });
    toast('识别成功：' + sn);
    go('/product?sn=' + encodeURIComponent(sn) + '&from=nfc');
  } catch (e) {
    toast(e.message || '读取失败', 2400);
    btn.textContent = old;
    btn.disabled = false;
  }
}
