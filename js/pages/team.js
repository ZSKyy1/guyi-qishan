/**
 * 团队介绍页（二级页）：四位成员以职称展示
 */

import { TEAM, BRAND } from '../data/content.js';
import { esc } from '../core/ui.js';
import { appBar } from './parts.js';
import { back } from '../core/router.js';

export default {
  tab: null,
  title: () => '团队介绍',

  render() {
    return `<div class="page">
      ${appBar('团队介绍')}
      <div class="page-body">
        <section class="pj-hero">
          <div class="deco-hill"></div>
          <h1 class="font-serif">四人工坊 · 各守一艺</h1>
          <p>文化解说 · 项目策划 · 核心设计 · 实践操作 —— 一条从山水到器物的完整链路</p>
        </section>

        <div class="team-list">
          ${TEAM.map((m) => `
            <div class="mem-card">
              <div class="mem-top">
                <div class="mem-avatar" style="background:${m.color}">${esc(m.avatarText)}</div>
                <div>
                  <div class="nm font-serif">${esc(m.name)}<span class="mem-gender ${m.gender === '女' ? 'is-f' : 'is-m'}">${esc(m.gender)}</span></div>
                  <div class="ti" style="background:${m.color}22;color:${m.color}">${esc(m.title)}</div>
                </div>
              </div>
              <div class="mem-duty">${esc(m.duty)}</div>
              <div class="mem-tags">
                ${m.tags.map((t) => `<span class="tag gray">${esc(t)}</span>`).join('')}
              </div>
              <div class="mem-quote">「${esc(m.quote)}」</div>
            </div>`).join('')}
        </div>

        <div class="pad-y">
          <div class="card card-pad">
            <p style="font-size:13.5px;line-height:1.85;color:var(--text-2)">
              团队以「守护技艺、激活市场、培育生态」为总体思路，让国家级非遗大漆髹饰技艺
              在平凉的山水之间继续流动。${esc(BRAND.region)} · ${esc(BRAND.heritage)}
            </p>
          </div>
        </div>

        <div style="height:20px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    el.querySelector('[data-act="back"]').onclick = () => back('/home');
  }
};
