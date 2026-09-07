/** Install / uninstall payloads for every AdShield guide. */

export type ShieldAction = 'enable' | 'disable';

export interface ShieldPackage {
  filename: string;
  mime: string;
  body: string;
}

const DOT_HOST = '7twgtf7v6b.cloudflare-gateway.com';
const CF_DOH = 'https://cloudflare-dns.com/dns-query';

function uuid(): string {
  return crypto.randomUUID();
}

/** Chromium/Brave/Firefox DoH policies with automatic Cloudflare fallback */
function batBrowserDoh(dohVar = '%DOH%'): string {
  const fallbackDoh = 'https://cloudflare-dns.com/dns-query';
  const keys = [
    'HKCU\\Software\\Policies\\Google\\Chrome',
    'HKCU\\Software\\Policies\\Microsoft\\Edge',
    'HKCU\\Software\\Policies\\BraveSoftware\\Brave',
    'HKCU\\Software\\Policies\\BraveSoftware\\Brave-Browser',
    'HKLM\\Software\\Policies\\Google\\Chrome',
    'HKLM\\Software\\Policies\\Microsoft\\Edge',
    'HKLM\\Software\\Policies\\BraveSoftware\\Brave',
    'HKLM\\Software\\Policies\\BraveSoftware\\Brave-Browser',
  ];
  const lines = keys.flatMap((k) => [
    `reg add "${k}" /v DnsOverHttpsMode /t REG_SZ /d always /f >nul 2>&1`,
    `reg add "${k}" /v DnsOverHttpsTemplates /t REG_SZ /d "${dohVar} ${fallbackDoh}" /f >nul 2>&1`,
    `reg add "${k}" /v BuiltInDnsClientEnabled /t REG_DWORD /d 1 /f >nul 2>&1`,
  ]);
  lines.push(
    `reg add "HKCU\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /v Enabled /t REG_DWORD /d 2 /f >nul 2>&1`,
    `reg add "HKCU\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /v ProviderURL /t REG_SZ /d "${dohVar}" /f >nul 2>&1`,
    `reg add "HKCU\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /v Locked /t REG_DWORD /d 1 /f >nul 2>&1`,
    `reg add "HKLM\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /v Enabled /t REG_DWORD /d 2 /f >nul 2>&1`,
    `reg add "HKLM\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /v ProviderURL /t REG_SZ /d "${dohVar}" /f >nul 2>&1`,
    `reg add "HKLM\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /v Locked /t REG_DWORD /d 1 /f >nul 2>&1`,
  );
  return lines.join('\n');
}

function batClearBrowserDoh(): string {
  const keys = [
    'HKCU\\Software\\Policies\\Google\\Chrome',
    'HKCU\\Software\\Policies\\Microsoft\\Edge',
    'HKCU\\Software\\Policies\\BraveSoftware\\Brave',
    'HKCU\\Software\\Policies\\BraveSoftware\\Brave-Browser',
    'HKLM\\Software\\Policies\\Google\\Chrome',
    'HKLM\\Software\\Policies\\Microsoft\\Edge',
    'HKLM\\Software\\Policies\\BraveSoftware\\Brave',
    'HKLM\\Software\\Policies\\BraveSoftware\\Brave-Browser',
  ];
  const lines = keys.flatMap((k) => [
    `reg delete "${k}" /v DnsOverHttpsMode /f >nul 2>&1`,
    `reg delete "${k}" /v DnsOverHttpsTemplates /f >nul 2>&1`,
  ]);
  lines.push(
    `reg delete "HKCU\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /f >nul 2>&1`,
    `reg delete "HKLM\\Software\\Policies\\Mozilla\\Firefox\\DNSOverHTTPS" /f >nul 2>&1`,
  );
  return lines.join('\n');
}

function mobileconfig(dohUrl: string, displayName: string): string {
  const payloadUuid = uuid();
  const dnsUuid = uuid();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>DNSSettings</key>
      <dict>
        <key>DNSProtocol</key>
        <string>HTTPS</string>
        <key>ServerURL</key>
        <string>${dohUrl}</string>
      </dict>
      <key>PayloadDescription</key>
      <string>${displayName}</string>
      <key>PayloadDisplayName</key>
      <string>${displayName}</string>
      <key>PayloadIdentifier</key>
      <string>com.focusguard.dns.${dnsUuid}</string>
      <key>PayloadType</key>
      <string>com.apple.dnsSettings.managed</string>
      <key>PayloadUUID</key>
      <string>${dnsUuid}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>${displayName}</string>
  <key>PayloadIdentifier</key>
  <string>com.focusguard.profile.${payloadUuid}</string>
  <key>PayloadOrganization</key>
  <string>FocusGuard</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${payloadUuid}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;
}

