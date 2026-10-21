# Latihan desktop sampai level 35 dan fallback tier

Pembaruan 21 Oktober 2026, **khusus game desktop**. Kode dan pengaturan web tidak diubah; alur web tetap memakai aturan sebelumnya.

## Mengapa sebelumnya berhenti di Ready to train

Mode latihan koleksi sebelumnya membatasi trainee pada level 30. Kode juga menganggap indeks evolusi keempat sebagai tanda keluarga selesai. Akibatnya, anggota tim level 30 yang XP-nya siap dipakai tidak lolos pemeriksaan latihan otomatis.

Pada desktop, batas latihan dan status selesai sekarang **level 35**. Evolusi keempat saja tidak dianggap selesai: bentuk itu sudah bisa dimiliki sebelum mencapai 35. Status Ready to train diproses dengan RPC free XP yang sama seperti sebelumnya; tidak membeli level atau bonus platinum untuk trainee.

## Pemilihan tim

- **Slot 1 tetap** dan keluarganya dikecualikan dari kandidat slot 2–4, termasuk bila ada salinan cadangan dengan rating lebih tinggi.
- Minimum rating tetap **17+**, sesuai pilihan sebelumnya. Hanya satu salinan terbaik per keluarga yang memenuhi syarat: rating tertinggi, lalu level tertinggi dan ID sebagai pembeda tetap.
- Jika ada salinan keluarga tersebut yang sudah **level 35**, keluarga itu dilewati, termasuk salinan lainnya yang ratingnya lebih tinggi.
- Pilihan nama menentukan tier awal. Urutannya tetap **Exotic → Rare → Common → Epic → Legendary**. Jika tier awal tidak punya cukup kandidat, sistem memeriksa salinan milik akun pada tier berikutnya, lalu berikutnya lagi.
- Kandidat milik akun pada tier berikutnya **tidak harus sudah dimasukkan ke daftar replacement**. Panel menandainya sebagai **owned fallback**. Sistem tidak otomatis menambahkan seluruh spesies ke wishlist capture.
- Bila belum ada nama terpilih, sistem memulai pemeriksaan koleksi dari Exotic.
- Kandidat yang masih terpilih mempertahankan slotnya. Jika tidak ada pengganti untuk sebuah slot, anggota lama dipertahankan dan tidak dipaksa keluar; salinan duplikat atau keluarga selesai tidak dilatih lagi oleh mode ini.

Misalnya, kandidat Exotic sudah 35 dan tidak ada Exotic lain yang memenuhi syarat. Bila akun mempunyai Rare rating 17/18 yang belum selesai dan bukan keluarga lead, salinan itu dapat menggantikan trainee Exotic. Common diperiksa sesudah Rare, dan seterusnya.

## Pencarian dan latihan

Selama masih ada trainee milik akun yang memenuhi syarat, mode ini mendahulukan trainee tersebut dibanding antrean capture upgrade yang belum dimiliki. Wishlist capture yang dipilih langsung oleh pengguna tetap berlaku. Jika wishlist kosong, rute kandidat latihan digunakan untuk memperoleh XP.

Baru setelah semua kandidat milik akun habis/selesai, pilihan replacement yang belum punya salinan 17+ dapat kembali menjadi target upgrade. Tetap mengikuti ketersediaan rute, cooldown dan batas server.

Antara tahap campaign, pemeriksaan free XP dan pergantian tim juga memakai batas level 35. Tidak ada perubahan pada batas atau aturan latihan web.

## Aktivasi dan verifikasi

Buka **Team → Collection → Train owned 17+ copies to level 35** setelah memuat versi baru. Pengaturan lama disimpan; pilihan nama tidak diganti. Game yang masih berjalan memakai kode lama sampai ditutup secara normal dan dibuka kembali melalui **Launch Auto Capture.cmd**.

**4.025 pemeriksaan desktop yang dirender lulus**, termasuk:

- Level 30 + Ready to train + indeks evolusi keempat dapat mengirim satu free XP request dan menjadi 31.
- Level 34 menjadi 35, lalu tidak ada request latihan berikutnya.
- Kandidat S dari tier berikutnya ditemukan meski tidak dipilih namanya.
- Duplikat keluarga yang selesai, salinan rating rendah dan keluarga lead tidak dipilih sebagai trainee baru.
- Missing upgrade tidak menahan antrean selama ada kandidat milik akun.
- Campaign menunggu latihan/pergantian tim sebelum tahap berikutnya.

Hasil: [desktop-level35-update.json](validation/desktop-level35-update.json). Alur akun live sesudah restart belum diklaim terverifikasi. Indeks evolusi keempat tidak membuktikan bahwa salinan yang sudah dilepas/dijual dahulu pernah level 35; pemeriksaan selesai memakai koleksi yang tersedia saat ini.
