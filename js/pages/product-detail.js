/**
 * 作品详情页（NFC 唤起 / 手动查询 / 列表点击 三入口共用）
 * 路由：#/product?sn=GY-2026-0001&from=nfc
 */

import { esc, toast, copyText, viewImage, placeholderHtml } from '../core/ui.js';
import * as store from '../core/store.js';
import { go, back } from '../core/router.js';
import { appBar, catOf, statusText, hydrateMedia, videoBlock, hydrateVideo } from './parts.js';
import { CHECK, SEARCH, COMPASS } from '../core/icons.js';

export default {
  tab: null,
  title: (p) => (p && p.sn ? '作品详情' : '查询作品'),

  render(params) {
    const sn = (params.sn || '').toUpperCase();
    const p = sn ? store.getBySn(sn) : null;

    if (!p) return notFoundHtml(sn);

    const c = catOf(p.category);
    // 「我的藏品」只有两种情形成立：① 本机已登记该 SN；② 本次由 NFC 芯片唤起。
    // 注意：不能仅凭 status==='sold' 判定，否则任何访客查询已售作品都会误标「我的藏品」。
    const mine = store.inCollection(p.sn) || params.from === 'nfc';
    const imgs = (p.images && p.images.length) ? p.images : [];

    return `<div class="page">
      ${appBar('作品详情', { right: `<button data-act="home" style="color:var(--kt-green);font-weight:600">首页</button>` })}

      <div class="page-body">
        <!-- 图片轮播 -->
        <div class="pd-swiper">
          <div class="pd-track" id="track">
            ${imgs.length
              ? imgs.map((id) => `<div class="pd-slide" data-mid="${esc(id)}"></div>`).join('')
              : `<div class="pd-slide" data-mid="">${placeholderHtml('image', 'large', '替换为真实产品图')}</div>`}
          </div>
          <div class="pd-idx" id="pdIdx">${imgs.length ? '1 / ' + imgs.length : '暂无图片'}</div>
          ${imgs.length > 1 ? `<div class="pd-dots" id="pdDots">${imgs.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>` : ''}
        </div>

        <!-- 视频（仅在有素材时出现，避免首屏被空占位块占满） -->
        ${(p.video && p.video.id) ? videoBlock(p) : ''}

        <!-- 主体信息 -->
        <div class="pd-main">
          <h1 class="pd-title font-serif">${esc(p.name)}</h1>
          <div class="pd-tags">
            <span class="tag" style="background:${c.grad};color:#fff">${esc(c.name)}</span>
            ${p.subType ? `<span class="tag blue">${esc(p.subType)}</span>` : ''}
            ${p.patternName ? `<span class="tag pink">${esc(p.patternName)}</span>` : ''}
            <span class="tag ${p.status === 'sold' ? 'gray' : 'gold'}">${statusText(p.status)}</span>
          </div>
          <div class="pd-price-row">
            ${p.price ? `<span class="pd-currency">¥</span><span class="pd-price">${esc(p.price)}</span>` : '<span class="pd-price" style="font-size:18px">非卖品 · 展示作品</span>'}
            ${p.price ? '<span class="pd-origin">手工孤品 · 一物一码</span>' : ''}
          </div>

          <div class="pd-snbox">
            <div class="left">
              <div class="t">专属序列号 SN</div>
              <div class="v">${esc(p.sn)}</div>
            </div>
            <button class="btn sm ghost copy" data-act="copy-sn">复制</button>
          </div>

          ${mine ? `<div class="pd-mine">${CHECK} 我的藏品 · 此件作品已登记在你的名下</div>` : ''}
        </div>

        <!-- 纹样故事 -->
        <div class="pd-sec">
          <h3><i></i>纹样故事</h3>
          ${p.patternName ? `<span class="pattern-name">${esc(p.patternName)}</span>` : ''}
          <p>${esc(p.patternStory || '暂无纹样故事，可在管理端补充。')}</p>
        </div>

        <!-- 工艺特色 -->
        <div class="pd-sec">
          <h3><i></i>工艺特色</h3>
          <p>${esc(p.craft || '漂漆六步法：静、调、滴、拨、吸、浸。')}</p>
        </div>

        <!-- 用途场景 -->
        <div class="pd-sec">
          <h3><i></i>用途场景</h3>
          <p>${esc(p.usage || '日常把玩、空间陈设、非遗礼赠。')}</p>
        </div>

        <!-- 档案信息 -->
        <div class="pd-meta">
          <div class="row"><span class="k">所属系列</span><span class="v">${esc(c.name)}</span></div>
          <div class="row"><span class="k">作品类型</span><span class="v">${esc(p.subType || '—')}</span></div>
          <div class="row"><span class="k">销售状态</span><span class="v">${statusText(p.status)}</span></div>
          <div class="row"><span class="k">NFC 标签</span><span class="v">${esc(p.nfcTagId || '未绑定')}</span></div>
          <div class="row"><span class="k">建档时间</span><span class="v">${fmtDate(p.createdAt)}</span></div>
          <div class="row"><span class="k">最近更新</span><span class="v">${fmtDate(p.updatedAt)}</span></div>
        </div>

        <div style="height:14px"></div>
        <div class="ab-foot">${params.from === 'nfc' ? '本次由 NFC 芯片唤起 · ' : ''}一物一码，真伪可查</div>
        <div style="height:10px"></div>
      </div>

      <!-- 底部操作栏 -->
      <div class="pd-bar">
        <button class="icon-btn" data-act="sn-query" title="查询其他">${SEARCH}</button>
        <button class="btn ${store.inCollection(p.sn) ? 'ghost' : ''}" data-act="collect">
          ${store.inCollection(p.sn) ? '已在藏品中' : '＋ 加入我的藏品'}
        </button>
        <button class="btn gold" data-act="nfc">碰一碰</button>
      </div>
    </div>`;
  },

  async mount(el, params) {
    const sn = (params.sn || '').toUpperCase();

    // 未找到
    if (el.querySelector('[data-act="retry"]')) {
      el.querySelector('[data-act="retry"]').onclick = () => go('/sn-query?sn=' + encodeURIComponent(sn));
      el.querySelector('[data-act="gohome"]').onclick = () => go('/home', { replace: true });
      el.querySelector('[data-act="back"]').onclick = () => back('/home');
      return;
    }

    // 返回 / 首页
    el.querySelector('[data-act="back"]').onclick = () => back('/products');
    el.querySelector('[data-act="home"]').onclick = () => go('/home', { replace: true });

    // 素材回填
    await hydrateMedia(el);
    await hydrateVideo(el);

    // 轮播指示器
    const track = el.querySelector('#track');
    const idx = el.querySelector('#pdIdx');
    const dots = el.querySelector('#pdDots');
    const total = track ? track.children.length : 0;
    if (track && total > 1) {
      track.addEventListener('scroll', () => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (idx) idx.textContent = (i + 1) + ' / ' + total;
        if (dots) Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === i));
      }, { passive: true });
    }
    // 点击图片全屏查看（单图同样支持）
    track.querySelectorAll('.pd-slide img').forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.onclick = () => viewImage(img.src);
    });

    // 复制 SN
    el.querySelector('[data-act="copy-sn"]').onclick = () => copyText(sn);

    // 收藏切换
    el.querySelector('[data-act="collect"]').onclick = (e) => {
      const now = store.toggleCollection(sn);
      toast(now ? '已加入我的藏品' : '已移出我的藏品');
      e.target.textContent = now ? '已在藏品中' : '＋ 加入我的藏品';
      e.target.classList.toggle('ghost', now);
    };

    // 查询其他
    el.querySelector('[data-act="sn-query"]').onclick = () => go('/sn-query');

    // 碰一碰
    el.querySelector('[data-act="nfc"]').onclick = async () => {
      const { capability, readOnce } = await import('../core/nfc.js');
      const cap = capability();
      if (!cap.canRead) { toast(cap.reason, 2400); return; }
      const btn = el.querySelector('[data-act="nfc"]');
      const old = btn.textContent;
      btn.textContent = '贴近芯片…';
      try {
        const s = await readOnce(30000);
        go('/product?sn=' + encodeURIComponent(s) + '&from=nfc', { replace: true });
      } catch (err) {
        toast(err.message || '读取失败');
        btn.textContent = old;
      }
    };
  }
};

function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 未找到（友好提示页） */
function notFoundHtml(sn) {
  return `<div class="page">
    ${appBar('查询作品')}
    <div class="page-body">
      <div class="nf">
        <div class="ico">${COMPASS}</div>
        <h3>没有找到这件作品</h3>
        <p>${sn ? `序列号 <b>${esc(sn)}</b> 暂未登记。<br>请确认是否输入有误，或联系出品方核实。` : '未提供序列号。<br>请输入作品上的专属序列号，或碰一碰产品上的 NFC 芯片。'}</p>
        <div class="acts">
          <button class="btn ghost" data-act="gohome">回首页</button>
          <button class="btn" data-act="retry">重新输入</button>
        </div>
      </div>
      <div class="snq-tips">
        <h3>可能的原因</h3>
        <ul>
          <li>序列号中的 0 与字母 O、1 与字母 I 容易看错</li>
          <li>该作品尚未在管理端建档</li>
          <li>NFC 芯片写入的链接有误，可改用手动输入</li>
        </ul>
      </div>
    </div>
  </div>`;
}