export function buildShieldPackage(platform: string, action: ShieldAction, dohUrl: string): ShieldPackage | null {
  if (platform === 'win') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield.bat',
        mime: 'application/bat',
        body: `@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "DOH=${dohUrl}"

net session >nul 2>&1
if %errorLevel%==0 goto :admin

echo Solicitando permisos de Administrador para FocusGuard AdShield...
> "%temp%\\fg_uac.vbs" echo Set sh = CreateObject("Shell.Application")
>>"%temp%\\fg_uac.vbs" echo sh.ShellExecute "cmd.exe", "/c ""%~f0""", "", "runas", 1
wscript //nologo "%temp%\\fg_uac.vbs"
del "%temp%\\fg_uac.vbs" >nul 2>&1
exit /b

:admin
TITLE FocusGuard AdShield
ECHO =========================================================
ECHO           Instalando FocusGuard AdShield (DNS-over-HTTPS)
ECHO =========================================================
ECHO [*] Endpoint DoH: %DOH%
ECHO [*] Configurando politicas de registro, cache ultra-optimizada y DNS seguro...

rem 1. Activar EnableAutoDoh y Cache Local DNS de 24h en Windows Client Cache (MaxCacheTtl 86400s)
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters" /v EnableAutoDoh /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters" /v MaxCacheTtl /t REG_DWORD /d 86400 /f >nul 2>&1
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters" /v MaxNegativeCacheTtl /t REG_DWORD /d 86400 /f >nul 2>&1

rem 2. Aplicar politicas DoH para Chrome, Edge, Brave y Firefox
${batBrowserDoh('%DOH%')}

rem 3. Configurar DNS de interfaz y plantilla DoH con Respaldo Automático en PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='SilentlyContinue'; $doh='%DOH%'; $cfDoh='https://cloudflare-dns.com/dns-query'; $p='1.1.1.1'; $s='1.0.0.1'; $t='8.8.8.8'; Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses @($p,$s,$t) }; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters' -Name 'EnableAutoDoh' -Value 2 -Type DWord -ErrorAction SilentlyContinue; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters' -Name 'MaxCacheTtl' -Value 86400 -Type DWord -ErrorAction SilentlyContinue; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters' -Name 'MaxNegativeCacheTtl' -Value 86400 -Type DWord -ErrorAction SilentlyContinue; Add-DnsClientDohServerAddress -ServerAddress $p -DohTemplate $doh -AllowFallbackToUdp $true -AutoUpgrade $true -ErrorAction SilentlyContinue; Add-DnsClientDohServerAddress -ServerAddress $s -DohTemplate $cfDoh -AllowFallbackToUdp $true -AutoUpgrade $true -ErrorAction SilentlyContinue; Clear-DnsClientCache; ipconfig /flushdns | Out-Null"

ECHO.
ECHO [SUCCESS] FocusGuard AdShield instalado correctamente con ultra-cache de 24h.
ECHO [IMPORTANTE] Por favor cierra por completo Brave, Chrome, Edge o Firefox y vuelve a abrirlos.
PAUSE
`
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield.bat',
      mime: 'application/bat',
      body: `@echo off
setlocal EnableExtensions
cd /d "%~dp0"
net session >nul 2>&1
if %errorLevel%==0 goto :elevated
> "%temp%\\fg_uac.vbs" echo Set sh = CreateObject("Shell.Application")
>>"%temp%\\fg_uac.vbs" echo sh.ShellExecute "cmd.exe", "/c ""%~f0""", "", "runas", 1
wscript //nologo "%temp%\\fg_uac.vbs"
del "%temp%\\fg_uac.vbs" >nul 2>&1
exit /b
:elevated
TITLE FocusGuard AdShield — Desinstalacion
ECHO [*] Quitando FocusGuard AdShield (DNS automatico del ISP)...
${batClearBrowserDoh()}
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='SilentlyContinue'; Get-NetAdapter | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ResetServerAddresses }; Get-DnsClientDohServerAddress | ForEach-Object { Remove-DnsClientDohServerAddress -ServerAddress $_.ServerAddress -Force }; ipconfig /flushdns | Out-Null; Write-Host '[OK] DNS restaurado.'"
ECHO.
ECHO [SUCCESS] AdShield desinstalado.
PAUSE
`,
    };
  }

  if (platform === 'mac') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-macOS.sh',
        mime: 'text/x-shellscript',
        body: `#!/bin/bash
set -e
echo "[*] Instalando FocusGuard AdShield en macOS..."
echo "[*] DoH (perfil nativo): ${dohUrl}"
SERVICES=$(networksetup -listallnetworkservices | tail -n +2 | sed 's/^*//')
while IFS= read -r svc; do
  [ -z "$svc" ] && continue
  networksetup -setdnsservers "$svc" 1.1.1.1 1.0.0.1 || true
  echo "  [OK] DNS en: $svc"
done <<< "$SERVICES"
dscacheutil -flushcache 2>/dev/null || true
killall -HUP mDNSResponder 2>/dev/null || true
echo "[SUCCESS] DNS de sistema aplicado."
echo "Para DoH nativo instala tambien el perfil .mobileconfig de esta misma guia."
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-macOS.sh',
      mime: 'text/x-shellscript',
      body: `#!/bin/bash
