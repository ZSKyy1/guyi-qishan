/**
 * App 启动入口
 * 1. 初始化本地数据（首次启动写入 8 件示例作品）
 * 2. 注册路由
 * 3. 状态栏时钟、桌面端辅助按钮、PWA 安装
 */

import * as store from './core/store.js';
import { define, start } from './core/router.js';
import { toast, sheet } from './core/ui.js';
import { capability } from './core/nfc.js';

import home from './pages/home.js';
import products from './pages/products.js';
import productDetail from './pages/product-detail.js';
import snQuery from './pages/sn-query.js';
import collection from './pages/collection.js';
import about from './pages/about.js';
import culture from './pages/culture.js';
import project from './pages/project.js';
import team from './pages/team.js';
import adminLogin from './pages/admin-login.js';
import adminList from './pages/admin-list.js';
import adminEdit from './pages/admin-edit.js';

/* ============ 1. 数据初始化 ============ */
store.ensureSeed();

/* ============ 2. 路由注册 ============ */
define('/home', home);
define('/products', products);
define('/product', productDetail);
define('/sn-query', snQuery);
define('/collection', collection);
define('/about', about);
define('/culture', culture);
define('/project', project);
define('/team', team);
define('/admin/login', adminLogin);
define('/admin/list', adminList);
define('/admin/edit', adminEdit);

/* ============ 3. 启动 ============ */
start();

/* ============ 4. 状态栏时钟 ============ */
function tickClock() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const el = document.getElementById('sbTime');
  if (el) el.textContent = `${d.getHours()}:${p(d.getMinutes())}`;
}
tickClock();
setInterval(tickClock, 30000);

/* ============ 5. 桌面端辅助按钮 ============ */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

document.getElementById('deskInstall')?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const r = await deferredPrompt.userChoice;
    toast(r.outcome === 'accepted' ? '已开始安装' : '已取消');
    deferredPrompt = null;
  } else {
    sheet(`
      <div class="sheet-title">装到手机上的三种方式</div>
      <div style="font-size:13.5px;line-height:1.8;color:var(--text-2)">
        <p><b>① 马上就能用（同 Wi-Fi）</b><br>
        扫左侧二维码，或手机浏览器打开 <span id="lanUrl2" style="font-family:ui-monospace,Menlo,monospace">—</span><br>
        <span style="color:var(--gray-2)">可浏览全部功能；因非 HTTPS，NFC 与「添加到主屏幕」不可用</span></p>

        <p style="margin-top:12px"><b>② 真正装成手机 App（推荐）</b><br>
        把 app/ 部署到 HTTPS（GitHub Pages / Vercel / 腾讯云 COS 都行，免费）→
        手机打开 → Android「菜单 → 添加到主屏幕」、iPhone「分享 → 添加到主屏幕」<br>
        <span style="color:var(--gray-2)">装成后是独立图标、全屏无地址栏，NFC 也可用</span></p>

        <p style="margin-top:12px"><b>③ 打包成 APK 安装</b><br>
        <span style="font-family:ui-monospace,Menlo,monospace;font-size:12px">npx cap init 古艺新创 cn.guyi.qishan --web-dir . && npx cap add android && npx cap sync</span><br>
        <span style="color:var(--gray-2)">详见 docs/独立APP使用与打包说明.md</span></p>
      </div>
      <button class="btn block lg" data-act="close" style="margin-top:16px">知道了</button>
    `, async (box, close) => {
      box.querySelector('[data-act="close"]').onclick = close;
      try {
        const d = await (await fetch('lan.json', { cache: 'no-store' })).json();
        const el = box.querySelector('#lanUrl2');
        if (el && d.url) el.textContent = d.url;
      } catch (e) { /* 忽略 */ }
    });
  }
});

/* ============ 桌面端：显示手机扫码入口（读取 tools/gen_lan_qr.js 生成的 lan.json） ============ */
(async function showLanQr() {
  const box = document.getElementById('deskQr');
  if (!box) return;
  try {
    const res = await fetch('lan.json', { cache: 'no-store' });
    const data = await res.json();
    if (!data || !data.url) return;
    const u = document.getElementById('dqUrl');
    if (u) u.textContent = data.url;
    box.hidden = false;
  } catch (e) {
    // 未生成二维码时静默隐藏（运行 node tools/gen_lan_qr.js 即可生成）
  }
})();

document.getElementById('deskNfc')?.addEventListener('click', () => {
  const cap = capability();
  sheet(`
    <div class="sheet-title" style="display:none"></div>
    <div class="pd-meta" style="margin:0;box-shadow:none;background:#F7FBFA">
      <div class="row"><span class="k">Web NFC 接口</span><span class="v">${cap.hasWebNfc ? '✅ 支持' : '❌ 不支持'}</span></div>
      <div class="row"><span class="k">安全上下文</span><span class="v">${cap.secure ? '✅ 满足' : '❌ 需 HTTPS'}</span></div>
      <div class="row"><span class="k">读标签</span><span class="v">${cap.canRead ? '✅ 可用' : '需手机 + HTTPS'}</span></div>
      <div class="row"><span class="k">写标签</span><span class="v">${cap.canWrite ? '✅ 可用' : '需 Android Chrome'}</span></div>
    </div>
    <p style="font-size:13px;line-height:1.8;color:var(--text-2);margin-top:14px">${cap.reason}</p>
    <button class="btn block lg" data-act="close" style="margin-top:14px">知道了</button>
  `, (box, close) => { box.querySelector('[data-act="close"]').onclick = close; });
});

/* ============ 6. 全局兜底：未捕获错误提示（便于定位） ============ */
window.addEventListener('error', (e) => {
  console.error('[app error]', e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.warn('[promise]', e.reason);
});
