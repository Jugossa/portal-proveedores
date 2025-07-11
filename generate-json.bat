@echo off
echo ===================================
echo Generando JSON desde archivos Excel
echo ===================================

curl -X POST -F "file=@proveedores.xlsx" http://localhost:3000/upload-proveedores
echo.

curl -X POST -F "file=@ProFru.xlsx" http://localhost:3000/upload-profru
echo.

pause
