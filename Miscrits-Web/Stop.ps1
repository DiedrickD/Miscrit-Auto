param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$node = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'runtime/node.exe'))
$server = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'server.mjs'))
$listeners = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort 4318 -State Listen -ErrorAction SilentlyContinue
$owners = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)
$processes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object {
    $_.ProcessId -in $owners -and $_.ExecutablePath -eq $node -and $_.CommandLine -and
    ($_.CommandLine.Contains($server) -or $_.CommandLine -match '(?:^|\s)"?(?:\.[\\/])?server\.mjs"?(?:\s|$)')
}
if ($CheckOnly) { $processes | Select-Object ProcessId,ExecutablePath; return }
foreach ($process in $processes) { Stop-Process -Id $process.ProcessId -ErrorAction Stop }
Write-Output 'Miscrits website backend stopped. Saved settings and history are retained.'
