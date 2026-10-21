AUTO CAPTURE - INSTALL USING YOUR EXISTING MISCRITS GAME

Desktop training now continues to level 35 and automatically checks owned 17+
copies in later tiers when the selected tier has no eligible candidates.
Slot 1 and duplicate families are protected. Fourth evolution alone is not
level-35 completion. Web is unchanged. See ../docs/DESKTOP-LEVEL35-TRAINING.md.

Target encounter diagnostics save .md + .json files in:
Auto Capture Support/target-capture-diagnostics/
They record capture/flee reasons and received responses without changing battle
rules. Maximum 64 cases; archive old cases to keep collecting. See
../docs/TARGET-CAPTURE-DIAGNOSTICS.md. Reopen the launcher to load staged updates.

Performance update: the launcher opens through Launch.vbs without a persistent
CMD log window. Keep Launch.vbs beside Launch.ps1. Network DEBUG dumps are off;
normal logs are compact, and hidden collection tabs do not rebuild the roster.
If pending-update.json exists, close the game normally and reopen the launcher
to apply it. Existing collection selections and settings are preserved.

21 October desktop update: Team > Collection adds tier selections and
best 17+ copies trained to level 35 in slots 2-4, keeping slot 1.
Controls > Targets adds ordering, tier imports and Clear all targets.
Controls > Battle setup adds below-minimum captures and removal after Keep.
Choose and enable these options after login; existing settings are preserved.
Full guide: ../docs/DESKTOP-COLLECTION-WORKFLOW.md

Windows 64-bit. Based on Miscrits client 2.23.0 / Godot 4.6.
No source package, Python, compiler or Godot editor is required.
This installer needs your existing compatible game executable and DLLs.
It checks the resource set and rejects incompatible versions.

1. Extract this entire ZIP into a new writable folder.
2. Close Miscrits. Open Install Auto Capture.cmd.
3. The installer automatically uses:
   C:\Program Files (x86)\Steam\steamapps\common\Miscrits\Miscrits.exe
   If it is absent, select your installed Miscrits .exe in the file picker.
   For Steam: Miscrits > Manage > Browse local files.
4. After installation, open Launch Auto Capture.cmd.
5. Choose your target species in Controls and press Start.

Keep Steam running if you use Steam login. Use your own game account.
Your original game is not overwritten. The installer creates a separate
copy in this folder using your game's existing files (about 460 MB).
Do not run inside the ZIP. Keep the installer folder's files together.

The combined capture mode uses separate minimum ratings:
selected species 13+, all other encountered species 16+ by default.
Both can be changed. Platinum spending and free leveling start disabled.
The patch includes the current automation UI, circle minimize, bonus-only
platinum permissions, and in-battle self-healing behavior.

If compatibility checking fails, send the exact error and game version
to the sender. This package is not claimed to work with every release.
Validation covers the matching local resource set and offline tests;
installation against the supplied Steam 2.23.0 client has been verified offline.

UPDATED: 2026-10-18
The installed copy in Auto Capture Support is already updated to 2.23.0.
Launch Auto Capture.cmd is ready to use. Settings and histories are preserved.
To reinstall/update this copy from the supported Steam files, run:
powershell -NoProfile -ExecutionPolicy Bypass -File .\Install.ps1 -Update
The update keeps the previous executable as a dated .bak file.
Patch data includes the package's compatible Godot runtime.
Online login/gameplay must still be checked in the game.
