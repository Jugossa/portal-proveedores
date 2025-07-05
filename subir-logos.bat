@echo off
setlocal
set BASE=C:\Temp\portal-proveedores
cd /d "%BASE%\public"

echo ========================================
echo 🖼️ SUBIDA AUTOMÁTICA DE LOGOS AL REPO
echo ========================================
echo.

:: Renombrar si los archivos no tienen extensión .png
if exist "logo" (
    ren "logo" "logo.png"
    echo ✅ Renombrado: logo → logo.png
)
if exist "logo2" (
    ren "logo2" "logo2.png"
    echo ✅ Renombrado: logo2 → logo2.png
)

:: Volver a la raíz del proyecto
cd ..

:: Verificar que los logos existen ahora
if not exist "public\logo.png" (
    echo ❌ No se encuentra public\logo.png
    pause
    exit /b
)
if not exist "public\logo2.png" (
    echo ❌ No se encuentra public\logo2.png
    pause
    exit /b
)

:: Agregar a Git
git add public/logo.png public/logo2.png
git commit -m "🖼️ Subo y renombro logo y logo2 como PNG"
git push

:: Desencadenar redeploy en Render
echo 🚀 Solicitando redeploy en Render...
curl -s -X POST "https://api.render.com/deploy/srv-d1hsat6mcj7s73d1l9p0?key=7ZKOhChKyJ8"

:: Abrir portal web
start https://portal-proveedores.onrender.com

echo.
echo ✅ Logos subidos correctamente y portal actualizado.
pause
