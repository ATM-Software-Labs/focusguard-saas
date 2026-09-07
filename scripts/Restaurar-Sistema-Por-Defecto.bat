@echo off
title Restaurar Sistema a Ajustes por Defecto - FocusGuard Cleanup
color 0A
echo =========================================================
echo  RESTAURADOR DE SISTEMA Y RED A VALORES POR DEFECTO
echo =========================================================
echo.

net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [-] ERROR DE PRIVILEGIOS: Se requieren derechos de Administrador.
    echo [-] Haz clic derecho sobre este archivo y selecciona "Ejecutar como Administrador".
    echo.
    pause
    exit /b 1
)

echo [+] 1. Restaurando el archivo HOSTS de Windows a valores por defecto...
(
echo # Copyright ^(c^) 1993-2009 Microsoft Corp.
echo #
echo # This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
echo #
echo # This file contains the mappings of IP addresses to host names. Each
echo # entry should be kept on an individual line. The IP address should
echo # be placed in the first column followed by the corresponding host name.
echo # The IP address and the host name should be separated by at least one
echo # space.
echo #
echo # Additionally, comments ^(such as these^) may be inserted on individual
echo # lines or following the machine name denoted by a '#' symbol.
echo #
echo # For example:
echo #
echo #      102.54.94.97     rhino.acme.com          # source server
echo #       38.25.63.10     x.acme.com              # x client host
echo #
echo # localhost name resolution is handled within DNS itself.
echo #	127.0.0.1       localhost
echo #	::1             localhost
) > %WINDIR%\System32\drivers\etc\hosts

echo [+] 2. Restableciendo DNS de todos los adaptadores de red a Automatico (DHCP)...
powershell -Command "Get-NetAdapter | Where-Object Status -eq 'Up' | Set-DnsClientServerAddress -ResetServerAddresses" >nul 2>&1

echo [+] 3. Reseteando catalogo Winsock y pila TCP/IP...
netsh winsock reset >nul 2>&1
netsh int ip reset >nul 2>&1

echo [+] 4. Vaciando la cache de resolucion DNS de Windows...
ipconfig /flushdns >nul

echo.
echo =========================================================
echo [EXITO] Tu sistema y red han sido completamente limpiados.
echo Todos los ajustes de DNS y archivo hosts volvieron por defecto.
echo =========================================================
echo.
pause
