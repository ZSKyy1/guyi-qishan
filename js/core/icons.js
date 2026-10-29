/**
 * 图标库：全部为内联 SVG（currentColor 着色，1em 自适应字号）
 *
 * 为什么不用 emoji：
 * 部分安卓机型 / 精简 ROM 缺少彩色 emoji 字体，会把 🖼 🔍 渲染成「破图方框」，
 * 且不同系统 emoji 造型差异极大，国风界面观感不可控。SVG 无字体依赖、永不破图。
 */

const wrap = (body, extra = '') =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;

/* —— 导航 / 动作 —— */
export const SEARCH = wrap('<circle cx="11" cy="11" r="6.4"/><path d="M15.9 15.9L21 21"/>');
export const SEARCH_BOLD = wrap('<circle cx="10.8" cy="10.8" r="6.2" stroke-width="2.1"/><path d="M15.6 15.6L21 21" stroke-width="2.1"/>');
export const BACK = wrap('<path d="M14.5 5.5L7.5 12l7 6.5"/>');
export const ARROW_RIGHT = wrap('<path d="M9 5.5l6.5 6.5L9 18.5"/>');
export const PLUS = wrap('<path d="M12 5v14M5 12h14"/>');
export const PLAY = wrap('<path d="M9 6.2l9 5.8-9 5.8z" fill="currentColor" stroke="none"/>');
export const CHECK = wrap('<path d="M4.5 12.6l5 5L19.5 7"/>');
export const CROSS = wrap('<path d="M6 6l12 12M18 6L6 18"/>');
export const WARN = wrap('<path d="M12 4.2L21 19.6H3z"/><path d="M12 10v4.2M12 17.1v.1" stroke-width="2"/>');
export const CLOSE = wrap('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>');

/* —— 业务语义 —— */
export const FAN = wrap('<circle cx="12" cy="9.2" r="7.1"/><path d="M10.9 16.3h2.2v4.9h-2.2z" fill="currentColor" stroke="none"/><path d="M12 9.2v6.4M8.6 6.6l3.4 2.6 3.4-2.6" opacity=".55"/>');
export const SCROLL = wrap('<path d="M6 4.5h11a2 2 0 0 1 2 2v13H8a2 2 0 0 1-2-2z"/><path d="M6 4.5a2 2 0 0 0-2 2v1.2h2M9.5 9h6M9.5 12.6h6M9.5 16.2h3.6"/>');
export const MUSEUM = wrap('<path d="M12 3.2L21.2 9H2.8z"/><path d="M5.4 9v8.4M9.8 9v8.4M14.2 9v8.4M18.6 9v8.4"/><path d="M3.2 17.6h17.6v2.4H3.2z"/>');
export const USERS = wrap('<circle cx="9.2" cy="8.4" r="3.4"/><path d="M2.8 20c0-3.5 2.9-5.6 6.4-5.6s6.4 2.1 6.4 5.6"/><path d="M16.4 5.4a3 3 0 0 1 0 5.9M18 14.8c2 .5 3.3 2 3.3 4.2"/>');
export const NFC = wrap('<path d="M8.4 4.6a10 10 0 0 1 0 14.8M5 8a6 6 0 0 1 0 8"/><circle cx="14.4" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M18 8.6a5.2 5.2 0 0 1 0 6.8"/>');
export const SAVE = wrap('<path d="M12 3.6v10.2"/><path d="M7.8 10l4.2 4.2 4.2-4.2"/><path d="M4.2 17.4v1.8a2 2 0 0 0 2 2h11.6a2 2 0 0 0 2-2v-1.8"/>');
export const BOX = wrap('<path d="M12 3.2l8.4 4.4v8.8L12 20.8 3.6 16.4V7.6z"/><path d="M3.6 7.6L12 12l8.4-4.4M12 12v8.8"/>');
export const BOOKMARK = wrap('<path d="M6.4 3.6h11.2a1.4 1.4 0 0 1 1.4 1.4v15.4L12 16.2l-7 4.2V5a1.4 1.4 0 0 1 1.4-1.4z"/>');
export const COMPASS = wrap('<circle cx="12" cy="12" r="8.6"/><path d="M15.4 8.6l-2 4.8-4.8 2 2-4.8z" fill="currentColor" stroke="none"/>');
export const MEDAL = wrap('<circle cx="12" cy="14.6" r="5.2"/><path d="M8.6 9.2L6.2 3.4h11.6l-2.4 5.8"/><path d="M12 12.2l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" fill="currentColor" stroke="none"/>');
export const BULB = wrap('<path d="M9.2 17.4h5.6M10 20.4h4"/><path d="M12 3.4a5.8 5.8 0 0 1 3.2 10.6c-.5.4-.8.9-.8 1.5v1.3H9.6v-1.3c0-.6-.3-1.1-.8-1.5A5.8 5.8 0 0 1 12 3.4z"/>');
export const SHIELD = wrap('<path d="M12 3.2l7.6 2.8v5.8c0 4.2-3 7.4-7.6 9-4.6-1.6-7.6-4.8-7.6-9V6z"/><path d="M8.8 12l2.2 2.2 4.4-4.4"/>');
export const SPROUT = wrap('<path d="M12 20.6v-7.2"/><path d="M12 13.4C12 9.9 9.4 7.4 5.4 7.4c0 3.8 2.6 6 6.6 6z"/><path d="M12 12c0-3 2.4-5.2 6.2-5.2 0 3.2-2.4 5.2-6.2 5.2z"/>');
export const IMAGE = wrap('<rect x="3" y="4.6" width="18" height="14.8" rx="3.2"/><circle cx="8.4" cy="9.6" r="1.5" fill="currentColor" stroke="none"/><path d="M4.2 17.2l4.5-4.3 3.1 2.9 2.7-2.4 5.3 4.3"/>');
export const VIDEO = wrap('<circle cx="12" cy="12" r="8.8"/><path d="M10 8.4l6 3.6-6 3.6z" fill="currentColor" stroke="none"/>');
export const TRASH = wrap('<path d="M4.6 6.8h14.8M9.4 6.8V4.6h5.2v2.2"/><path d="M6.6 6.8l1 13.2h8.8l1-13.2"/><path d="M10.4 10.6v6M13.6 10.6v6"/>');
export const EDIT = wrap('<path d="M4.4 19.6h4l10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10z"/><path d="M13.8 7.4l3 3"/>');
export const UPLOAD = wrap('<path d="M12 20.4V8.8"/><path d="M7.8 12.6L12 8.4l4.2 4.2"/><path d="M4.2 6.6V4.8h15.6v1.8"/>');
export const FILTER = wrap('<path d="M3.6 6h16.8M6.6 12h10.8M9.8 18h4.4"/>');

export const ICONS = {
  search: SEARCH, scroll: SCROLL, museum: MUSEUM, users: USERS, nfc: NFC,
  save: SAVE, box: BOX, bookmark: BOOKMARK, fan: FAN, compass: COMPASS,
  medal: MEDAL, bulb: BULB, shield: SHIELD, sprout: SPROUT, image: IMAGE,
  video: VIDEO, play: PLAY, check: CHECK, cross: CROSS, trash: TRASH, edit: EDIT
};

/** 按名取图标（未知返回占位圆点） */
export function ico(name) {
  return ICONS[name] || wrap('<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>');
}
