@echo off
title LM Passo - Servidor
cd /d "%~dp0"
echo ============================================
echo       LM PASSO - Iniciando Servidor...
echo ============================================
echo.
:: Encerra qualquer instancia anterior do servidor
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
:: Inicia o servidor com todas as melhorias (gzip, rede, etc.)
start "" "http://localhost:3000"
node server.js
pause
