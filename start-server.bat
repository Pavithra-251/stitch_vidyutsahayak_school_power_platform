@echo off
title VidyutSahayak Dispatch HQ Server
cd /d "%~dp0"

echo =======================================================
echo    VidyutSahayak Dispatch HQ Server
echo =======================================================
echo Checking for Node.js / agy-node runtime...

REM Check if agy-node exists in AppData
if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    echo Starting server with Antigravity Node runtime...
    "%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
    goto end
)

REM Check standard node
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Starting server with system Node.js...
    node server.js
    goto end
)

REM Fallback to PowerShell web server
echo Node.js not detected in standard PATH. Starting PowerShell HttpListener server...
powershell -ExecutionPolicy Bypass -File server.ps1

:end
pause
