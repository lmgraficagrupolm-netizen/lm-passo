@echo off
title LM Passo - Sincronizar com Railway
cd /d "%~dp0"

echo.
echo  ==========================================
echo    LM PASSO - Sincronizando com Railway
echo  ==========================================
echo.

:: Para o servidor local se estiver rodando
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: Tenta acordar o Railway (ate 3 tentativas com 30s de espera)
echo  Verificando status do Railway...
echo.

set TENTATIVA=1
:TENTAR
echo  Tentativa %TENTATIVA%/3 - Contactando Railway...
node -e "const h=require('https');const r=h.get('https://lm-passo-production.up.railway.app/api/health',res=>{console.log('STATUS:'+res.statusCode);process.exit(res.statusCode===200?0:1);});r.on('error',e=>{console.log('ERRO:'+e.message);process.exit(1);});r.setTimeout(20000,()=>{r.destroy();process.exit(1);});"

if %ERRORLEVEL% EQU 0 goto :RAILWAY_ONLINE

if %TENTATIVA% EQU 3 goto :RAILWAY_OFFLINE

echo  Railway acordando... aguardando 30 segundos...
timeout /t 30 /nobreak
set /a TENTATIVA+=1
goto :TENTAR

:RAILWAY_ONLINE
echo.
echo  Railway ONLINE! Baixando dados atualizados...
echo.
node scripts/pull_from_network.js
if %ERRORLEVEL% NEQ 0 goto :ERRO_PULL

echo.
echo  Importando dados para o banco local...
echo.
node scripts/restore_local.js
if %ERRORLEVEL% NEQ 0 goto :ERRO_RESTORE

goto :INICIAR

:RAILWAY_OFFLINE
echo.
echo  ==========================================
echo   Railway offline. Usando ultimo backup
echo   salvo em scripts\db_export.json
echo  ==========================================
echo.
node scripts/restore_local.js
if %ERRORLEVEL% NEQ 0 goto :ERRO_RESTORE
goto :INICIAR

:ERRO_PULL
echo  ERRO ao baixar dados do Railway.
pause
exit /b 1

:ERRO_RESTORE
echo  ERRO ao restaurar dados locais.
pause
exit /b 1

:INICIAR
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4"') do (
    set "IP=%%a"
    goto :ip_ok
)
:ip_ok
set "IP=%IP: =%"

cls
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   LM PASSO - DADOS ATUALIZADOS + ATIVO  ║
echo  ╠══════════════════════════════════════════╣
echo  ║                                          ║
echo  ║  Neste PC:   http://localhost:3000       ║
echo  ║  Na Rede:    http://%IP%:3000       ║
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
echo Servidor parou. Pressione qualquer tecla.
pause >nul
