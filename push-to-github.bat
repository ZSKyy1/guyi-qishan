@echo off
setlocal
cd /d "E:/JNDS/deploy"

set GIT=C:/Users/zhang/.workbuddy/binaries/PortableGit/versions/1.3.0/cmd/git.exe
if not exist "%GIT%" set GIT=git

echo ==========================================
echo   古艺新创 - 平凉漆扇   推送到 GitHub
echo ==========================================
echo.
"%GIT%" --version
if errorlevel 1 (
  echo.
  echo   没找到 Git，建议改用【网页上传】方式，更简单：
  echo     1. 打开你的 GitHub 仓库页面
  echo     2. 点 Add file（添加文件）- Upload files（上传文件）
  echo     3. 把 E:/JNDS/deploy 里的文件和文件夹拖进去
  echo     4. 点 Commit changes（提交更改）
  pause
  exit /b 1
)
echo.
set /p REPO=粘贴仓库地址(https://github.com/用户名/仓库.git)后回车：

if "%REPO%"=="" (
  echo 没有输入地址，已取消。
  pause
  exit /b 1
)

echo.
echo 正在推送...
"%GIT%" remote remove origin >nul 2>&1
"%GIT%" remote add origin %REPO%
"%GIT%" branch -M main
"%GIT%" push -u origin main

echo.
if errorlevel 1 (
  echo --------------------------------------
  echo 推送失败。若弹出用户名密码框：
  echo   用户名 = GitHub 用户名
  echo   密码   = 令牌 Token（不是登录密码）
  echo 也可以改用网页上传方式（见 永久链接部署指南.md）
  echo --------------------------------------
) else (
  echo 推送成功！去仓库 Settings - Pages 开启即可。
)
echo.
pause
