@echo off
title LM Passo - INICIAR
cd /d "%~dp0"

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

netsh advfirewall firewall delete rule name="LM Passo - Porta 3000" >nul 2>&1
netsh advfirewall firewall add rule name="LM Passo - Porta 3000" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
for /f "tokens=*" %%i in ('where node.exe 2^>nul') do (
    netsh advfirewall firewall delete rule name="LM Passo - Node.exe" >nul 2>&1
    netsh advfirewall firewall add rule name="LM Passo - Node.exe" dir=in action=allow program="%%i" protocol=TCP >nul 2>&1
)

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4"') do (
    set "IP=%%a"
    goto :ok
)
:ok
set "IP=%IP: =%"

cls
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       LM PASSO - SERVIDOR ATIVO          ║
echo  ╠══════════════════════════════════════════╣
echo  ║                                          ║
echo  ║  Neste PC:   http://localhost:3000       ║
echo  ║  Na Rede:    http://%IP%:3000       ║
echo  ║                                          ║
echo  ║  Compartilhe o endereco "Na Rede"        ║
echo  ║  com outros dispositivos do Wi-Fi        ║
echo  ║                                          ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  Nao feche esta janela!
echo.

start /B cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:LOOP
node server.js
if %ERRORLEVEL% EQU 0 (
    timeout /t 1 /nobreak >nul
    goto LOOP
)
echo.
echo Servidor parou. Pressione qualquer tecla para fechar.
pause >nul
