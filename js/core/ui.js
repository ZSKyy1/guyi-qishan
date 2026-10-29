/**
 * UI 工具层：DOM 构建、事件委托、Toast、底部弹层、确认框、图片查看器、复制
 */

/** HTML 转义（所有用户输入渲染前必须过一遍） */
export function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 由 HTML 字符串创建元素 */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** 事件委托 */
export function delegate(root, selector, type, handler) {
  root.addEventListener(type, (e) => {
    const t = e.target.closest(selector);
    if (t && root.contains(t)) handler(e, t);
  });
}

/* ============ Toast ============ */
let toastTimer = null;
export function toast(msg, ms = 1900) {
  const root = document.getElementById('toastRoot');
  if (!root) return;
  root.innerHTML = '';
  const el = h(`<div class="toast">${esc(msg)}</div>`);
  root.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.remove(); }, ms);
}

/* ============ 底部弹层 ============ */
export function sheet(html, onMount) {
  const root = document.getElementById('overlayRoot');
  const wrap = h(`<div class="modal-mask"><div class="sheet">${html}</div></div>`);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  root.appendChild(wrap);
  if (onMount) onMount(wrap.querySelector('.sheet'), close);
  return close;
}

/** 确认框：返回 Promise<boolean> */
export function confirmBox(title, text, okText = '确定') {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); close(); } };
    const close = sheet(
      `<div class="sheet-title">${esc(title)}</div>
       <p style="font-size:14px;line-height:1.75;color:var(--text-2);text-align:center;margin-bottom:20px">${esc(text)}</p>
       <div class="row-flex">
         <button class="btn gray block" data-act="no">取消</button>
         <button class="btn block" data-act="yes">${esc(okText)}</button>
       </div>`,
      (box, cl) => {
        cl = cl || (() => box.closest('.modal-mask').remove());
        box.querySelector('[data-act="yes"]').onclick = () => finish(true);
        box.querySelector('[data-act="no"]').onclick = () => finish(false);
      }
    );
  });
}

/** 输入弹层：返回 Promise<string|null> */
export function promptBox(title, defValue = '', placeholder = '') {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    sheet(
      `<div class="sheet-title">${esc(title)}</div>
       <div class="field"><input id="pbInput" value="${esc(defValue)}" placeholder="${esc(placeholder)}"></div>
       <div class="row-flex">
         <button class="btn gray block" data-act="no">取消</button>
         <button class="btn block" data-act="yes">确定</button>
       </div>`,
      (box, close) => {
        const inp = box.querySelector('#pbInput');
        setTimeout(() => inp.focus(), 60);
        box.querySelector('[data-act="yes"]').onclick = () => { const v = inp.value.trim(); finish(v || null); close(); };
        box.querySelector('[data-act="no"]').onclick = () => { finish(null); close(); };
      }
    );
  });
}

/* ============ 图片查看器 ============ */
export function viewImage(src) {
  const v = document.getElementById('viewer');
  const img = document.getElementById('viewerImg');
  img.src = src;
  v.hidden = false;
}
document.getElementById('viewerClose')?.addEventListener('click', () => {
  document.getElementById('viewer').hidden = true;
});
document.getElementById('viewer')?.addEventListener('click', (e) => {
  if (e.target.id === 'viewer') e.currentTarget.hidden = true;
});

/* ============ 复制 ============ */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制：' + text);
    return true;
  } catch (e) {
    // 降级：execCommand
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制：' + text); } catch (_) { toast('复制失败，请手动记录'); }
    ta.remove();
    return false;
  }
}

/** 空态 HTML */
export function emptyHtml(icon, title, sub = '') {
  return `<div class="empty"><div class="e-ico">${icon}</div><div class="e-t">${esc(title)}</div>${sub ? `<div class="e-s">${esc(sub)}</div>` : ''}</div>`;
}

/** 占位素材块（提示用户替换为真实图/视频） */
export function placeholderHtml(type = 'image', size = 'large', text = '') {
  const isVideo = type === 'video';
  const ico = isVideo ? '▶' : '🖼';
  const t = text || (isVideo ? '替换为真实产品视频' : '替换为真实产品图');
  const sub = isVideo ? '管理端上传后立即在此播放' : '管理端上传后立即展示';
  return `<div class="ph ${size === 'small' ? 'small' : ''}">
    <div class="ph-ico">${ico}</div>
    <div class="ph-text">${esc(t)}</div>
    <div class="ph-sub">${esc(sub)}</div>
  </div>`;
}
