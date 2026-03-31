@echo off
title LM Passo - Atualizando na Rede
cd /d "C:\Users\T.i\.gemini\antigravity\scratch\lm-passo"
echo ============================================
echo       LM PASSO - Atualizando na Rede...
echo ============================================
echo.

echo 1. Adicionando modificacoes...
git add .

echo 2. Salvando alteracoes (Commit)...
git commit -m "Atualizações automáticas do sistema"

echo 3. Enviando para a rede (Push)...
git push origin main

echo.
echo ============================================
echo   ENVIADO COM SUCESSO! FECHANDO SOZINHO EM 3s...
echo ============================================
echo.
timeout /t 3 /nobreak >nul
exit
