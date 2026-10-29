/**
 * 卖家管理端 · 登录
 * 默认账号：admin / guyi2026（正式使用前请修改 js/core/store.js 中的 ADMIN_DEF）
 */

import { esc, toast } from '../core/ui.js';
import * as store from '../core/store.js';
import { go, back } from '../core/router.js';

export default {
  tab: null,
  title: () => '管理端登录',

  render() {
    if (store.isAdmin()) {
      setTimeout(() => go('/admin/list', { replace: true }), 0);
      return `<div class="page"><div class="page-body"></div></div>`;
    }
    return `<div class="page">
      <div style="height:8px"></div>
      <div class="page-body">
        <div class="ad-login">
          <img class="logo" src="icons/icon-192.png" alt="logo">
          <h2>卖家管理端</h2>
          <p class="sub">录入与维护作品档案 · 仅项目成员可用</p>

          <div class="card card-pad">
            <div class="field">
              <label>管理员账号</label>
              <input id="user" placeholder="admin" value="admin" autocomplete="username">
            </div>
            <div class="field">
              <label>密码</label>
              <input id="pass" type="password" placeholder="请输入密码" autocomplete="current-password">
            </div>
            <button class="btn block lg" data-act="login" style="margin-top:6px">登 录</button>
            <p class="tip" style="margin-top:14px;font-size:11.5px;color:var(--gray-3);text-align:center;line-height:1.7">
              账号：admin；密码见 <b>docs/公网访问与安全说明.md</b><br>
              （已由部署流程改为强口令，请自行保管；前端校验仅防误入，正式使用请改服务端鉴权）
            </p>
          </div>

          <div style="text-align:center;margin-top:20px">
            <button class="btn gray sm" data-act="back">返回买家端</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  mount(el) {
    const u = el.querySelector('#user');
    const p = el.querySelector('#pass');
    if (!u) return;

    const submit = () => {
      if (!u.value.trim() || !p.value.trim()) { toast('请输入账号和密码'); return; }
      if (store.adminLogin(u.value.trim(), p.value.trim())) {
        toast('登录成功');
        go('/admin/list', { replace: true });
      } else {
        toast('账号或密码不正确', 2200);
      }
    };

    el.querySelector('[data-act="login"]').onclick = submit;
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    el.querySelector('[data-act="back"]').onclick = () => go('/home', { replace: true });
  }
};
