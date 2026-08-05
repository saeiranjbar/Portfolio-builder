@echo off
title Portfolio Builder - Dev Server
echo Starting Portfolio Builder Development Server...
echo.
cd /d "c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder"
echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul
echo Clearing .next cache...
rmdir /s /q .next 2>nul
echo.
echo Starting Next.js dev server...
echo The server will stay open in this window.
echo Do NOT close this window while working on the project.
echo.
npm run dev
pause
