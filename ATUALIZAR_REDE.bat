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
git commit -m "Adicionado funcionalidade de Kits de Produtos e configurador dinamico em pedidos"

echo 3. Enviando para a rede (Push)...
git push origin main

echo.
echo ============================================
echo   ENVIADO COM SUCESSO! FECHANDO SOZINHO.
echo ============================================
echo.
timeout /t 3 /nobreak >nul
