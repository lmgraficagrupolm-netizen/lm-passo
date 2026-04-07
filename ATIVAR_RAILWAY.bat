@echo off
title LM Passo - Ativar Railway + Keep-alive
cd /d "%~dp0"

echo.
echo  ==========================================
echo     LM PASSO - Ativando Servidor Railway
echo  ==========================================
echo.

:: Envia o novo codigo com keepalive para o Railway
echo  [1/3] Enviando atualizacoes para o Railway (git push)...
git add server.js scripts/keepalive.js
git commit -m "feat: add keep-alive self-ping para manter Railway sempre online"
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  Aviso: git push falhou - pode ja estar atualizado.
)

echo.
echo  [2/3] Aguardando Railway fazer o deploy (30 segundos)...
timeout /t 30 /nobreak

echo.
echo  [3/3] Iniciando keep-alive local em segundo plano...
echo        (pinga o Railway a cada 4 minutos enquanto este PC estiver ligado)
echo.

:: Inicia o keepalive local em janela minimizada
start "LM Passo - Keep-alive Railway" /min cmd /k "cd /d "%~dp0" && node scripts/keepalive.js"

echo  ==========================================
echo    RAILWAY ATIVADO!
echo.
echo    Keep-alive rodando em segundo plano.
echo    O Railway ficara SEMPRE online.
echo.
echo    Para parar: feche a janela minimizada
echo    chamada "LM Passo - Keep-alive Railway"
echo  ==========================================
echo.
timeout /t 5 /nobreak
exit