set -e
echo "[*] Desinstalando FocusGuard AdShield en macOS..."
SERVICES=$(networksetup -listallnetworkservices | tail -n +2 | sed 's/^*//')
while IFS= read -r svc; do
  [ -z "$svc" ] && continue
  networksetup -setdnsservers "$svc" Empty || true
  echo "  [OK] DNS automatico en: $svc"
done <<< "$SERVICES"
dscacheutil -flushcache 2>/dev/null || true
killall -HUP mDNSResponder 2>/dev/null || true
echo "[SUCCESS] DNS restaurado. Si instalaste un perfil: Ajustes → General → VPN y gestion de dispositivos → FocusGuard → Eliminar."
`,
    };
  }

  if (platform === 'linux') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-Linux.sh',
        mime: 'text/x-shellscript',
        body: `#!/bin/bash
set -e
echo "[*] Instalando FocusGuard AdShield en Linux..."
echo "[*] DoH: ${dohUrl}"
if command -v nmcli >/dev/null 2>&1; then
  CONN=$(nmcli -t -f NAME,DEVICE connection show --active | head -1 | cut -d: -f1)
  if [ -n "$CONN" ]; then
    nmcli connection modify "$CONN" ipv4.ignore-auto-dns yes ipv4.dns "1.1.1.1 1.0.0.1"
    nmcli connection up "$CONN" || true
    echo "[OK] NetworkManager: $CONN"
  fi
fi
if [ -f /etc/systemd/resolved.conf ]; then
  echo "Opcional systemd-resolved: DNS=1.1.1.1 1.0.0.1  y un stub DoH hacia:"
  echo "  ${dohUrl}"
fi
echo "[SUCCESS] Instala cloudflared o dnscrypt-proxy apuntando a la URL DoH para cifrado completo."
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-Linux.sh',
      mime: 'text/x-shellscript',
      body: `#!/bin/bash
set -e
echo "[*] Desinstalando FocusGuard AdShield en Linux..."
if command -v nmcli >/dev/null 2>&1; then
  CONN=$(nmcli -t -f NAME,DEVICE connection show --active | head -1 | cut -d: -f1)
  if [ -n "$CONN" ]; then
    nmcli connection modify "$CONN" ipv4.ignore-auto-dns no ipv4.dns ""
    nmcli connection up "$CONN" || true
    echo "[OK] NetworkManager restaurado: $CONN"
  fi
fi
echo "[SUCCESS] DNS automatico del sistema. Quita tambien cualquier stub DoH (cloudflared/dnscrypt-proxy) si lo instalaste."
`,
    };
  }

  if (platform === 'ios') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-iOS.mobileconfig',
        mime: 'application/x-apple-aspen-config',
        body: mobileconfig(dohUrl, 'FocusGuard AdShield DNS'),
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-iOS.txt',
      mime: 'text/plain;charset=utf-8',
      body: `FocusGuard AdShield — Quitar el filtro en iPhone / iPad
======================================================

1. Abre Ajustes.
2. General → VPN y gestión de dispositivos (o Gestión de VPN y dispositivos).
3. Pulsa el perfil "FocusGuard AdShield DNS".
4. Pulsa Eliminar perfil → introduce el código del iPhone → Eliminar.

Si activaste Tiempo en pantalla / restricciones de perfiles, desactívalas antes con el PIN parental.

Tras eliminarlo, Safari y las apps vuelven al DNS del operador o del Wi‑Fi.
`,
    };
  }

  if (platform === 'android') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-Android.txt',
        mime: 'text/plain;charset=utf-8',
        body: `FocusGuard AdShield — Instalación Android
=========================================

OPCIÓN A — DNS Privado nativo (recomendado, sin app)
1. Ajustes → Red e Internet → DNS privado
   (o Conexiones → Más ajustes de conexión → DNS privado).
2. Elige "Nombre de host del proveedor de DNS privado".
3. Pega exactamente tu Hostname Seguro de FocusGuard:
   ${DOT_HOST}
4. Guardar. El estado debe quedar Activado.

PROTECCIÓN ANTI-MANIPULACIÓN (INVIOLABLE - SIN APPS QUE BORRAR):
1. No se requiere instalar ninguna app: el filtro está integrado en el kernel de Android.
2. Bloquea la app "Ajustes" con tu PIN Parental usando Google Family Link o AppLock.
3. Desactiva la opción "Añadir usuarios/invitados" en Ajustes de Android.
4. Todo el control de desbloqueo se realiza exclusivamente desde la web FocusGuard.

Comprueba abriendo un dominio de tu categoría bloqueada (ej: township.com, pornhub.com).
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-Android.txt',
      mime: 'text/plain;charset=utf-8',
      body: `FocusGuard AdShield — Quitar el filtro en Android (Requiere PIN Parental)
