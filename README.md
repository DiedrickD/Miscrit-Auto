# Miscrits Field Station

## Coba game desktop (Windows 64-bit)

Unduh **Miscrits-Desktop-Windows-2026-10-21.zip** dari [rilis desktop](https://github.com/azure722/Miscrit-Auto/releases/tag/desktop-2026.10.21).

1. Ekstrak seluruh ZIP ke folder yang bisa ditulis. Jangan jalankan dari dalam ZIP.
2. Buka **Launch Auto Capture.cmd** di dalam folder hasil ekstraksi.
3. Login memakai akun Miscrits sendiri. Jalankan Steam bila memakai login Steam.
4. Pilih target di **Controls > Targets / Battle setup**, lalu tekan **Start / F8**.

ZIP menyertakan executable, runtime game, DLL dan launcher. Tidak perlu Node.js, Python, Godot editor atau instalasi game terpisah untuk mengekstrak dan membuka paket. Login dan permainan membutuhkan internet. Pengaturan awal bersih; riwayat dan akun pembuat tidak disertakan.

Untuk installer yang lebih kecil, unduh repository lalu jalankan **Auto-Capture-Game-Installer/Install Auto Capture.cmd**. Opsi ini memerlukan game Miscrits Steam 2.23.0 yang kompatibel, kemudian membuat salinan Auto Capture terpisah.

[Panduan koleksi desktop](docs/DESKTOP-COLLECTION-WORKFLOW.md) · [Latihan sampai level 35](docs/DESKTOP-LEVEL35-TRAINING.md) · [Panduan paket](docs/DESKTOP-SHARE.md).

## Versi web/headless

Browser client for Miscrits with a local Node.js backend.

The native desktop launcher is **Launch Auto Capture.cmd**. Its **Team → Collection** tab supports owned tier fallbacks and best 17+ copies trained to level 35; capture controls are in **Controls → Targets / Battle setup**. [Desktop guide](docs/DESKTOP-COLLECTION-WORKFLOW.md).

## Run on Windows

1. Clone or download this repository.
2. Double-click **Launch Miscrits Website.cmd**.
3. Open http://127.0.0.1:4318 and sign in.
4. Use **Stop Miscrits Website.cmd** to stop the backend.

The Windows Node.js runtime is included; no npm installation is needed.
Keep the included catalog at Auto-Capture-Game-Installer/source/capture_catalog.json; the website loads it when starting.

See [Miscrits-Web/README.md](Miscrits-Web/README.md) for features, operation, and tests.
The backend runs locally. GitHub Pages alone cannot run it.
