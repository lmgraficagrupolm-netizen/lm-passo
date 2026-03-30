@echo off
title LM Passo - Atualizando na Rede
cd /d "%~dp0"
echo ============================================
echo       LM PASSO - Atualizando na Rede...
echo ============================================
echo.

echo 1. Adicionando modificacoes...
git add . > git_log.txt 2>&1

echo 2. Salvando alteracoes (Commit)...
git commit -m "Atualizacao do Sistema - %date% %time%" >> git_log.txt 2>&1

echo 3. Enviando para a rede (Push)...
git push origin main >> git_log.txt 2>&1

echo.
echo ============================================
echo   ANALISE CONCLUIDA! VEJA SE DEU ERRO.
echo ============================================
echo.
pause
