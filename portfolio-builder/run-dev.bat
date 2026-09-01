@echo off
cd /d "c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder"
start "Next.js Dev Server" cmd /c "npm run dev"
timeout /t 12 /nobreak >nul
start http://localhost:3000
