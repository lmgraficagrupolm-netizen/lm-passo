@echo off
title LM Passo - Servidor
cd /d "%~dp0"
echo ============================================
echo       LM PASSO - Iniciando Servidor...
echo ============================================
echo.
start "" "http://localhost:3000"
node server.js
pause
