/**
 * 非遗文化页（二级页）
 * 三个分栏：大漆历史 / 漂漆六步法 / 纹样故事
 * 路由：#/culture?tab=history|step|pattern
 */

import { LACQUER_HISTORY, PIAOQI_STEPS, PATTERNS } from '../data/content.js';
import { esc } from '../core/ui.js';
import { appBar, catName } from './parts.js';
import { back } from '../core/router.js';
import { BULB } from '../core/icons.js';

const TABS = [
  { key: 'history', name: '大漆历史' },
  { key: 'step', name: '漂漆六步' },
  { key: 'pattern', name: '纹样故事' }
];

let current = 'history';

export default {
  tab: null,
  title: () => '非遗文化',

  render(params) {
    // 兼容旧链接：#/culture?tab=color 已下线，回落到「大漆历史」
    if (params && params.tab && TABS.some((t) => t.key === params.tab)) current = params.tab;
    if (!TABS.some((t) => t.key === current)) current = 'history';

    return `<div class="page">
      ${appBar('非遗文化')}
      <div class="cul-tabs">
        ${TABS.map((t) => `<button class="cul-tab ${t.key === current ? 'on' : ''}" data-tab="${t.key}">${t.name}</button>`).join('')}
      </div>
      <div class="page-body" id="culBody"></div>
    </div>`;
  },

  mount(el) {
    const body = el.querySelector('#culBody');

    const paint = () => {
      el.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === current));
      body.innerHTML = (TAB_BODY[current] || TAB_BODY.history)();
      body.scrollTop = 0;
    };

    el.querySelectorAll('[data-tab]').forEach((b) => {
      b.onclick = () => { current = b.dataset.tab; paint(); };
    });

    el.querySelector('[data-act="back"]').onclick = () => back('/home');
    paint();
  }
};

/* ============ 各分栏内容 ============ */
const TAB_BODY = {
  history() {
    return `
      <div class="pad-y">
        <div class="card card-pad" style="margin-bottom:14px;background:var(--grad-brand-soft);border:1px solid #CFEAE5">
          <h2 class="font-serif" style="font-size:19px;font-weight:800;color:var(--kt-green-d)">${esc(LACQUER_HISTORY.title)}</h2>
          <p style="font-size:13px;color:var(--tile-gray);margin-top:6px">${esc(LACQUER_HISTORY.subtitle)}</p>
        </div>
      </div>
      <div class="timeline">
        ${LACQUER_HISTORY.timeline.map((t) => `
          <div class="tl-item">
            <div class="tl-dot"></div>
            <div class="tl-body">
              <div class="tl-era">${esc(t.era)}</div>
              <div class="tl-title font-serif">${esc(t.title)}</div>
              <div class="tl-desc">${esc(t.desc)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="height:20px"></div>`;
  },

  step() {
    return `
      <div class="pad-y">
        <div class="card card-pad" style="margin-bottom:14px;background:linear-gradient(135deg,#FFF6E0,#FFEBD6);border:1px solid #FFE0B8">
          <h2 class="font-serif" style="font-size:19px;font-weight:800;color:var(--tt-gold-d)">漂漆六步法</h2>
          <p style="font-size:13px;color:var(--tile-gray);margin-top:6px">静 · 调 · 滴 · 拨 · 吸 · 浸 —— 一沉一提，天下无二</p>
        </div>
      </div>
      <div class="step-list">
        ${PIAOQI_STEPS.map((s, i) => `
          <div class="step-row">
            <div class="step-no" style="background:${s.grad}">${s.name}</div>
            <div class="step-c">
              <div class="h"><span class="n">${i + 1}. ${esc(s.full)}</span></div>
              <div class="d">${esc(s.desc)}</div>
              <div class="tip">${BULB} ${esc(s.tip)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="height:20px"></div>`;
  },

  pattern() {
    return `
      <div class="pad-y">
        <div class="card card-pad" style="margin-bottom:14px;background:linear-gradient(135deg,#FFEEF3,#FFE6EF);border:1px solid #FFD3DE">
          <h2 class="font-serif" style="font-size:19px;font-weight:800;color:#D9537C">一纹一故事</h2>
          <p style="font-size:13px;color:var(--tile-gray);margin-top:6px">每一道纹样，都对应平凉的一处山水与一段人文</p>
        </div>
      </div>
      <div class="pat-list">
        ${PATTERNS.map((p) => `
          <div class="pat-card">
            <div class="pat-top" style="background:linear-gradient(135deg,${p.colorHex}, ${p.colorHex}BB)"></div>
            <div class="pat-body">
              <h3 class="font-serif">${esc(p.name)}</h3>
              <div class="o">${esc(p.origin)} · ${esc(catName(p.series))}</div>
              <div class="s">${esc(p.story)}</div>
              <div class="m">${esc(p.meaning)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="height:20px"></div>`;
  }
};
