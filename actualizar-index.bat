@echo off
cd /d I:\Pagina\portal-proveedores

echo =====================================
echo 🔄 ACTUALIZANDO index.html
echo =====================================

:: 1. Verificar si hay cambios sin guardar
git status --porcelain | findstr /r "^" >nul
if %errorlevel%==0 (
  echo 🔧 Detectados cambios sin guardar. Haciendo commit previo...
  git add index.html lastUpdate.json actualizar-index.bat
  git commit -m "Commit automático previo a actualización"
)

:: 2. Hacer pull con rebase
echo 🔄 Obteniendo últimas actualizaciones de GitHub...
git pull origin main --rebase
if errorlevel 1 (
  echo ❌ Error durante el pull. Por favor resolvé conflictos manualmente.
  pause
  exit /b
)

:: 3. Actualizar lastUpdate.json
echo { "lastUpdate": "Actualizado el %date% %time%" } > lastUpdate.json

:: 4. Commit y push
echo 🚀 Subiendo cambios...
git add index.html lastUpdate.json
git commit -m "Actualización index.html %date% %time%"
git push origin main

:: 5. Deploy en Render
echo 🌐 Lanzando deploy en Render...
curl -s -X POST "https://api.render.com/deploy/srv-d1ohh53uibrs73cpso60?key=VKUJKxVuK2A"

echo.
echo ✅ index.html actualizado correctamente en GitHub y Render.
pause
