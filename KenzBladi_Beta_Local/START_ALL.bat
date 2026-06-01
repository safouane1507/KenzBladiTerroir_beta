@echo off
title Kenz Bladi — Startup
color 0A
echo.
echo  ============================================
echo   Kenz Bladi Beta — Local Startup
echo  ============================================
echo.

:: ── 1. Check Ollama ───────────────────────────────────────────────────────────
echo [1/4] Checking Ollama at http://localhost:11434 ...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [WARNING] Ollama is NOT running.
    echo  The AI chatbot (Kenza) will return a friendly error until Ollama is started.
    echo  To start Ollama: open a new terminal and run "ollama serve"
    echo  Required model : llama3.1  (ollama pull llama3.1)
    echo.
    pause
) else (
    echo  [OK] Ollama is running.
    echo.
)

:: ── 2. Seed database ──────────────────────────────────────────────────────────
echo [2/4] Seeding database (backend/data/) ...
cd /d "%~dp0backend"
node seed.js
if %errorlevel% neq 0 (
    echo  [ERROR] Seed failed. Check Node.js is installed and dependencies are present.
    echo  Run: cd backend ^&^& npm install
    pause
    exit /b 1
)
echo  [OK] Seed complete.
echo.
cd /d "%~dp0"

:: ── 3. Start Backend ──────────────────────────────────────────────────────────
echo [3/4] Starting Backend on port 4000 ...
start "Kenz Bladi — Backend (4000)" cmd /k "cd /d "%~dp0backend" && node app.js"
timeout /t 2 /nobreak >nul

:: ── 4. Start Angular apps ─────────────────────────────────────────────────────
echo [4/4] Starting Angular apps ...
start "Kenz Bladi — Client (4200)" cmd /k "cd /d "%~dp0frontend" && npx ng serve --port 4200 --open"
start "Kenz Bladi — Admin  (4201)" cmd /k "cd /d "%~dp0admin_frontend" && npx ng serve --port 4201"

echo.
echo  ============================================
echo   All services launched in separate windows.
echo  ============================================
echo.
echo   Client  : http://localhost:4200
echo   Admin   : http://localhost:4201
echo   API     : http://localhost:4000/api/health
echo.
echo   Admin credentials: admin / admin123
echo.
echo  Press any key to close this window ...
pause >nul
