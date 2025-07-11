@echo off
cd /d I:\Pagina\portal-proveedores
echo Ejecutando actualización de ProFru
echo ================================================

:: 1. Verificar si el servidor está corriendo
echo Verificando si el servidor local está activo...
curl --silent --fail http://localhost:3000 >nul 2>&1
if errorlevel 1 (
  echo 🔄 El servidor no está corriendo, se intentará iniciar...
  start "Servidor Portal Proveedores" cmd /c "node I:\Pagina\portal-proveedores\server.js"
  timeout /t 5 /nobreak >nul
  echo 🔄 Verificando nuevamente...
  curl --silent --fail http://localhost:3000 >nul 2>&1
  if errorlevel 1 (
    echo ❌ No se pudo iniciar el servidor. Abortando.
    goto fin
  ) else (
    echo ✅ Servidor iniciado correctamente.
  )
) else (
  echo ✅ Servidor ya está corriendo.
)

:: 2. Ejecutar Access que genera ProFru.xlsx
echo Iniciando generador de ProFru.xlsx...
start /wait "" "\\jugoso0100\sistemas\Prg\LogisticaMP\LiqP.accdb"

:: 3. Esperar a que Access termine
echo ⏳ Esperando 5 segundos para que se genere ProFru.xlsx...
timeout /t 5 /nobreak >nul

:: 4. Generar profru.json
echo Generando profru.json...
curl -X POST -F "file=@I:\Pagina\portal-proveedores\ProFru.xlsx" http://localhost:3000/upload-profru

:: 5. Actualizar lastUpdate.json
echo { "lastUpdate": "Actualizado el %date% %time%" } > I:\Pagina\portal-proveedores\lastUpdate.json

:: 6. Commit y push a GitHub
echo Realizando commit y push a GitHub...
git add profru.json lastUpdate.json
git commit -m "Actualización ProFru %date% %time%"
git push origin main

:: 7. Hacer deploy en Render
echo Haciendo deploy en Render...
curl -X POST "https://api.render.com/deploy/srv-d1ohh53uibrs73cpso60?key=VKUJKxVuK2A"

:fin
echo.
echo 🟢 Proceso finalizado. Entregas actualizadas.
pause
