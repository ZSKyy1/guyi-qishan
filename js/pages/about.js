/**
 * 关于我们（Tab）
 * 隐藏入口：连续点击顶部 Logo 5 次 → 进入卖家管理端
 */

import { BRAND, ABOUT } from '../data/content.js';
import { esc, toast, copyText, sheet, confirmBox } from '../core/ui.js';
import { go } from '../core/router.js';
import { capability } from '../core/nfc.js';
import * as store from '../core/store.js';
import { SCROLL, MUSEUM, USERS, NFC, SAVE } from '../core/icons.js';

let tapCount = 0;
let tapTimer = null;

export default {
  tab: 'about',
  title: () => '关于我们',

  render() {
    return `<div class="page">
      <div class="page-body" style="padding-bottom:0">
        <section class="ab-hero">
          <div class="deco-hill"></div>
          <img class="ab-logo" id="abLogo" src="icons/icon-192.png" alt="logo">
          <h1 class="font-serif">${esc(BRAND.shortName)}</h1>
          <div class="sl">${esc(BRAND.slogan)}</div>
          <div class="hr">${esc(BRAND.heritage)}</div>
          <div class="hr sub">${esc(BRAND.region)}</div>
        </section>

        <div class="pad" style="margin-top:-16px">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 10px"><h2>${esc(ABOUT.visionTitle)}</h2></div>
            <p style="font-size:14px;line-height:1.85;color:var(--text-2)">${esc(ABOUT.vision)}</p>
            <div class="val-grid" style="margin-top:14px">
              ${ABOUT.values.map((v) => `
                <div class="val-item">
                  <div class="n">${esc(v.name)}</div>
                  <div class="d">${esc(v.desc)}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 6px"><h2>更多信息</h2></div>
            <div class="ab-links">
              <button class="ab-row" data-go="/culture"><div class="l"><span class="ico">${SCROLL}</span>非遗文化</div><span class="arrow">›</span></button>
              <button class="ab-row" data-go="/project"><div class="l"><span class="ico">${MUSEUM}</span>项目介绍</div><span class="arrow">›</span></button>
              <button class="ab-row" data-go="/team"><div class="l"><span class="ico">${USERS}</span>团队介绍</div><span class="arrow">›</span></button>
              <button class="ab-row" data-act="nfc-check"><div class="l"><span class="ico">${NFC}</span>NFC 能力自检</div><span class="arrow">›</span></button>
              <button class="ab-row" data-act="backup"><div class="l"><span class="ico">${SAVE}</span>数据备份与恢复</div><span class="arrow">›</span></button>
            </div>
          </div>
        </div>

        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 6px"><h2>${esc(ABOUT.contactTitle)}</h2></div>
            <div class="ct-list">
              ${ABOUT.contacts.map((c) => `
                <div class="ct-item">
                  <span class="k">${esc(c.label)}</span>
                  <span class="v">${esc(c.value)}</span>
                  ${c.copyable ? `<button class="cp" data-copy="${esc(c.value)}">复制</button>` : '<span style="width:30px"></span>'}
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="ab-foot">
          ${esc(ABOUT.disclaimer)}<br>
          版本 1.0.0 · 独立 App（PWA）· 数据存于本机
        </div>
        <div style="height:22px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    // 入口跳转
    el.querySelectorAll('[data-go]').forEach((b) => {
      b.onclick = () => go(b.dataset.go);
    });

    // 复制
    el.querySelectorAll('[data-copy]').forEach((b) => {
      b.onclick = () => copyText(b.dataset.copy);
    });

    // NFC 自检
    el.querySelector('[data-act="nfc-check"]').onclick = () => {
      const cap = capability();
      sheet(`
        <div class="sheet-title">NFC 能力自检</div>
        <div class="pd-meta" style="margin:0;box-shadow:none;background:#F7FBFA">
          <div class="row"><span class="k">Web NFC 接口</span><span class="v">${cap.hasWebNfc ? '✓ 支持' : '✕ 不支持'}</span></div>
          <div class="row"><span class="k">安全上下文(HTTPS)</span><span class="v">${cap.secure ? '✓ 满足' : '✕ 不满足'}</span></div>
          <div class="row"><span class="k">系统</span><span class="v">${cap.isIOS ? 'iOS' : cap.isAndroid ? 'Android' : '桌面/其他'}</span></div>
          <div class="row"><span class="k">读标签</span><span class="v">${cap.canRead ? '✓ 可用' : '—'}</span></div>
          <div class="row"><span class="k">写标签</span><span class="v">${cap.canWrite ? '✓ 可用' : '—'}</span></div>
        </div>
        <p style="font-size:13px;line-height:1.8;color:var(--text-2);margin-top:14px">
          ${esc(cap.reason)}
          ${cap.isIOS ? '<br>iOS 建议：把 App 用 Capacitor 打包成原生应用，接入 NFC 插件后即可读标签；或使用二维码 / 手动输入 SN。' : ''}
          ${!cap.secure && cap.hasWebNfc ? '<br>请用 https:// 或 localhost 打开本 App 后重试。' : ''}
        </p>
        <button class="btn block lg" style="margin-top:16px" data-act="close">知道了</button>
      `, (box, close) => {
        box.querySelector('[data-act="close"]').onclick = close;
      });
    };

    // 备份与恢复（含全部作品档案与素材，公网环境下必须限管理员）
    el.querySelector('[data-act="backup"]').onclick = () => {
      if (!store.isAdmin()) {
        sheet(`
          <div class="sheet-title">需要管理端权限</div>
          <p style="font-size:13.5px;line-height:1.8;color:var(--text-2);text-align:center">
            备份文件包含全部作品档案与素材，仅项目成员可导出。<br>请先登录管理端。
          </p>
          <button class="btn block lg" data-act="gologin" style="margin-top:16px">进入管理端登录</button>
          <button class="btn gray block" data-act="close" style="margin-top:10px">返回</button>
        `, (box, close) => {
          box.querySelector('[data-act="gologin"]').onclick = () => { close(); go('/admin/login'); };
          box.querySelector('[data-act="close"]').onclick = close;
        });
        return;
      }
      sheet(`
        <div class="sheet-title">数据备份与恢复</div>
        <p style="font-size:13px;color:var(--text-2);line-height:1.75">
          数据存在本机（档案在 localStorage，图片视频在 IndexedDB）。<br>
          <b>换设备或清理浏览器数据前，务必先做「完整备份」</b>。
        </p>
        <div class="row-flex" style="margin-top:16px">
          <button class="btn block" data-act="export-full">完整备份（含素材）</button>
          <button class="btn gray block" data-act="export">仅档案</button>
        </div>
        <button class="btn ghost block lg" style="margin-top:10px" data-act="import">导入备份文件</button>
        <button class="btn gray block sm" style="margin-top:10px" data-act="reset">恢复示例数据</button>
        <p style="font-size:11.5px;color:var(--gray-3);line-height:1.7;margin-top:12px">
          · 完整备份：档案 + 图片视频（base64），文件较大，可完整还原<br>
          · 仅档案：体积小，可直接导入微信云开发数据库（字段一致）
        </p>
      `, (box, close) => {
        const download = (text, suffix) => {
          const blob = new Blob([text], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'guyi-backup-' + suffix + '-' + new Date().toISOString().slice(0, 10) + '.json';
          a.click();
          toast('已导出');
        };

        box.querySelector('[data-act="export"]').onclick = () => {
          download(store.exportJSON(), 'archive');
        };

        box.querySelector('[data-act="export-full"]').onclick = async () => {
          const btn = box.querySelector('[data-act="export-full"]');
          btn.disabled = true;
          btn.textContent = '正在打包素材…';
          try {
            const text = await store.exportFullJSON();
            download(text, 'full');
          } catch (e) {
            toast('导出失败：' + (e && e.message ? e.message : '未知错误'), 2600);
          }
          btn.disabled = false;
          btn.textContent = '完整备份（含素材）';
        };

        box.querySelector('[data-act="import"]').onclick = () => {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = 'application/json,.json';
          inp.onchange = () => {
            const f = inp.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = async () => {
              // 导入会覆盖现有全部数据，必须先确认
              const yes = await confirmBox('导入备份', '导入将覆盖当前所有作品与素材，且不可撤销。确定继续？', '覆盖导入');
              if (!yes) return;
              try {
                const res = await store.importFullJSON(r.result);
                const skip = res.skipped ? `（跳过 ${res.skipped} 条无效记录）` : '';
                toast(`已导入 ${res.products} 件作品${res.media ? '、' + res.media + ' 个素材' : ''}${skip}`, 2600);
                close();
                go('/home', { replace: true });
              } catch (e) {
                toast('导入失败：' + e.message, 2400);
              }
            };
            r.readAsText(f);
          };
          inp.click();
        };

        box.querySelector('[data-act="reset"]').onclick = () => {
          store.resetSeed();
          toast('已恢复示例数据');
          close();
          go('/home', { replace: true });
        };
      });
    };

    // 隐藏管理入口：连点 Logo 5 次
    const logo = el.querySelector('#abLogo');
    logo.onclick = () => {
      tapCount += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 1200);
      if (tapCount >= 3 && tapCount < 5) toast('再点 ' + (5 - tapCount) + ' 次进入管理端');
      if (tapCount >= 5) {
        tapCount = 0;
        go('/admin/login');
      }
    };
  }
};
