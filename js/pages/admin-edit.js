/**
 * 卖家管理端 · 作品录入 / 编辑
 * 支持：系列与子类型选择、SN 自动生成与查重、多图上传、视频与封面上传、
 *       状态与上下架、NFC 标签绑定与写入（Android Chrome）
 * 路由：#/admin/edit?id=xxx（无 id 为新增）
 */

import { CATEGORIES } from '../data/content.js';
import { esc, toast, confirmBox, sheet, placeholderHtml } from '../core/ui.js';
import * as store from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUrl, pickAndSave, remove as mediaRemove } from '../core/media.js';
import { capability, writeTag, manualGuide } from '../core/nfc.js';

let form = null;
let isNew = true;

function blankForm() {
  return {
    id: '',
    sn: store.genSn(),
    name: '',
    category: 'fan',
    subType: '团扇',
    patternName: '',
    patternStory: '',
    craft: '',
    usage: '',
    price: '',
    status: 'unsold',
    onSale: true,
    featured: false,
    images: [],
    video: null,
    nfcTagId: ''
  };
}

export default {
  tab: null,
  title: () => (isNew ? '录入作品' : '编辑作品'),

  render(params) {
    if (!store.isAdmin()) {
      setTimeout(() => go('/admin/login', { replace: true }), 0);
      return `<div class="page"><div class="page-body"></div></div>`;
    }

    const id = params && params.id;
    const p = id ? store.getById(id) : null;
    isNew = !p;
    form = p ? JSON.parse(JSON.stringify(p)) : blankForm();

    const subs = (CATEGORIES.find((c) => c.key === form.category) || CATEGORIES[0]).subTypes;

    return `<div class="page">
      <div class="appbar brand">
        <button class="back" data-act="back">‹</button>
        <div class="title">${isNew ? '录入作品' : '编辑作品'}</div>
        <div class="right"><button data-act="save" style="font-weight:700">保存</button></div>
      </div>

      <div class="page-body">
        <!-- 基础信息 -->
        <div class="pad">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 12px"><h2>基础信息</h2></div>

            <div class="field">
              <label>所属系列</label>
              <div class="seg" id="catSeg">
                ${CATEGORIES.map((c) => `<button data-cat="${c.key}" class="${c.key === form.category ? 'on' : ''}">${esc(c.name)}</button>`).join('')}
              </div>
            </div>

            <div class="field">
              <label>作品类型</label>
              <div class="seg" id="subSeg">
                ${subs.map((s) => `<button data-sub="${esc(s)}" class="${s === form.subType ? 'on' : ''}">${esc(s)}</button>`).join('')}
              </div>
            </div>

            <div class="field">
              <label>作品名称</label>
              <input id="fName" placeholder="如：崆峒云海·团扇" value="${esc(form.name)}">
            </div>

            <div class="field">
              <label>专属序列号 SN</label>
              <div style="display:flex;gap:8px">
                <input id="fSn" value="${esc(form.sn)}" style="font-family:ui-monospace,Menlo,monospace;font-weight:700;letter-spacing:1px">
                <button class="btn sm ghost" data-act="gen-sn" style="flex:none">自动生成</button>
              </div>
              <div class="tip">规则 GY-年份-四位流水号；保存时自动查重，重复将无法提交</div>
            </div>
          </div>
        </div>

        <!-- 图片 -->
        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 12px"><h2>作品图片</h2><span class="more" id="imgCount"></span></div>
            <div class="up-grid" id="imgGrid"></div>
            <div class="tip" style="font-size:11.5px;color:var(--gray-3);margin-top:10px">
              建议 3–6 张：整体、纹样特写、细节、使用场景。第一张作为封面。
            </div>
          </div>
        </div>

        <!-- 视频 -->
        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 12px"><h2>介绍视频</h2></div>
            <div id="videoBox"></div>
            <div class="tip" style="font-size:11.5px;color:var(--gray-3);margin-top:10px">
              建议 15–60 秒，展示漂漆过程或成品转动。视频存于本机，离线可播。
            </div>
          </div>
        </div>

        <!-- 故事与工艺 -->
        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 12px"><h2>故事与工艺</h2></div>
            <div class="field">
              <label>纹样名称</label>
              <input id="fPattern" placeholder="如：崆峒云海" value="${esc(form.patternName)}">
            </div>
            <div class="field">
              <label>纹样故事（出处与寓意）</label>
              <textarea id="fStory" placeholder="一纹一故事：写清纹样取自平凉哪处山水、有何寓意">${esc(form.patternStory)}</textarea>
            </div>
            <div class="field">
              <label>工艺特色</label>
              <textarea id="fCraft" placeholder="如：漂漆六步法全手工完成；天然大漆 + 矿物色粉">${esc(form.craft)}</textarea>
            </div>
            <div class="field">
              <label>用途场景</label>
              <input id="fUsage" placeholder="如：夏日纳凉、汉服配饰、书房陈设" value="${esc(form.usage)}">
            </div>
          </div>
        </div>

        <!-- 价格与状态 -->
        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 12px"><h2>价格与状态</h2></div>
            <div class="field">
              <label>价格（元，留空表示非卖品）</label>
              <input id="fPrice" type="number" inputmode="numeric" placeholder="如 598" value="${esc(form.price)}">
            </div>
            <div class="field">
              <label>销售状态</label>
              <div class="seg" id="statusSeg">
                <button data-status="unsold" class="${form.status === 'unsold' ? 'on' : ''}">未售出</button>
                <button data-status="sold" class="${form.status === 'sold' ? 'on' : ''}">已售出</button>
              </div>
            </div>
            <div class="field">
              <label>展示设置</label>
              <div class="seg">
                <button data-onsale="1" class="${form.onSale !== false ? 'on' : ''}">上架展示</button>
                <button data-onsale="0" class="${form.onSale === false ? 'on' : ''}">下架隐藏</button>
                <button data-featured="1" class="${form.featured ? 'on' : ''}">设为精选</button>
              </div>
            </div>
          </div>
        </div>

        <!-- NFC -->
        <div class="pad-y">
          <div class="card card-pad">
            <div class="sec-head" style="padding:0 0 12px"><h2>NFC 芯片</h2></div>
            <div class="field">
              <label>标签编号（可选，便于内部管理）</label>
              <input id="fNfc" placeholder="如 NFC-GY-0001" value="${esc(form.nfcTagId)}">
            </div>
            <div class="nfc-write-box">
              <h4>📡 把序列号写进芯片</h4>
              <p>Android Chrome 支持直接在 App 内写入。写入后，买家手机碰一碰即可直达这件作品的详情页。</p>
              <div class="row-flex" style="margin-top:10px">
                <button class="btn sm block" data-act="write-nfc">写入 NFC 标签</button>
                <button class="btn sm gray block" data-act="nfc-guide">写入说明</button>
              </div>
              <div class="nfc-state" id="nfcState"></div>
            </div>
          </div>
        </div>

        <div class="pad-y" style="display:flex;gap:10px;margin-top:4px">
          <button class="btn block lg" data-act="save2">保存作品</button>
          ${isNew ? '' : '<button class="btn gray block lg" data-act="del">删除</button>'}
        </div>

        <div style="height:24px"></div>
      </div>
    </div>`;
  },

  mount(el) {
    if (!store.isAdmin()) return;

    const $ = (s) => el.querySelector(s);

    /* —— 系列 / 子类型 —— */
    const paintSubs = () => {
      const subs = (CATEGORIES.find((c) => c.key === form.category) || CATEGORIES[0]).subTypes;
      $('#subSeg').innerHTML = subs.map((s) => `<button data-sub="${esc(s)}" class="${s === form.subType ? 'on' : ''}">${esc(s)}</button>`).join('');
      bindSubs();
    };
    const bindSubs = () => {
      $('#subSeg').querySelectorAll('[data-sub]').forEach((b) => {
        b.onclick = () => {
          form.subType = b.dataset.sub;
          $('#subSeg').querySelectorAll('[data-sub]').forEach((x) => x.classList.toggle('on', x === b));
        };
      });
    };
    $('#catSeg').querySelectorAll('[data-cat]').forEach((b) => {
      b.onclick = () => {
        form.category = b.dataset.cat;
        $('#catSeg').querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b));
        const subs = (CATEGORIES.find((c) => c.key === form.category) || CATEGORIES[0]).subTypes;
        form.subType = subs[0];
        paintSubs();
      };
    });
    bindSubs();

    /* —— 状态 / 展示 —— */
    $('#statusSeg').querySelectorAll('[data-status]').forEach((b) => {
      b.onclick = () => {
        form.status = b.dataset.status;
        $('#statusSeg').querySelectorAll('[data-status]').forEach((x) => x.classList.toggle('on', x === b));
      };
    });
    el.querySelectorAll('[data-onsale]').forEach((b) => {
      b.onclick = () => {
        form.onSale = b.dataset.onsale === '1';
        el.querySelectorAll('[data-onsale]').forEach((x) => x.classList.toggle('on', (x.dataset.onsale === '1') === form.onSale));
      };
    });
    el.querySelectorAll('[data-featured]').forEach((b) => {
      b.onclick = () => {
        form.featured = !form.featured;
        b.classList.toggle('on', form.featured);
      };
    });

    /* —— 图片区 —— */
    const paintImages = async () => {
      const grid = $('#imgGrid');
      $('#imgCount').textContent = form.images.length ? form.images.length + ' / 9' : '';
      grid.innerHTML = '';
      for (const id of form.images) {
        const url = await getUrl(id);
        const cell = document.createElement('div');
        cell.className = 'up-cell';
        cell.innerHTML = `${url ? `<img src="${url}">` : placeholderHtml('image', 'small')}
          <button class="up-del" data-del-img="${esc(id)}">×</button>`;
        grid.appendChild(cell);
      }
      if (form.images.length < 9) {
        const add = document.createElement('button');
        add.className = 'up-add';
        add.innerHTML = '<span class="plus">＋</span><span>添加图片</span>';
        add.onclick = async () => {
          // IndexedDB 在隐私模式 / 存储超限下会失败，必须捕获并提示
          let ids = [];
          try {
            ids = await pickAndSave('image', true);
          } catch (e) {
            toast('保存失败：' + (e && e.message ? e.message : '存储空间不足或浏览器限制'), 2600);
            return;
          }
          if (!ids.length) return;
          form.images = form.images.concat(ids).slice(0, 9);
          paintImages();
          toast('已添加 ' + ids.length + ' 张图片');
        };
        grid.appendChild(add);
      }
      grid.querySelectorAll('[data-del-img]').forEach((b) => {
        b.onclick = async () => {
          const id = b.dataset.delImg;
          form.images = form.images.filter((x) => x !== id);
          await mediaRemove(id);
          paintImages();
        };
      });
    };
    paintImages();

    /* —— 视频区 —— */
    const paintVideo = async () => {
      const box = $('#videoBox');
      if (form.video && form.video.id) {
        const url = await getUrl(form.video.id);
        const poster = form.video.poster ? await getUrl(form.video.poster) : '';
        box.innerHTML = `
          <div class="up-cell" style="aspect-ratio:16/9">
            ${url ? `<video src="${url}" ${poster ? `poster="${poster}"` : ''} controls playsinline style="width:100%;height:100%;object-fit:cover"></video>` : placeholderHtml('video')}
            <button class="up-del" data-del-video="1">×</button>
          </div>
          <button class="btn sm ghost block" data-act="pick-poster" style="margin-top:10px">${form.video.poster ? '更换视频封面' : '上传视频封面'}</button>`;
        box.querySelector('[data-del-video]').onclick = async () => {
          const vid = form.video;
          form.video = null;
          if (vid) {
            await mediaRemove(vid.id);
            if (vid.poster) await mediaRemove(vid.poster);
          }
          paintVideo();
        };
        box.querySelector('[data-act="pick-poster"]').onclick = async () => {
          let ids = [];
          try {
            ids = await pickAndSave('image', false);
          } catch (e) {
            toast('保存失败：' + (e && e.message ? e.message : '存储限制'), 2600);
            return;
          }
          if (!ids.length) return;
          if (form.video.poster) await mediaRemove(form.video.poster);
          form.video.poster = ids[0];
          paintVideo();
          toast('封面已更新');
        };
      } else {
        box.innerHTML = `<button class="up-add" data-act="pick-video" style="width:100%;aspect-ratio:16/9">
          <span class="plus">▶</span><span>选择介绍视频</span></button>`;
        box.querySelector('[data-act="pick-video"]').onclick = async () => {
          let ids = [];
          try {
            ids = await pickAndSave('video', false);
          } catch (e) {
            toast('保存失败：' + (e && e.message ? e.message : '视频过大或存储受限'), 2600);
            return;
          }
          if (!ids.length) return;
          form.video = { id: ids[0], poster: '' };
          paintVideo();
          toast('视频已添加');
        };
      }
    };
    paintVideo();

    /* —— SN —— */
    $('#fSn').addEventListener('input', (e) => {
      form.sn = e.target.value.toUpperCase();
      e.target.value = form.sn;
    });
    $('[data-act="gen-sn"]').onclick = () => {
      form.sn = store.genSn();
      $('#fSn').value = form.sn;
      toast('已生成：' + form.sn);
    };

    /* —— NFC —— */
    $('[data-act="write-nfc"]').onclick = async () => {
      const sn = collect().sn;
      const cap = capability();
      const stateEl = $('#nfcState');
      if (!cap.canWrite) {
        stateEl.textContent = '⚠ ' + cap.reason;
        showGuide(sn);
        return;
      }
      stateEl.textContent = '请把手机贴近空白 NFC 标签…';
      try {
        await writeTag(sn, (s) => { stateEl.textContent = s; });
        toast('写入成功：' + sn);
      } catch (e) {
        stateEl.textContent = '⚠ ' + e.message;
        toast(e.message, 2600);
      }
    };
    $('[data-act="nfc-guide"]').onclick = () => showGuide(collect().sn);

    /* —— 保存 / 删除 / 返回 —— */
    const doSave = () => {
      const data = collect();
      if (!data.name.trim()) { toast('请填写作品名称'); return; }
      if (!data.sn.trim()) { toast('请填写序列号'); return; }
      const res = store.saveProduct(data);
      if (!res.ok) { toast(res.msg, 2400); return; }
      toast(res.msg);
      go('/admin/list', { replace: true });
    };

    $('[data-act="save"]').onclick = doSave;
    $('[data-act="save2"]').onclick = doSave;
    $('[data-act="back"]').onclick = () => back('/admin/list');

    if ($('[data-act="del"]')) {
      $('[data-act="del"]').onclick = async () => {
        const ok = await confirmBox('删除作品', `确定删除「${form.name}」（${form.sn}）？`, '删除');
        if (!ok) return;
        store.removeProduct(form.id);
        toast('已删除');
        go('/admin/list', { replace: true });
      };
    }
  }
};

