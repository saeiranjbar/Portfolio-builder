@echo off
title Portfolio Builder - Dev Server (Persistent)
echo Starting Portfolio Builder Development Server (Persistent Mode)...
echo.
cd /d "c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder"

echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Clearing .next cache...
rmdir /s /q .next 2>nul

echo.
echo ============================================================
echo  Persistent Dev Server Mode
echo ============================================================
echo  The server will AUTO-RESTART if it crashes or stops.
echo  Keep this window open. Do NOT close it.
echo  Press Ctrl+C once to stop the server cleanly.
echo ============================================================
echo.

:loop
echo [%date% %time%] Starting Next.js dev server...
call npm run dev
echo.
echo [%date% %time%] Dev server stopped or crashed!
echo Waiting 3 seconds before auto-restart...
echo (Press Ctrl+C now to stop completely, or wait for restart)
timeout /t 3 /nobreak >nul
echo Restarting...
goto loop
