@echo off
setlocal
cd /d "E:/JNDS/deploy"

echo ==========================================
echo   古艺新创 - 平凉漆扇   推送到 GitHub
echo ==========================================
echo.
echo   【第 1 步】在 GitHub 网站新建一个空仓库
echo     仓库名称(Repository name)：guyi-qishan
echo     可见性选：公开(Public)
echo     下面三项都不要勾选：
echo       - 添加 README 文件(Add a README file)
echo       - 添加 .gitignore(Add .gitignore)
echo       - 选择许可证(Choose a license)
echo     最后点：创建仓库(Create repository)
echo.
echo   【第 2 步】把新建仓库页面上显示的地址粘贴到这里
echo     形如：https://github.com/你的用户名/guyi-qishan.git
echo.
set /p REPO=在这里粘贴仓库地址后按回车：

if "%REPO%"=="" (
  echo.
  echo   没有输入地址，已取消。
  pause
  exit /b 1
)

echo.
echo   正在推送... 首次会弹出浏览器让你登录 GitHub
echo.

git remote remove origin >nul 2>&1
git remote add origin %REPO%
git branch -M main
git push -u origin main

echo.
if errorlevel 1 (
  echo   推送失败，请检查：
  echo     1. 仓库地址是否填对
  echo     2. 是否已在弹出的浏览器里登录 GitHub
) else (
  echo   推送成功！
  echo.
  echo   【第 3 步】回到仓库页面
  echo     点顶部 设置(Settings) - 左侧 Pages
  echo     构建和部署(Build and deployment) - 源(Source)
  echo       选：从分支部署(Deploy from a branch)
  echo       分支(Branch)：main     文件夹：/(root)
  echo     点 保存(Save)
  echo.
  echo   等一到两分钟，网址就是：
  echo     https://你的用户名.github.io/guyi-qishan/
)
echo.
pause