======================================================================

1. Abre Ajustes (introduce tu PIN Parental si está protegido).
2. Ve a Red e Internet → DNS privado (o Conexiones → Más ajustes de conexión).
3. Selecciona "Automático" o "Desactivado".
4. Pulsa Guardar.

Tras esto el teléfono volverá a usar el DNS predeterminado de tu operador.
`,
    };
  }

  if (platform === 'router') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-Router.txt',
        mime: 'text/plain;charset=utf-8',
        body: `FocusGuard AdShield — Instalación en el router
==============================================

1. Entra al panel: 192.168.1.1 / 192.168.0.1 o la IP de tu puerta de enlace.
2. WAN / Internet / DHCP → DNS manual (desactiva "DNS automatico del ISP").
3. DNS primario:   1.1.1.1
   DNS secundario: 1.0.0.1
4. Guarda y reinicia el router o pide a los clientes que reconecten el Wi‑Fi.

Filtrado de categorias FocusGuard (moviles / PCs):
DoH: ${dohUrl}
DoT: ${DOT_HOST}

Las apps que usan su propio DoH saltan el DNS del router: combina con
las guias Android / iOS / Windows de AdShield en esos dispositivos.

https://focusguard.trujillomingorance.com/adshield/router
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-Router.txt',
      mime: 'text/plain;charset=utf-8',
      body: `FocusGuard AdShield — Quitar el filtro del router
=================================================

1. Entra al panel del router.
2. WAN / Internet / DHCP → DNS.
3. Vuelve a "Obtener DNS automaticamente" / DNS del ISP.
4. Guarda y reinicia el router (o reconecta los clientes).

Si tambien configuraste DoH en moviles o PCs, quitalo con el
script de desinstalacion de esa guia (Android, iOS, Windows, macOS).
`,
    };
  }

  if (platform === 'browser') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-Navegador.txt',
        mime: 'text/plain;charset=utf-8',
        body: `FocusGuard AdShield — Instalación en el navegador
=================================================

URL DoH (copiala tal cual):
${dohUrl}

Chrome / Edge / Brave:
1. chrome://settings/security   (o edge://settings/privacy)
2. Usar DNS seguro → Con → Personalizado.
3. Pega la URL DoH → pulsa fuera del campo.
4. Reinicia el navegador.

Firefox:
1. Ajustes → Privacidad y seguridad → DNS sobre HTTPS.
2. Proteccion Aumentada o Maxima.
3. Proveedor → Personalizado → pega la URL DoH.

Esto SOLO filtra el navegador. Para todo el sistema usa Windows / Android / iOS.

https://focusguard.trujillomingorance.com/adshield/browser
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-Navegador.txt',
      mime: 'text/plain;charset=utf-8',
      body: `FocusGuard AdShield — Quitar DoH del navegador
==============================================

Chrome / Edge / Brave:
1. chrome://settings/security
2. Usar DNS seguro → elige "Con tu proveedor actual" o un proveedor
   distinto de la URL FocusGuard.

Firefox:
1. Ajustes → Privacidad y seguridad → DNS sobre HTTPS.
2. Proteccion Desactivada, o proveedor Cloudflare/NextDNS por defecto
   (no la URL de FocusGuard).

