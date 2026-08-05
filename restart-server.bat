@echo off
title Portfolio Builder - Dev Server
echo Restarting Portfolio Builder Development Server...
echo.
cd /d "c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder"
echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul
echo Waiting for processes to close...
timeout /t 2 /nobreak >nul
echo Clearing .next cache...
rmdir /s /q .next 2>nul
echo.
echo Starting Next.js dev server...
echo The server will stay open in this window.
echo Do NOT close this window while working on the project.
echo.
start cmd /k "title Portfolio Builder - Dev Server && cd /d c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder && npm run dev"
echo Server is starting in a new window! Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo Done! The server is running at http://localhost:3000
