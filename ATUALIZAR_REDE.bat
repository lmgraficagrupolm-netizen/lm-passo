@echo off
title LM Passo - Atualizando na Rede
cd /d "%~dp0"
echo ============================================
echo       LM PASSO - Atualizando na Rede...
echo ============================================
echo.

echo 1. Adicionando modificacoes...
git add .

echo 2. Salvando alteracoes (Commit)...
git commit -m "Adicionado opcao de descontos de 10%% e 15%% no pedido"

echo 3. Enviando para a rede (Push)...
git push origin main

echo.
echo ============================================
echo     ATUALIZACAO CONCLUIDA COM SUCESSO!
echo ============================================
echo.
pause