URL que debes dejar de usar:
${dohUrl}
`,
    };
  }

  if (platform === 'firewall') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-Firewall.txt',
        mime: 'text/plain;charset=utf-8',
        body: `FocusGuard AdShield — Perimetro (pfSense / FortiGate / Sophos)
==============================================================

DoH: ${dohUrl}
Fallback: 1.1.1.1 / 1.0.0.1
DoT: ${DOT_HOST}

pfSense / OPNsense
- System → General Setup → DNS 1.1.1.1 y 1.0.0.1
- Unbound: reenviar a FocusGuard; bloquear 53/853 LAN → WAN
  (solo el firewall resuelve).

FortiGate
- DNS / DNS Filter → DoH profile → ServerURL = la URL de arriba
- DHCP option 6 = IP del gateway

Sophos
- Network → DNS → forwarders 1.1.1.1 / 1.0.0.1
- Fuerza a los clientes el DNS del gateway

https://focusguard.trujillomingorance.com/adshield/firewall
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-Firewall.txt',
      mime: 'text/plain;charset=utf-8',
      body: `FocusGuard AdShield — Revertir perimetro
=======================================

1. Quita el forwarder / perfil DoH de FocusGuard.
2. Restaura los DNS del ISP o 1.1.1.1 sin plantilla FocusGuard.
3. Reactiva 53/853 LAN→WAN solo si quieres que los clientes
   resuelvan por su cuenta de nuevo.
4. DHCP option 6: vacio o DNS del operador.

DoH que debes dejar de usar:
${dohUrl}
`,
    };
  }

  if (platform === 'gpo') {
    if (action === 'enable') {
      return {
        filename: 'Instalar-FocusGuard-AdShield-GPO.ps1',
        mime: 'text/plain;charset=utf-8',
        body: `#Requires -RunAsAdministrator
# FocusGuard AdShield — Startup Script GPO / AD
$ErrorActionPreference = "Stop"
$DohUrl = "${dohUrl}"
$CloudflareDoh = "https://cloudflare-dns.com/dns-query"
$PrimaryDns = "1.1.1.1"
$SecondaryDns = "1.0.0.1"
$BackupDns = "8.8.8.8"
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
  Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses ($PrimaryDns, $SecondaryDns, $BackupDns) -ErrorAction SilentlyContinue
}
Add-DnsClientDohServerAddress -ServerAddress $PrimaryDns -DohTemplate $DohUrl -AllowFallbackToUdp $true -AutoUpgrade $true -ErrorAction SilentlyContinue
Add-DnsClientDohServerAddress -ServerAddress $SecondaryDns -DohTemplate $CloudflareDoh -AllowFallbackToUdp $true -AutoUpgrade $true -ErrorAction SilentlyContinue
$dnsPolicy = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient"
if (-not (Test-Path $dnsPolicy)) { New-Item -Path $dnsPolicy -Force | Out-Null }
New-ItemProperty -Path $dnsPolicy -Name "DoHPolicy" -PropertyType DWord -Value 2 -Force | Out-Null
Write-Host "FocusGuard AdShield GPO aplicado con Respaldo Cloudflare. DoH: $DohUrl"
`,
      };
    }
    return {
      filename: 'Desinstalar-FocusGuard-AdShield-GPO.ps1',
      mime: 'text/plain;charset=utf-8',
      body: `#Requires -RunAsAdministrator
# FocusGuard AdShield — Quitar GPO / DNS forzado
$ErrorActionPreference = "SilentlyContinue"
Get-NetAdapter | ForEach-Object {
  Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ResetServerAddresses
}
Get-DnsClientDohServerAddress | ForEach-Object {
  Remove-DnsClientDohServerAddress -ServerAddress $_.ServerAddress -Force
}
Remove-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient" -Name "DoHPolicy" -ErrorAction SilentlyContinue
ipconfig /flushdns | Out-Null
Write-Host "FocusGuard AdShield GPO revertido. Quita tambien la GPO FocusGuard-DNS del dominio."
`,
    };
  }

  if (platform === 'ios-off-profile') {
    return {
      filename: 'FocusGuard-DNS-Predeterminado.mobileconfig',
      mime: 'application/x-apple-aspen-config',
      body: mobileconfig(CF_DOH, 'DNS cifrado predeterminado (sin AdShield)'),
    };
  }

  return null;
}

export function downloadTextFile(pkg: ShieldPackage) {
  const blob = new Blob([pkg.body], { type: pkg.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = pkg.filename;
  a.click();
  URL.revokeObjectURL(url);
}
