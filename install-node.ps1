<#
install-node.ps1
Script para comprobar e instalar Node.js LTS (Windows) y ejecutar npm install.
Advertencia: la instalación silenciosa de Node requiere permisos de administrador.
Ejecuta este script en PowerShell como Administrador.
#>

function Write-Log { param($m) Write-Host "[install-node] $m" }

Write-Log "Comprobando si 'node' está disponible..."
if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Log "Node ya instalado: $(node -v)"
  Write-Log "Ejecutando 'npm install' en el directorio del proyecto..."
  npm install
  Write-Log "Listo. Para arrancar el servidor: npm start"
  return
}

Write-Log "Node no encontrado. Descargando instalador LTS (v18) desde nodejs.org..."
$base = 'https://nodejs.org/dist/latest-v18.x/'
try {
  $html = Invoke-WebRequest -Uri $base -UseBasicParsing -ErrorAction Stop
} catch {
  Write-Log "Error al acceder a $base. Comprueba tu conexión a Internet."
  exit 1
}

# Buscar el MSI x64 en el listado
$match = [regex]::Match($html.Content, 'href="(?<file>node-v[0-9\.]+-x64.msi)"')
if (-not $match.Success) {
  Write-Log "No se pudo localizar un instalador .msi en la página. Abriendo la página de descargas en el navegador..."
  Start-Process $base
  exit 1
}

$msiFile = $match.Groups['file'].Value
$msiUrl = $base + $msiFile
$tempPath = Join-Path $env:TEMP $msiFile

Write-Log "Descargando $msiUrl -> $tempPath"
Invoke-WebRequest -Uri $msiUrl -OutFile $tempPath -UseBasicParsing

Write-Log "Iniciando instalador (requiere privilegios). Si no tienes permisos, ejecuta este script como Administrador."
try {
  $proc = Start-Process -FilePath msiexec.exe -ArgumentList "/i `"$tempPath`" /qn /norestart" -Wait -PassThru -ErrorAction Stop
  Write-Log "Instalación finalizada. Versión de node: $(node -v)"
} catch {
  Write-Log "No se ha podido instalar automáticamente. Ejecuta manualmente: msiexec /i $tempPath"
  exit 1
}

Write-Log "Ejecutando 'npm install' en el proyecto..."
npm install
Write-Log "Instalación de dependencias finalizada. Arranca el servidor con: npm start"
