@echo off
cd /d C:\Temp\portal-proveedores

echo Iniciando backend con node server.js...
start "" /min cmd /c "node server.js"
timeout /t 5 >nul
exit

