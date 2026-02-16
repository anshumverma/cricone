@echo off
REM CricOne - GitHub Repository Setup Script (Windows)
REM This script helps you quickly set up and deploy to GitHub Pages

echo.
echo 🏏 CricOne - GitHub Pages Setup
echo ================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Git is not installed
    echo Please install Git first: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Check if already initialized
if exist ".git" (
    echo ⚠️  Git repository already initialized
    echo.
    set /p continue="Do you want to continue? This will add a new remote. (y/n): "
    if /i not "%continue%"=="y" (
        echo Setup cancelled
        pause
        exit /b 0
    )
) else (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
    echo.
)

REM Add all files
echo 📝 Adding files to Git...
git add .
echo ✅ Files added
echo.

REM Create initial commit if needed
git rev-parse HEAD >nul 2>&1
if errorlevel 1 (
    echo 💾 Creating initial commit...
    git commit -m "Initial commit: CricOne Cricket Academy Membership Manager"
    echo ✅ Initial commit created
    echo.
)

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Remote 'origin' already exists:
    git remote get-url origin
    echo.
    set /p update="Do you want to update it? (y/n): "
    if /i "%update%"=="y" (
        git remote remove origin
        echo ✅ Old remote removed
    ) else (
        echo Keeping existing remote
        echo.
        echo To push manually, run:
        echo   git push -u origin main
        pause
        exit /b 0
    )
)

REM Add GitHub remote
echo 🔗 Adding GitHub remote...
git remote add origin https://github.com/anshumverma/cricone.git
echo ✅ Remote added: https://github.com/anshumverma/cricone.git
echo.

REM Verify remote
echo 🔍 Verifying remote...
git remote -v
echo.

REM Rename branch to main if needed
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo 🔄 Renaming branch to 'main'...
    git branch -M main
    echo ✅ Branch renamed to 'main'
    echo.
)

REM Ask if user wants to push now
echo 📤 Ready to push to GitHub!
echo.
echo ⚠️  IMPORTANT: Make sure you have:
echo    1. Created the repository on GitHub: https://github.com/anshumverma/cricone
echo    2. Added the CricOne logo to: assets\images\cricone-logo.png
echo.
set /p push="Do you want to push now? (y/n): "

if /i "%push%"=="y" (
    echo 🚀 Pushing to GitHub...
    git push -u origin main
    if errorlevel 1 (
        echo.
        echo ❌ Push failed. This might be because:
        echo    1. The repository doesn't exist on GitHub yet
        echo    2. You don't have permission to push
        echo    3. Authentication failed
        echo.
        echo Please:
        echo    1. Create the repository: https://github.com/new
        echo    2. Repository name: cricone
        echo    3. Make it public
        echo    4. Don't initialize with README
        echo    5. Run this script again or push manually:
        echo       git push -u origin main
    ) else (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo 🎉 Next steps:
        echo    1. Go to: https://github.com/anshumverma/cricone/settings/pages
        echo    2. Under 'Source', select 'main' branch and '/ (root)' folder
        echo    3. Click 'Save'
        echo    4. Wait 1-2 minutes for deployment
        echo    5. Your app will be live at: https://anshumverma.github.io/cricone/
        echo.
    )
) else (
    echo.
    echo 📋 To push manually later, run:
    echo    git push -u origin main
    echo.
    echo 📖 For detailed instructions, see: DEPLOYMENT.md
)

echo.
echo ✨ Setup complete!
pause
