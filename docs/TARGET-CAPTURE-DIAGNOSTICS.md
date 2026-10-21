# Mengapa target flee dan tidak tertangkap

Ditambahkan 21 Oktober 2026. Tujuannya mengumpulkan bukti saat target ditemui, agar penyebab keputusan bisa dianalisis kemudian. Pencatatan ini tidak mengubah aturan capture, tidak memaksa spawn, dan tidak mengirim search/battle tambahan.

## Data awal yang sudah disimpan

[Tiga kasus dari arsip desktop](capture-diagnostics/historical-20261021/INDEX.md) sudah diekstrak menjadi Markdown dan JSON terpisah. Timestamp sumber berasal dari **3–4 Oktober**, bukan pengujian live terbaru. Catatan tersebut membuktikan alasan keputusan; respons flee berhasil belum diimpor.

| Target | Rating | Peluang saat keputusan | Alasan di log |
| --- | --- | --- | --- |
| Alpha | 17 | 73% | Capture gagal atau kesempatan gratis sudah digunakan; tidak melakukan retry berbayar. |
| Light Tectonyx | 17 | 82% | Capture gagal atau kesempatan gratis sudah digunakan; tidak melakukan retry berbayar. |
| Lizzile | 16 | 55% | Tidak ada serangan sederhana yang lolos batas aman damage. Threshold capture saat itu 70%, minimum rating target saat itu 10. |

Peluang 73% atau 82% tidak menjamin capture berhasil. Untuk Lizzile, log memperlihatkan serangan tersedia, tetapi belum menyimpan seluruh pengukuran damage yang menyebabkan guard menolaknya. Karena itu belum disimpulkan bahwa guard tersebut benar atau terlalu ketat. Pencatatan baru menyimpan pengukuran yang diperlukan untuk memeriksanya.

## Pengumpulan otomatis berikutnya

Saat spesies target terdeteksi di slot aktif atau slot lawan tambahan, dibuat satu pasangan file **`.md` dan `.json`** per encounter:

- Desktop: `Auto-Capture-Game-Installer/Auto Capture Support/target-capture-diagnostics/`.
- Web: `Miscrits-Web/data/target-capture-diagnostics/`.

Markdown berisi konteks encounter, pengaturan, timeline alasan, dan snapshot terakhir. JSON berisi snapshot terstruktur untuk pemeriksaan lebih mendalam. Nama file memakai referensi lokal; tidak memakai ID akun atau ID match server.

Data yang dicatat meliputi:

- Nama/ID spesies, rating, level, HP target dan anggota aktif; kandidat target di slot bonus.
- Asal pilihan: wishlist atau daftar replacement/upgrade. Desktop juga mencatat pemeriksaan keluarga yang sudah selesai.
- Mode battle, minimum rating, izin capture rating rendah, threshold capture, flee unwanted, dan batas serangan.
- Lokasi/area/objek jika tersedia; konteks yang tidak tersedia tidak direka.
- Peluang capture yang dilaporkan server, jumlah serangan, percobaan capture, risiko efek, serta damage yang terukur untuk pasangan aktif.
- Ability yang tersedia, cooldown/uses jika tersedia, tipe tambahan dan ringkasan enchant, agar alasan tidak ada serangan aman dapat diperiksa.
- Keputusan capture/flee, pengiriman aksi, serta respons capture/flee/Keep yang benar-benar diterima.

**`decision` berbeda dari `action_sent`, dan keduanya berbeda dari konfirmasi server.** Flee baru disebut dikonfirmasi bila ada respons server yang menunjukkan keberhasilan. Respons gagal tetap disimpan. File bisa belum lengkap jika koneksi terputus atau aplikasi ditutup sebelum balasan.

## Alasan yang perlu diperiksa

| Alasan | Makna |
| --- | --- |
| Target/rating/collection rule failed | Spesies terlihat dipilih, tetapi aturan aktif tidak menganggapnya target capture saat itu. Periksa rating, izin rating rendah, wishlist, dan kebutuhan upgrade. |
| Capture attempt used | Percobaan gratis sudah digunakan; tidak mengirim percobaan berbayar. |
| Player/target HP floor | HP mencapai batas sebelum peluang capture mencapai threshold. |
| Attack limit | Batas jumlah serangan pelemah sudah tercapai. |
| Damage risk | Efek berkelanjutan atau perubahan stat membuat pelemahan lanjutan dianggap tidak aman. |
| No safe attack | Serangan tersedia tidak lolos guard damage, cooldown, tipe multi-hit/efek tambahan, enchant, atau penggunaan tersisa. |
| Manual target mode | Target diserahkan kepada pemain; automation tidak melakukan capture otomatis. |

Mengaktifkan capture rating rendah hanya melonggarkan aturan rating. Pengaturan itu tidak melewati guard HP, serangan, efek berbahaya, atau larangan retry berbayar.

## Batas penyimpanan dan aktivasi

Pencatatan hanya untuk encounter yang berkaitan dengan pilihan target/replacement, bukan seluruh lalu lintas game. Maksimum 64 kasus per folder; setiap JSON dibatasi 64 KiB dan menyimpan paling banyak 32 event terakhir. Konteks encounter pertama dipertahankan; jumlah event lama yang disisihkan dicatat. Bila folder penuh, arsipkan kasus lama lalu buka kembali aplikasi agar pencatatan dapat dilanjutkan. Kegagalan menyimpan bukti tidak membatalkan aksi battle.

Password, token, cookie, ID akun, ID instance Miscrit dan ID match tidak disertakan. Berkas audit runtime web diabaikan Git. Trace debug besar tetap nonaktif.

Desktop yang sedang terbuka perlu ditutup secara normal lalu dibuka kembali melalui **Launch Auto Capture.cmd** untuk memuat fitur baru. Status paket dicatat pada [target-capture-update.json](validation/target-capture-update.json). Web memerlukan backend yang memuat versi diagnostik 1; sesudah restart, login ulang bila diminta.

Verifikasi: **253 tes web** dan **4.011 pemeriksaan desktop yang dirender** lulus, termasuk pemisahan keputusan/pengiriman/balasan, target di slot bonus, sanitasi identitas, batas penyimpanan, dan pencatatan tanpa mengubah pilihan aksi. Data awal historis sudah tersedia; encounter live dengan pencatat baru belum diklaim terverifikasi.