/** 从表单收集数据 */
function collect() {
  const v = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  return {
    ...form,
    name: v('fName').trim(),
    sn: v('fSn').trim().toUpperCase(),
    patternName: v('fPattern').trim(),
    patternStory: v('fStory').trim(),
    craft: v('fCraft').trim(),
    usage: v('fUsage').trim(),
    price: v('fPrice') === '' ? '' : Number(v('fPrice')),
    nfcTagId: v('fNfc').trim()
  };
}

/** NFC 写入说明弹层 */
function showGuide(sn) {
  const g = manualGuide(sn);
  sheet(`
    <div class="sheet-title">NFC 标签写入说明</div>
    <div class="field">
      <label>① 网页链（推荐写入这条，任何手机都能打开）</label>
      <input readonly value="${esc(g.web)}" onclick="this.select()">
    </div>
    <div class="field">
      <label>② 深链（打包成原生 App 后可用）</label>
      <input readonly value="${esc(g.deep)}" onclick="this.select()">
    </div>
    <div class="field">
      <label>③ 操作步骤</label>
      <div style="font-size:13px;line-height:1.85;color:var(--text-2)">
        ${g.steps.map((s, i) => `${i + 1}. ${esc(s)}`).join('<br>')}
      </div>
    </div>
    <button class="btn block lg" data-act="close" style="margin-top:6px">知道了</button>
  `, (box, close) => {
    box.querySelector('[data-act="close"]').onclick = close;
  });
}
