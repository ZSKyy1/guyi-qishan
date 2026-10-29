/**
 * 序列号查询页（NFC 之外的备用入口）
 * 路由：#/sn-query?sn=GY-2026-0001
 */

import { esc, toast } from '../core/ui.js';
import * as store from '../core/store.js';
import { go, back } from '../core/router.js';
import { appBar } from './parts.js';
import { extractSn } from '../core/sn.js';
import { capability, readOnce } from '../core/nfc.js';

export default {
  tab: null,
  title: () => '序列号查询',

  render(params) {
    const samples = store.onSaleProducts().slice(0, 4).map((p) => p.sn);

    return `<div class="page">
      ${appBar('序列号查询')}
      <div class="page-body">
        <section class="snq-hero">
          <div class="deco-wave"></div>
          <div class="ico">🔎</div>
          <h2>一物一码 · 真伪可查</h2>
          <p>输入作品上的专属序列号，查看它的纹样故事与工艺档案</p>
        </section>

        <div class="snq-form">
          <div class="snq-inp" id="inpWrap">
            <input id="snInput" placeholder="如 GY-2026-0001" value="${esc(params.sn || '')}" autocomplete="off">
            <button class="clear" data-act="clear">×</button>
          </div>
          <div class="snq-hint">序列号规则：GY-年份-四位流水号（大小写均可自动识别）</div>
          <button class="btn block lg snq-btn" data-act="query">查询这件作品</button>

          <button class="btn ghost block lg" data-act="nfc" style="margin-top:10px">📡 碰一碰读 NFC 芯片</button>

          ${samples.length ? `
            <div style="font-size:12px;color:var(--gray-2);margin-top:16px">示例序列号（点击直接填入）</div>
            <div class="snq-samples">
              ${samples.map((s) => `<span class="s" data-sn="${esc(s)}">${esc(s)}</span>`).join('')}
            </div>` : ''}
        </div>

        <div class="snq-tips">
          <h3>序列号在哪里？</h3>
          <ul>
            <li>扇柄 / 伞柄内侧的烫金编号</li>
            <li>随作品附带的「SN 证书卡」</li>
            <li>产品内嵌 NFC 芯片（碰一碰自动识别）</li>
          </ul>
        </div>

        <div class="snq-tips">
          <h3>碰一碰是怎么工作的？</h3>
          <ul>
            <li>每件作品内嵌一枚 NFC 芯片，写入了该作品的序列号</li>
            <li>手机贴近芯片 → 自动打开 App → 直达这件作品的详情页</li>
            <li>Android Chrome 支持直接读写芯片；iOS 请使用本页手动输入</li>
          </ul>
        </div>

        <div style="height:24px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    const input = el.querySelector('#snInput');
    const wrap = el.querySelector('#inpWrap');

    input.addEventListener('focus', () => wrap.classList.add('focus'));
    input.addEventListener('blur', () => wrap.classList.remove('focus'));
    input.addEventListener('input', () => {
      const pos = input.selectionStart;
      input.value = input.value.toUpperCase();
      input.setSelectionRange(pos, pos);
    });

    el.querySelector('[data-act="clear"]').onclick = () => { input.value = ''; input.focus(); };

    const submit = () => {
      const raw = input.value.trim();
      if (!raw) { toast('请输入序列号'); return; }
      const sn = extractSn(raw);
      go('/product?sn=' + encodeURIComponent(sn));
    };

    el.querySelector('[data-act="query"]').onclick = submit;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

    el.querySelectorAll('[data-sn]').forEach((b) => {
      b.onclick = () => { input.value = b.dataset.sn; submit(); };
    });

    el.querySelector('[data-act="nfc"]').onclick = async () => {
      const cap = capability();
      if (!cap.canRead) {
        toast(cap.reason, 2800);
        return;
      }
      const btn = el.querySelector('[data-act="nfc"]');
      const old = btn.textContent;
      btn.textContent = '请把手机贴近芯片…';
      btn.disabled = true;
      try {
        const sn = await readOnce(30000);
        toast('识别成功：' + sn);
        go('/product?sn=' + encodeURIComponent(sn) + '&from=nfc');
      } catch (e) {
        toast(e.message || '读取失败', 2400);
        btn.textContent = old;
        btn.disabled = false;
      }
    };

    el.querySelector('[data-act="back"]').onclick = () => back('/home');
  }
};
