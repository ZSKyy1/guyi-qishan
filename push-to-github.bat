@echo off
setlocal
cd /d "E:/JNDS/deploy"

echo ==========================================
echo   古艺新创 - 平凉漆扇   推送到 GitHub
echo ==========================================
echo.
echo   【准备】先复制你的仓库地址：
echo     在仓库页面点绿色按钮 代码(Code)
echo     选 HTTPS，点右边复制图标
echo     形如：https://github.com/你的用户名/guyi-qishan.git
echo.
set /p REPO=把仓库地址粘贴到这里，然后按回车：

if "%REPO%"=="" (
  echo.
  echo   没有输入地址，已取消。
  pause
  exit /b 1
)

echo.
echo   正在推送...（首次会弹出窗口让你登录 GitHub）
echo.

git remote remove origin >nul 2>&1
git remote add origin %REPO%
git branch -M main
git pull --rebase origin main >nul 2>&1
git push -u origin main

echo.
if errorlevel 1 (
  echo   --------------------------------------
  echo   推送失败，常见原因：
  echo.
  echo   1) 弹出的是用户名+密码框：
  echo      用户名填 GitHub 用户名
  echo      密码要填【令牌 Token】，不是登录密码
  echo      令牌获取：头像 - Settings - Developer settings
  echo              - Personal access tokens - Tokens (classic)
  echo              - Generate new token - 勾选 repo
  echo.
  echo   2) 建仓库时勾了 README：
  echo      回 GitHub 删掉这个仓库，重新建一个【完全空的】
  echo   --------------------------------------
) else (
  echo   ======================================
  echo   推送成功！
  echo   ======================================
  echo.
  echo   【最后一步】开启 Pages：
  echo     仓库页顶部点 设置(Settings)
  echo     左侧点 Pages
  echo     构建和部署 - 源 选：从分支部署
  echo     分支选 main，文件夹选 /(root)
  echo     点 保存(Save)
  echo.
  echo   等一到两分钟，网址就是：
  echo     https://你的用户名.github.io/guyi-qishan/
)
echo.
pause
