@echo off
echo Ejecutando proceso completo
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

:: 2. Ejecutar Access que genera ProFru.xlsx
echo Iniciando generador de ProFru.xlsx...
start /wait "" "\\jugoso0100\sistemas\Prg\LogisticaMP\LiqP.accdb"

:: ESPERA: dar tiempo a que Access termine de guardar el archivo
echo ⏳ Esperando 5 segundos para que se genere ProFru.xlsx...
timeout /t 5 /nobreak >nul

:: 3. Generar profru.json
echo Generando profru.json...
curl -X POST -F "file=@ProFru.xlsx" http://localhost:3000/upload-profru

:: 4. Actualizar lastUpdate.json
echo { "lastUpdate": "Actualizado el %date% %time%" } > lastUpdate.json

:: 5. Commit y push a GitHub
echo Realizando commit y push a GitHub...
git add profru.json lastUpdate.json
git commit -m "Actualizacion automatica %date% %time%"
git push origin main

:: 6. Deploy en Render (opcional, requiere service ID)
echo Haciendo deploy en Render...
curl -X POST "https://api.render.com/deploy/srv-XXXX?key=rnd_6XDiGhJmZe3Ksqw7Zx9Hc0BP9Jvw"

:fin
echo.
echo 🟢 Proceso finalizado. Portal actualizado.
pause
