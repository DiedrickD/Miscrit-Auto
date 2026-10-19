$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot 'pack-tools.ps1')
$work = Join-Path ([IO.Path]::GetTempPath()) 'Miscrits-Web-Arena-20261019'
New-Item -ItemType Directory -Path $work -Force | Out-Null
$source = Join-Path $root 'Auto-Capture-Game-Installer/Auto Capture Support/capture-run/Miscrits-Capture.exe'
$script = @'
extends Node
func _ready():
	call_deferred("extract")
func extract():
	FileAccess.open(OS.get_executable_path().get_base_dir().path_join("arena-protocol.json"), FileAccess.WRITE).store_string(JSON.stringify({"bot_timeout": Constants.BOT_TIMEOUT, "rating_points": Constants.rating_points, "special_cooldowns": Constants.special_cooldowns}, "\t"))
	var paths = ["Server.gd", "addons/com.heroiclabs.nakama/socket/NakamaSocket.gd", "scenes/battle/battle.gd", "scenes/arenas/arena_searching.gd", "scenes/arenas/battle_arena.gd", "scenes/arenas/platinum_arena.gd", "scenes/arenas/random_arena.gd", "scenes/arenas/random_arena_stage.gd", "scenes/arenas/random_arena_miscrit.gd"]
	for path in paths:
		var resource = load("res://" + path)
		if resource:
			FileAccess.open(OS.get_executable_path().get_base_dir().path_join(path.get_file()), FileAccess.WRITE).store_string(resource.source_code)
	get_tree().quit()
'@
$patches = [ordered]@{'mama_hunt_test.gd' = [Text.Encoding]::UTF8.GetBytes($script)}
$exe = Join-Path $work 'Miscrits-Arena-Extract.exe'
Write-PatchedPack $source $exe $patches
foreach ($dll in Get-ChildItem (Split-Path $source) -Filter '*.dll' -File) { Copy-Item -LiteralPath $dll.FullName -Destination $work -Force }
$process = Start-Process -FilePath $exe -WorkingDirectory $work -WindowStyle Hidden -PassThru -ArgumentList @('--headless','--log-file',('"' + (Join-Path $work 'extract.log') + '"'),'--','--mama-test')
if (-not $process.WaitForExit(30000)) { throw "Arena extraction still running: $($process.Id)" }
if (-not (Test-Path (Join-Path $work 'random_arena.gd'))) { throw 'Arena extraction did not produce source.' }
Write-Output "Arena source extracted without signing in: $work"
