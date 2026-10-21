param([switch]$HiddenLauncher)
$ErrorActionPreference = 'Stop'
try {
$runtime = Join-Path $PSScriptRoot 'Auto Capture Support\capture-run'
$exe = Join-Path $runtime 'Miscrits-Capture.exe'
if (-not (Test-Path -LiteralPath $exe)) { throw 'Run Install Auto Capture.cmd first.' }
if (Get-Process -Name 'Miscrits-Capture' -ErrorAction SilentlyContinue) { throw 'Auto Capture is already running.' }
$pendingPath = Join-Path $PSScriptRoot 'pending-update.json'
if (Test-Path -LiteralPath $pendingPath) {
    $pending = Get-Content -LiteralPath $pendingPath -Raw | ConvertFrom-Json
    $manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'compatibility.json') -Raw | ConvertFrom-Json
    if ($pending.payload_sha256 -ne $manifest.payload_sha256) { throw 'The staged update does not match the validated patch data.' }
    & (Join-Path $PSScriptRoot 'Install.ps1') -Update
    Move-Item -LiteralPath $pendingPath -Destination (Join-Path $PSScriptRoot 'last-update.json') -Force
}
Start-Process -FilePath $exe -WorkingDirectory $runtime -ArgumentList @('--quiet', '--log-file', ('"' + (Join-Path $runtime 'engine.log') + '"'), '--', '--auto-capture') -RedirectStandardOutput (Join-Path $runtime 'console-output.log') -RedirectStandardError (Join-Path $runtime 'console-errors.log')
} catch {
    if ($HiddenLauncher) {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Miscrits launcher') | Out-Null
    }
    throw
}
