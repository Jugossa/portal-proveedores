@echo off
cd /d I:\Pagina\portal-proveedores
echo Ejecutando actualización de proveedores
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

:: 2. Generar proveedores.json
echo Generando proveedores.json...
curl -X POST -F "file=@I:\Pagina\portal-proveedores\proveedores.xlsx" http://localhost:3000/upload-proveedores

:: 3. Actualizar lastUpdate.json
echo { "lastUpdate": "Actualizado el %date% %time%" } > I:\Pagina\portal-proveedores\lastUpdate.json

:: 4. Commit y push a GitHub
echo Realizando commit y push a GitHub...
git add proveedores.json lastUpdate.json
git commit -m "Actualización proveedores %date% %time%"
git push origin main

:: 5. Hacer deploy en Render
echo Haciendo deploy en Render...
curl -X POST "https://api.render.com/deploy/srv-d1ohh53uibrs73cpso60?key=VKUJKxVuK2A"

:fin
echo.
echo 🟢 Proceso finalizado. Proveedores actualizados.
pause
