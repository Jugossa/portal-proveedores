@echo off
set XLS_PROV=proveedores.xlsx
set XLS_FRU=ProFru.xlsx

echo ========================================
echo 🔄 ACTUALIZADOR DE DATOS - PROVEEDORES Y ENTREGA DE FRUTA
echo ========================================
echo.

:: Verifica proveedores.xlsx
if not exist %XLS_PROV% (
    echo ❌ FALTA el archivo: %XLS_PROV%
    goto fin
)

:: Verifica ProFru.xlsx
if not exist %XLS_FRU% (
    echo ❌ FALTA el archivo: %XLS_FRU%
    goto fin
)

:: Enviar proveedores.xlsx
echo 📤 Enviando %XLS_PROV%...
curl -s -X POST http://localhost:3001/upload-proveedores ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@%XLS_PROV%"

echo.

:: Enviar ProFru.xlsx
echo 📤 Enviando %XLS_FRU%...
curl -s -X POST http://localhost:3001/upload-profru ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@%XLS_FRU%"

echo.
echo ✅ Todo listo. Se actualizaron proveedores.json y profru.json.
:fin
pause
