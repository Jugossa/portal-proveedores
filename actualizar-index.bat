@echo off
cd /d I:\Pagina\portal-proveedores
echo Ejecutando actualización de index.html
echo ================================================

:: 1. Verificar si el servidor está corriendo en el puerto 3000
echo Verificando si el servidor local está activo...
curl --silent --fail http://localhost:3000 >nul 2>&1
if errorlevel 1 (
  echo 🔄 El servidor no está corriendo, se intentará iniciar...
  start "Servidor Portal Proveedores" cmd /c "node server.js"
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

:: 2. Actualizar lastUpdate.json con la hora de modificación del index
echo { "lastUpdate": "Actualizado el %date% %time%" } > lastUpdate.json

:: 3. Hacer commit solo de index.html y lastUpdate.json
echo Realizando commit y push a GitHub...
git add index.html lastUpdate.json
git commit -m "Actualización index %date% %time%"
git push origin main

:: 4. Hacer deploy en Render
echo Haciendo deploy en Render...
curl -X POST "https://api.render.com/deploy/srv-d1ohh53uibrs73cpso60?key=VKUJKxVuK2A"

:fin
echo.
echo 🟢 Proceso finalizado. index.html actualizado en el portal.
pause
