/**
 * 项目介绍页（二级页）：指导思想 / 项目背景 / 总体思路 / 未来展望
 */

import { PROJECT, BRAND } from '../data/content.js';
import { esc } from '../core/ui.js';
import { appBar } from './parts.js';
import { back } from '../core/router.js';

export default {
  tab: null,
  title: () => '项目介绍',

  render() {
    const p = PROJECT;
    const bg = p.background;

    return `<div class="page">
      ${appBar('项目介绍')}
      <div class="page-body">
        <section class="pj-hero">
          <div class="deco-hill"></div>
          <h1 class="font-serif">古艺新创 · 平凉漆扇</h1>
          <p>${esc(BRAND.subSlogan)}</p>
        </section>

        <!-- 指导思想 -->
        <div class="pj-sec">
          <h2><i></i>${esc(p.guidelineTitle)}</h2>
          <div class="body">
            ${p.guideline.map((t) => `<li>${esc(t)}</li>`).join('')}
          </div>
        </div>

        <!-- 项目背景 -->
        <div class="pj-sec">
          <h2><i></i>${esc(p.backgroundTitle)}</h2>
          <div class="pj-cols">
            <div class="pj-col" style="background:var(--grad-brand)">
              <h4>${esc(bg.culture.title)}</h4>
              <ul style="margin-top:8px">${bg.culture.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            </div>
            <div class="pj-col" style="background:var(--grad-orange)">
              <h4>${esc(bg.pain.title)}</h4>
              <ul style="margin-top:8px">${bg.pain.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            </div>
          </div>
        </div>

        <!-- 总体思路 -->
        <div class="pj-sec">
          <h2><i></i>${esc(p.approachTitle)}</h2>
          <div class="body" style="margin-top:12px">
            ${p.approach.map((a) => `
              <div class="appr-card">
                <div class="appr-ico" style="background:${a.color}">${a.icon}</div>
                <div>
                  <h4 class="font-serif">${esc(a.name)}</h4>
                  <p>${esc(a.desc)}</p>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- 未来展望 -->
        <div class="pj-sec">
          <h2><i></i>${esc(p.futureTitle)}</h2>
          <div class="body" style="margin-top:8px">
            ${p.future.map((t, i) => `
              <div class="fu-item">
                <div class="fu-no" style="background:${['var(--grad-brand)', 'var(--grad-blue)', 'var(--grad-gold)', 'var(--grad-pink)'][i % 4]}">${i + 1}</div>
                <div class="fu-text">${esc(t)}</div>
              </div>`).join('')}
          </div>
        </div>

        <div style="height:20px"></div>
        <div class="ab-foot">${esc(BRAND.heritage)}</div>
        <div style="height:14px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    el.querySelector('[data-act="back"]').onclick = () => back('/home');
  }
};
