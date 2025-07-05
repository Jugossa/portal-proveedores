@echo off
setlocal EnableDelayedExpansion
set BASE=C:\Temp\portal-proveedores
set XLS_PROV=proveedores.xlsx
set XLS_FRU=ProFru.xlsx
set JSON_PROV=proveedores.json
set JSON_FRU=profru.json
set ACCESS_DB=S:\Prg\LogisticaMP\LiqP.accdb

cd /d "%BASE%"

echo ========================================
echo ACTUALIZADOR DE DATOS - PORTAL PROVEEDORES (APB)
echo ========================================
echo.

:: Verificar si el backend está corriendo
echo Verificando backend...
curl -s http://localhost:3000 >nul
if errorlevel 1 (
    echo Backend no detectado, iniciando iniciar-backend.bat...
    start /min "" cmd /c iniciar-backend.bat
    echo Esperando 10 segundos a que arranque el backend...
    timeout /t 10 >nul
    curl -s http://localhost:3000 >nul
    if errorlevel 1 (
        echo ERROR: No se pudo iniciar el backend. Abortando.
        goto fin
    )
)
echo Backend activo.

:: Paso 1: Ejecutar Access
echo Ejecutando Access para generar archivos Excel...
start "" "%ACCESS_DB%"
timeout /t 15 >nul

:: Paso 2: Verificar archivos Excel
if not exist "%XLS_PROV%" (
    echo FALTA: %XLS_PROV%
    goto fin
)
if not exist "%XLS_FRU%" (
    echo FALTA: %XLS_FRU%
    goto fin
)
echo Archivos Excel generados correctamente.

:: Paso 3: Subir archivos al backend
echo Subiendo archivos al backend...
curl -s -X POST http://localhost:3000/upload-proveedores ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@%XLS_PROV%"
curl -s -X POST http://localhost:3000/upload-profru ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@%XLS_FRU%"

timeout /t 5 >nul

:: Paso 4: Git commit sin verificación de cambios
echo Subiendo cambios a GitHub...
git add %JSON_PROV% %JSON_FRU%
git commit -m "Actualizacion automatica"
git push

:: Paso 5: Notificar a Render
echo Desencadenando redeploy en Render...
curl -s -X POST "https://api.render.com/deploy/srv-d1hsat6mcj7s73d1l9p0?key=7ZKOhChKyJ8"

:: Paso 6: Abrir portal web
start https://portal-proveedores.onrender.com

:fin
echo.
echo ✅ Proceso finalizado.
