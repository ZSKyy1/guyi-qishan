@echo off
setlocal
cd /d "E:\JNDS\deploy"

echo ==========================================
echo   GuYi XinChuang App - Push to GitHub
echo ==========================================
echo.
echo Step 1: create an EMPTY public repo on github.com
echo         (do NOT add README / .gitignore / license)
echo Step 2: paste its URL below
echo         example: https://github.com/yourname/guyi-qishan.git
echo.
set /p REPO=Repo URL:

if "%REPO%"=="" (
  echo.
  echo No URL entered, nothing to do.
  pause
  exit /b 1
)

echo.
echo Pushing... (a browser window may open for GitHub login)
echo.

git remote remove origin >nul 2>&1
git remote add origin %REPO%
git branch -M main
git push -u origin main

echo.
if errorlevel 1 (
  echo PUSH FAILED. Please check:
  echo   - the repo URL is correct
  echo   - you are logged in to GitHub
) else (
  echo PUSH OK.
  echo Next: GitHub repo - Settings - Pages
  echo       Source = main, folder = / (root), then Save.
  echo Your site: https://YOURNAME.github.io/REPO/
)
echo.
pause
