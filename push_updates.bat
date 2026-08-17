@echo off
echo ===================================================
echo  Core Space CRM - Push Updates to GitHub
echo ===================================================
echo.
echo Adding modified files to Git...
git add .
if %errorlevel% neq 0 (
    echo Error adding files. Make sure Git is installed and initialized.
    pause
    exit /b %errorlevel%
)

echo.
echo Committing changes...
git commit -m "design: make client/unit cards compact and change PWA display mode to browser"
if %errorlevel% neq 0 (
    echo Error committing changes.
    pause
    exit /b %errorlevel%
)

echo.
echo Pushing changes to remote repository...
git push
if %errorlevel% neq 0 (
    echo Error pushing changes to remote.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo  Updates pushed successfully!
echo ===================================================
pause
