/**
 * NFC 能力封装（APP 版）
 *
 * 与小程序版的差异（重要）：
 * 1. Android Chrome 89+ 支持 Web NFC（NDEFReader），可【读】标签，也可以【写】标签 ——
 *    这意味着卖家可以直接在 App 内把 SN 写进空白 NTAG 芯片，无需另装 NFC Tools。
 *    前置条件：HTTPS（或 localhost）+ 用户手势触发 + 非 iOS。
 * 2. iOS Safari 至今不支持 Web NFC（系统能力未对浏览器开放）。
 *    兜底方案：① 深链 guyi://product?sn=xxx（打包成原生 App 后可用）；
 *             ② 二维码（贴纸/证书）；③ 手动输入 SN。
 * 3. 打包为原生 App（Capacitor）后，可通过 NFC 插件获得 iOS 读标签能力（需 Apple  entitlements）。
 */

import { extractSn } from './sn.js';

/** 能力自检 */
export function capability() {
  const hasWebNfc = typeof window !== 'undefined' && 'NDEFReader' in window;
  const secure = window.isSecureContext || location.protocol === 'https:' ||
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  return {
    hasWebNfc,
    secure,
    isIOS,
    isAndroid,
    canRead: hasWebNfc && secure,
    canWrite: hasWebNfc && secure,
    reason: !hasWebNfc
      ? (isIOS ? '当前为 iOS 浏览器，系统未开放 Web NFC，请使用二维码或手动输入 SN' : '当前浏览器不支持 Web NFC，请使用二维码或手动输入 SN')
      : (!secure ? 'NFC 需要 HTTPS 或 localhost 环境' : '可用')
  };
}

/** 深链（原生 App / Android App Link 用） */
export function deepLink(sn) {
  return `guyi://product?sn=${encodeURIComponent(sn)}`;
}

/** 网页链（任意手机扫码/点开都能落到详情页） */
export function webLink(sn) {
  const base = location.origin && location.protocol.startsWith('http')
    ? location.origin + location.pathname
    : 'https://guyi.example/app';
  return `${base}#/product?sn=${encodeURIComponent(sn)}&from=nfc`;
}

/** 从 NDEF 记录里抽出文本 / URL */
function recordText(record) {
  try {
    if (record.recordType === 'url' || record.recordType === 'absolute-url') {
      return new TextDecoder().decode(record.data);
    }
    if (record.recordType === 'text') {
      // text 记录首字节为语言长度
      const buf = new Uint8Array(record.data);
      return new TextDecoder(record.encoding || 'utf-8').decode(buf);
    }
    if (record.recordType === 'mime' || record.recordType === 'unknown') {
      return new TextDecoder().decode(record.data);
    }
  } catch (e) { /* ignore */ }
  return '';
}

/**
 * 读一次 NFC 标签 → 返回 SN
 * @param {number} timeout 毫秒
 * @param {(state:string)=>void} onState 状态回调
 */
export function readOnce(timeout = 30000, onState) {
  const cap = capability();
  if (!cap.canRead) return Promise.reject(new Error(cap.reason));
  return new Promise((resolve, reject) => {
    const ndef = new NDEFReader();
    const ctrl = new AbortController();
    let done = false;

    const timer = setTimeout(() => {
      if (!done) { done = true; ctrl.abort(); reject(new Error('等待超时，未检测到标签')); }
    }, timeout);

    const finish = (fn, val) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { ctrl.abort(); } catch (e) { /* ignore */ }
      fn(val);
    };

    ndef.scan({ signal: ctrl.signal }).then(() => {
      onState && onState('请把手机贴近产品上的 NFC 芯片…');
    }).catch((err) => finish(reject, err));

    ndef.addEventListener('reading', (event) => {
      let sn = '';
      for (const r of event.message.records) {
        const txt = recordText(r);
        const cand = extractSn(txt);
        if (cand) { sn = cand; break; }
      }
      if (sn) finish(resolve, sn);
      else finish(reject, new Error('标签内容中未找到序列号（SN）'));
    });

    ndef.addEventListener('error', (event) => {
      finish(reject, new Error('读取失败：' + (event.message || '未知错误')));
    });
  });
}

/**
 * 把 SN 写入空白 NFC 标签（Android Chrome）
 * 写入两条记录：① 深链 guyi://product?sn=xxx  ② 网页链 https://...#/product?sn=xxx
 * iOS 若支持原生 NFC 会识别深链，其他设备读网页链。
 */
export function writeTag(sn, onState) {
  const cap = capability();
  if (!cap.canWrite) return Promise.reject(new Error(cap.reason));
  return new Promise((resolve, reject) => {
    const ndef = new NDEFReader();
    onState && onState('准备写入：' + sn);
    const records = [
      { recordType: 'url', data: webLink(sn) },
      { recordType: 'text', data: sn, lang: 'zh-CN', encoding: 'utf-8' }
    ];
    ndef.write({ records })
      .then(() => { onState && onState('写入成功'); resolve(true); })
      .catch((err) => {
        const msg = /permission|denied|gesture/i.test(String(err && err.name) + String(err && err.message))
          ? '写入被拒绝：需由按钮点击触发，且页面必须为 HTTPS'
          : '写入失败：' + (err && err.message ? err.message : '未知错误');
        reject(new Error(msg));
      });
  });
}

/**
 * 生成写入说明（不支持 Web NFC 时给用户的操作指引）
 */
export function manualGuide(sn) {
  return {
    sn,
    deep: deepLink(sn),
    web: webLink(sn),
    steps: [
      '准备空白 NTAG213/215/216 标签（容量 ≥ 144 字节即可）',
      'Android：安装「NFC Tools」，选择「写」→「添加记录」→「URL/URI」',
      '填入上面的「网页链」，再添加一条「文本」记录填入 SN',
      '把手机贴近标签写入，并勾选「设为只读」防止误改',
      'iOS：需用支持 NFC 写入的 App（如 NFC Tools iOS 版）写入同一条网页链'
    ]
  };
}
