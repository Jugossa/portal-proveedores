@echo off
setlocal
set BASE=C:\Temp\portal-proveedores

cd /d "%BASE%"

echo ========================================
echo 🔄 ACTUALIZADOR DE INTERFAZ WEB (index.html)
echo ========================================
echo.

:: Verifica que el archivo exista
if not exist "index.html" (
    echo ❌ No se encontró index.html en %BASE%
    pause
    exit /b
)

:: Verifica si es un repositorio Git
if not exist ".git" (
    echo ❌ Esta carpeta no es un repositorio Git.
    pause
    exit /b
)

:: Verifica si hubo cambios en index.html
git diff --quiet index.html
if errorlevel 1 (
    echo 📝 Hay cambios en index.html, haciendo commit...
    git add index.html
    git commit -m "🎨 Actualización del diseño index.html"
    git push
    echo ✅ Cambios subidos a GitHub.
) else (
    echo ⚠️  No hay cambios en index.html, no se sube nada.
)

:: Disparar redeploy en Render
echo 🚀 Solicitando redeploy a Render...
curl -s -X POST "https://api.render.com/deploy/srv-d1hsat6mcj7s73d1l9p0?key=7ZKOhChKyJ8"

:: Abrir sitio web
echo 🌐 Abriendo portal actualizado...
start https://portal-proveedores.onrender.com

echo.
echo ✅ index.html actualizado correctamente en la web.
pause
