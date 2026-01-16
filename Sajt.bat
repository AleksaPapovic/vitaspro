@echo off
title Vitas Pro - Development Server
color 0A
echo ========================================
echo   Vitas Pro - Development Server
echo ========================================
echo.

echo   Vitas Pro sajt se pokrece na
echo   http://localhost:5173
REM Run npm run dev
npm run dev

REM If npm run dev exits, pause to show any error messages
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Development server failed to start
    echo ========================================
    echo.
)

pause
