@echo off
title LM Passo - Servidor
cd /d "%~dp0"

:RESTART
echo ============================================
echo       LM PASSO - Iniciando Servidor...
echo ============================================
echo.
:: Encerra qualquer instancia anterior do servidor
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: Inicia o servidor em background e espera ele estar pronto
start /B node server.js > server_output.txt 2>&1

:: Aguarda 3 segundos para o servidor inicializar
echo Aguardando servidor iniciar...
timeout /t 3 /nobreak >nul

:: Abre o navegador apenas na primeira inicializacao
if "%FIRST_START%"=="" (
    set FIRST_START=1
    start "" "http://localhost:3000"
)

:: Mantém a janela aberta mostrando status
echo.
echo ============================================
echo  Servidor rodando em http://localhost:3000
echo  Rede: http://192.168.1.127:3000
echo  Pressione Ctrl+C para encerrar
echo ============================================
echo.

:: Loop para manter janela aberta e detectar se o servidor cair
:WAIT_LOOP
timeout /t 2 /nobreak >nul
:: Verifica se node ainda está rodando
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL% NEQ 0 (
    :: Node caiu - verifica o codigo de saida pelo output
    findstr /C:"reiniciando" server_output.txt >nul 2>&1
    echo.
    echo [SERVIDOR PAROU - REINICIANDO...]
    timeout /t 1 /nobreak >nul
    goto RESTART
)
goto WAIT_LOOP
