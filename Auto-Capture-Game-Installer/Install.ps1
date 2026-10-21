param([string]$GameExe, [switch]$Update)
$ErrorActionPreference = 'Stop'
$utf8 = [Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-Pack([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    $reader = [IO.BinaryReader]::new($stream)
    try {
        $start = 0L
        $footer = 0L
        if ($stream.Length -lt 40) { throw 'File is too small to contain a game pack.' }
        $stream.Position = $stream.Length - 12
        $size = $reader.ReadUInt64()
        if ($reader.ReadUInt32() -eq 0x43504447) {
            if ($size -gt ($stream.Length - 12)) { throw 'Invalid pack size.' }
            $start = $stream.Length - 12 - [long]$size
            $footer = 12L
        }
        $stream.Position = $start
        if ($reader.ReadUInt32() -ne 0x43504447 -or $reader.ReadUInt32() -ne 3) {
            throw 'This installer requires an unencrypted Godot v3 resource pack.'
        }
        $major = $reader.ReadUInt32(); $minor = $reader.ReadUInt32(); $patch = $reader.ReadUInt32()
        if ($major -ne 4 -or $minor -ne 6) { throw 'Unsupported game engine version. Expected Godot 4.6.' }
        if ($reader.ReadUInt32() -ne 2) { throw 'Unsupported game pack flags.' }
        $base = $reader.ReadUInt64()
        $directory = $reader.ReadUInt64()
        if ($directory -ge ($stream.Length - $start)) { throw 'Invalid pack directory.' }
        $stream.Position = $start + [long]$directory
        $count = $reader.ReadUInt32()
        if ($count -gt 100000) { throw 'Invalid pack entry count.' }
        $entries = [Collections.Generic.List[object]]::new()
        $lookup = @{}
        for ($i = 0; $i -lt $count; $i++) {
            $length = $reader.ReadInt32()
            if ($length -lt 1 -or $length -gt 4096) { throw 'Invalid resource name length.' }
            $nameBytes = $reader.ReadBytes($length)
            $name = $utf8.GetString($nameBytes).TrimEnd([char]0)
            $entry = [pscustomobject]@{Name=$name; NameBytes=$nameBytes; Offset=$reader.ReadUInt64(); Size=$reader.ReadUInt64(); Hash=$reader.ReadBytes(16); Flags=$reader.ReadUInt32()}
            if ($entry.Flags -ne 0 -or $lookup.ContainsKey($name)) { throw 'Unsupported or duplicate resource entry.' }
            if (($start + [long]$base + [long]$entry.Offset + [long]$entry.Size) -gt $stream.Length) { throw 'Resource outside pack.' }
            $entries.Add($entry)
            $lookup[$name] = $entry
        }
        return [pscustomobject]@{Start=$start; Footer=$footer; Base=$base; Entries=$entries; Lookup=$lookup}
    } finally { $reader.Dispose() }
}

if ([string]::IsNullOrWhiteSpace($GameExe)) {
    $steamExe = 'C:\Program Files (x86)\Steam\steamapps\common\Miscrits\Miscrits.exe'
    if (Test-Path -LiteralPath $steamExe) { $GameExe = $steamExe }
}
if ([string]::IsNullOrWhiteSpace($GameExe)) {
    Add-Type -AssemblyName System.Windows.Forms
    $picker = New-Object Windows.Forms.OpenFileDialog
    $picker.Title = 'Select your installed Miscrits game executable (client 2.23.0)'
    $picker.Filter = 'Game executable (*.exe)|*.exe'
    if ($picker.ShowDialog() -ne [Windows.Forms.DialogResult]::OK) { exit 0 }
    $GameExe = $picker.FileName
    $picker.Dispose()
}
$GameExe = (Resolve-Path -LiteralPath $GameExe).Path
$sourceDirectory = Split-Path -Parent $GameExe
$packPath = $GameExe
try { $pack = Read-Pack $packPath }
catch {
    $externalPack = [IO.Path]::ChangeExtension($GameExe, '.pck')
    if (-not (Test-Path -LiteralPath $externalPack)) { throw "Unsupported executable: $($_.Exception.Message) No matching external .pck found." }
    $packPath = $externalPack
    $pack = Read-Pack $packPath
}

$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'compatibility.json') -Raw | ConvertFrom-Json
if ((Get-FileHash -LiteralPath (Join-Path $PSScriptRoot 'patch-data.zip') -Algorithm SHA256).Hash -ne $manifest.payload_sha256) { throw 'Patch data is damaged. Extract the ZIP again.' }
Write-Host 'Checking installed game compatibility...'
foreach ($expected in $manifest.assets) {
    $entry = $pack.Lookup[$expected.name]
    if ($null -eq $entry -or $entry.Size -ne $expected.size -or [BitConverter]::ToString($entry.Hash).Replace('-', '').ToLowerInvariant() -ne $expected.md5) {
        throw "Game files do not match the supported $($manifest.client) resource set: $($expected.name). Nothing in your game installation was changed."
    }
}
foreach ($dll in $manifest.dlls) {
    $path = Join-Path $sourceDirectory $dll.name
    if (-not (Test-Path -LiteralPath $path) -or (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $dll.sha256) {
        throw "Missing or incompatible runtime DLL: $($dll.name). Select the executable in the complete installed game folder."
    }
}

$support = Join-Path $PSScriptRoot 'Auto Capture Support'
$destination = Join-Path $support 'capture-run'
$outputExe = Join-Path $destination 'Miscrits-Capture.exe'
$outputPack = if ($packPath -eq $GameExe) { $outputExe } else { Join-Path $destination 'Miscrits-Capture.pck' }
if ($manifest.runtime_prefix) { $outputPack = $outputExe }
$allowedRoot = [IO.Path]::GetFullPath($PSScriptRoot) + '\'
foreach ($target in @($outputExe, $outputPack, ($outputPack + '.installing'))) {
    if (-not [IO.Path]::GetFullPath($target).StartsWith($allowedRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Output path is outside installer directory.' }
}
if ([IO.Path]::GetFullPath($outputExe) -eq [IO.Path]::GetFullPath($GameExe)) { throw 'Select the original installed game, not this output copy.' }
if (Get-Process -Name 'Miscrits-Capture' -ErrorAction SilentlyContinue) { throw 'Close Auto Capture before installing or updating.' }
if ((Test-Path -LiteralPath $outputExe) -and -not $Update) { throw 'An Auto Capture copy already exists here. Run Install.ps1 -Update to update it while keeping your settings.' }
New-Item -ItemType Directory -Path $destination -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $support 'tests') -Force | Out-Null
$stageDirectory = [IO.Path]::GetFullPath((Join-Path ([IO.Path]::GetTempPath()) ('Miscrits-install-' + [Guid]::NewGuid().ToString('N'))))
New-Item -ItemType Directory -Path $stageDirectory | Out-Null
$tempPack = Join-Path $stageDirectory 'runtime.installing'
$payload = [IO.Compression.ZipFile]::OpenRead((Join-Path $PSScriptRoot 'patch-data.zip'))
try {
    if ($manifest.runtime_prefix) {
        # Reuse the package's tested Godot runtime with the selected game's resources.
        $runtime = $payload.GetEntry($manifest.runtime_prefix)
        if ($null -eq $runtime) { throw 'The compatible runtime is missing from the patch data.' }
        $target = [IO.File]::Create($tempPack)
        $runtimeInput = $runtime.Open()
        $sourceInput = [IO.File]::OpenRead($packPath)
        try {
            $runtimeInput.CopyTo($target)
            $sourceInput.Position = $pack.Start
            $pack.Start = $target.Position
            $sourceInput.CopyTo($target)
        } finally { $runtimeInput.Dispose(); $sourceInput.Dispose(); $target.Dispose() }
    } else {
        Copy-Item -LiteralPath $packPath -Destination $tempPack -Force
    }
} catch { $payload.Dispose(); throw }
$stream = [IO.File]::Open($tempPack, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite)
$writer = [IO.BinaryWriter]::new($stream)
$md5 = [Security.Cryptography.MD5]::Create()
try {
    $stream.SetLength($stream.Length - $pack.Footer)
    $stream.Position = $stream.Length
    foreach ($resource in $payload.Entries) {
        if ($resource.FullName -eq $manifest.runtime_prefix) { continue }
        $memory = New-Object IO.MemoryStream
        $resourceInput = $resource.Open()
        try { $resourceInput.CopyTo($memory); $bytes = $memory.ToArray() } finally { $resourceInput.Dispose(); $memory.Dispose() }
        $name = $resource.FullName
        $entry = $pack.Lookup[$name]
        if ($null -eq $entry) {
            $rawName = $utf8.GetBytes($name)
            $nameBytes = [byte[]]::new([int]([Math]::Ceiling($rawName.Length / 4.0) * 4))
            [Array]::Copy($rawName, $nameBytes, $rawName.Length)
            $entry = [pscustomobject]@{Name=$name; NameBytes=$nameBytes; Offset=0; Size=0; Hash=$null; Flags=0}
            $pack.Entries.Add($entry)
        }
        $entry.Offset = [uint64]($stream.Position - $pack.Start - [long]$pack.Base)
        $entry.Size = [uint64]$bytes.Length
        $entry.Hash = $md5.ComputeHash($bytes)
        $entry.Flags = 0
        $writer.Write([byte[]]$bytes)
        while (($stream.Position - $pack.Start) % 16) { $writer.Write([byte]0) }
    }
    $directory = [uint64]($stream.Position - $pack.Start)
    $writer.Write([uint32]$pack.Entries.Count)
    foreach ($entry in $pack.Entries) {
        $writer.Write([uint32]$entry.NameBytes.Length); $writer.Write([byte[]]$entry.NameBytes)
        $writer.Write([uint64]$entry.Offset); $writer.Write([uint64]$entry.Size)
        $writer.Write([byte[]]$entry.Hash); $writer.Write([uint32]$entry.Flags)
    }
    $writer.Write([uint64]($stream.Position - $pack.Start)); $writer.Write([uint32]0x43504447)
    $stream.Position = $pack.Start + 32
    $writer.Write($directory)
} finally { $writer.Dispose(); $md5.Dispose(); $payload.Dispose() }
$expectedHash = (Get-FileHash -LiteralPath $tempPack -Algorithm SHA256).Hash
$builtPack = Read-Pack $tempPack
if ($builtPack.Entries.Count -ne $pack.Entries.Count) { throw 'Built resource directory is incomplete; existing installation kept.' }
$temporaryBackup = Join-Path $stageDirectory 'runtime.before-update'
if (Test-Path -LiteralPath $outputPack) {
    if ([IO.Path]::GetPathRoot($tempPack) -eq [IO.Path]::GetPathRoot($outputPack)) {
        [IO.File]::Replace($tempPack,$outputPack,$temporaryBackup)
    } else {
        Copy-Item -LiteralPath $outputPack -Destination $temporaryBackup
        Copy-Item -LiteralPath $tempPack -Destination $outputPack -Force
    }
} else {
    Move-Item -LiteralPath $tempPack -Destination $outputPack -Force
}
if ((Get-FileHash -LiteralPath $outputPack -Algorithm SHA256).Hash -ne $expectedHash) {
    throw "Installed bytes did not match the built file. Rollback retained at $temporaryBackup"
}
# Retire only this invocation's temporary files after the installed hash matches.
# Staging/rollback outside the workspace avoids two extra full game copies in it.
foreach ($stagedFile in @($tempPack,$temporaryBackup)) {
    $resolvedStageFile = [IO.Path]::GetFullPath($stagedFile)
    if ([IO.Path]::GetDirectoryName($resolvedStageFile) -ne $stageDirectory) { throw 'Invalid temporary cleanup path.' }
    if (Test-Path -LiteralPath $resolvedStageFile) { Remove-Item -LiteralPath $resolvedStageFile }
}
Remove-Item -LiteralPath $stageDirectory
if ($packPath -ne $GameExe -and -not $manifest.runtime_prefix) { Copy-Item -LiteralPath $GameExe -Destination $outputExe }
Get-ChildItem -LiteralPath $sourceDirectory -Filter '*.dll' -File | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $destination }
if (Test-Path -LiteralPath (Join-Path $sourceDirectory 'steam_appid.txt')) {
    Copy-Item -LiteralPath (Join-Path $sourceDirectory 'steam_appid.txt') -Destination $destination
}
$configPath = Join-Path $support 'capture-config.json'
if (-not (Test-Path -LiteralPath $configPath)) {
    $config = @{mode='capture_rated'; auto_search=$true; capture_id=@(); object_id=@(); min_rating=13; other_min_rating=16; auto_level_up=$false; platinum_upgrade=$false; platinum_miscrit_ids=@()}
    [IO.File]::WriteAllText($configPath, ($config | ConvertTo-Json -Depth 5), $utf8)
}
Write-Host 'Installed. Open Launch Auto Capture.cmd, choose target species, then Start.' -ForegroundColor Green
Write-Host 'Your original game installation has not been modified.'
