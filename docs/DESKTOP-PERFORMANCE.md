# CMD dan beban koleksi desktop

21 Oktober 2026.

Jendela CMD menampilkan output debug dari launcher/game: log Nakama pada level DEBUG dan dump konfigurasi lengkap untuk setiap status automation. Fitur koleksi juga memindai roster untuk setiap nama serta membangun ulang daftar pada tab tersembunyi. Keduanya menambah pekerjaan yang tidak diperlukan. Ini temuan dari kode; perubahan FPS pada akun live belum diukur.

## Perbaikan

- Launcher CMD menyerahkan proses ke Windows Script Host, lalu menjalankan PowerShell tersembunyi. Game tetap menggunakan jendela normal. Output diarahkan ke file, dengan `--quiet`; pesan kegagalan launcher tetap ditampilkan melalui dialog.
- Nakama memakai level ERROR. Log normal menyimpan pesan automation ringkas tanpa seluruh daftar target/config. Trace detail tersedia lewat `--study-log`, atau pada tes terisolasi.
- Laporan latihan membangun indeks koleksi dengan satu traversal roster. Hanya keluarga terpilih yang dihitung ratingnya. Hasil prioritas tier, rating terbaik, batas level dan pemeriksaan indeks tetap diuji.
- Panel hanya memperbarui tab yang terlihat. Panel yang diminimalkan tidak membangun ulang daftar roster atau rute. Izin bonus platinum tidak lagi diperbarui setiap frame.
- Tombol bulk tier memakai satu laporan roster. Daftar kandidat legacy juga dihitung bersama, bukan sekali per nama.
- Panel tetap dibatasi ukuran viewport setelah pilihan bulk.
- Installer menyiapkan file game dan rollback sementara di direktori Temp, memverifikasi hash hasil, lalu membersihkannya. Tidak menambah salinan game 460 MB permanen ke folder proyek yang dibatasi 2 GB.

## Aktivasi

Paket baru semula disiapkan ketika game masih berjalan. Setelah game tertutup, pembaruan **sudah dipasang** dan hash binary cocok dengan fixture installer yang diuji. Buka **Launch Auto Capture.cmd** untuk memakai versi baru. Tidak ada sesi game yang dihentikan paksa dan game tidak dibuka kembali oleh proses pembaruan ini.

Pengaturan dan pilihan koleksi milik pengguna dipertahankan; hash konfigurasi sebelum/sesudah pemasangan sama. Payload aktif dicatat di `Auto-Capture-Game-Installer/last-update.json`. Log debug lama berukuran sekitar 272 MB diarsipkan menjadi sekitar 10,5 MB; checksum hasil dekompresi cocok dengan sumber sebelum log lama disingkirkan. Arsip tersebut tetap lokal dan diabaikan Git.

## Verifikasi

- **4.001 pemeriksaan** pada suite desktop yang dirender, nol kegagalan.
- Fixture **4.000 owned / 100 selected** mengunjungi tepat **4.000** entri roster untuk satu laporan; waktu lokal sekitar **12 ms**. Angka ini berasal dari objek uji, bukan pengukuran FPS game live.
- **4 skenario integrasi launcher**, nol kegagalan, termasuk quiet launch, penerapan staged update, hash yang tidak cocok dan game masih berjalan.
- Fresh install dan update diuji pada fixture di Temp; sembilan resource hasil instalasi cocok dengan source yang diuji, pengaturan fixture dipertahankan dan tidak ada backup full-game tertinggal di folder instalasi fixture.
- Sintaks dan jalur launcher VBS diperiksa memakai `cscript Launch.vbs /check`, tanpa membuka game kedua.

Laporan: [desktop-performance-update.json](validation/desktop-performance-update.json), [arsip log](validation/desktop-debug-archive.json), dan [log suite](validation/desktop-performance-tests.log). Versi baru sudah dipasang, tetapi perubahan FPS dan konsol pada sesi pengguna belum diukur setelah login ulang.
