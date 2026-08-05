@echo off
:: ============================================================
::  Portfolio Builder - Dev Keep-Awake Helper
:: ============================================================
::  Disables Windows sleep/standby so the dev server stays
::  alive while you're idle. Run this once as Administrator
::  before a long dev session.
::
::  Usage:
::    dev-keepawake.bat on     - disable sleep (keep PC awake)
::    dev-keepawake.bat off    - restore default sleep (5 min)
::    dev-keepawake.bat status - show current sleep setting
:: ============================================================

setlocal

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo [ERROR] This script requires Administrator privileges.
    echo Please right-click and "Run as administrator".
    echo.
    pause
    exit /b 1
)

set "ACTION=%~1"

if /I "%ACTION%"=="on" goto enable
if /I "%ACTION%"=="off" goto disable
if /I "%ACTION%"=="status" goto status
if /I "%ACTION%"=="" goto status

echo Usage: dev-keepawake.bat [on^|off^|status]
echo   on     - Disable sleep (keep PC awake during dev)
echo   off    - Restore default 5-minute sleep
echo   status - Show current sleep setting
exit /b 0

:enable
echo Disabling sleep/standby (AC power)...
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
echo.
echo [OK] Sleep and hibernate are now DISABLED.
echo      Your PC will stay awake. The dev server will not be killed by sleep.
echo      Run "dev-keepawake.bat off" to restore normal sleep behavior.
echo.
echo ============================================================
echo  Launching Portfolio Builder dev server...
echo ============================================================
echo.
start "Portfolio Builder - Dev Server (Persistent)" cmd /k "cd /d c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder && call npm run dev"
echo Dev server is starting in a new window.
echo.
echo [OK] Dev server launched.
echo      The server will auto-detect an available port (3000, 3001, etc.).
echo      You can close this window. The dev server runs in its own window.
goto end


:disable
echo Restoring default sleep settings...
powercfg /change standby-timeout-ac 5
powercfg /change standby-timeout-dc 2
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
echo.
echo [OK] Sleep restored to default (5 min AC / 2 min DC).
goto end

:status
echo.
echo Current sleep settings:
powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 2>nul | findstr /C:"Current AC" /C:"Current DC"
echo.
echo (Values in seconds. 0 = never sleep)
goto end

:end
if /I "%ACTION%"=="on" timeout /t 3 >nul
