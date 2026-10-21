# Capture dan latihan koleksi di launcher desktop

Aturan terbaru: [latihan desktop sampai level 35 dan fallback tier](DESKTOP-LEVEL35-TRAINING.md). Web tetap memakai aturan sebelumnya.

Pembaruan 21 Oktober 2026 untuk **Launch Auto Capture.cmd**. Fitur berjalan pada aplikasi game desktop yang sudah dipasang di folder ini.

## Lokasi pengaturan

- **Controls → Targets**: tambah spesies, pindahkan urutan dengan Move up/Move down/Main, impor Mapped tier targets, atau Clear all targets.
- **Controls → Battle setup**: minimum rating, peluang capture dari server, batas serangan, Run from unwanted encounters, Allow selected captures below minimum rating, dan Remove target after confirmed kept capture.
- **Team → Collection**: aktifkan Train owned 17+ copies to level 35, lalu buka tier Exotic, Rare, Common, Epic, atau Legendary. Owned 17+ menambah keluarga yang memenuhi syarat dari koleksi. Mapped targets menambah keluarga yang masih memerlukan salinan 17+ ke daftar latihan dan target capture. Clear tier menghapus pilihan latihan pada tier itu.
- **Team → Replacements**: cari/tambah/hapus nama individual dan lihat kandidat milik akun. Pilihan ini terpisah dari wishlist capture. Mode pengganti level 35 tetap tersedia; mode latihan level 35 mendapat prioritas jika keduanya aktif.

Pengaturan disimpan saat tombol/switch digunakan. Login diperlukan untuk membaca koleksi dan mengaktifkan tombol tambah dari tier. Selesaikan search/battle/travel atau pembaruan tim yang masih berlangsung sebelum mengubah daftar.

## Perilaku latihan

Slot 1 tetap. Slot 2–4 memakai satu salinan terbaik per keluarga, rating **17 atau 18**, dengan urutan **Exotic → Rare → Common → Epic → Legendary**. Dalam tier yang sama, rating tertinggi didahulukan, lalu level tertinggi dan ID sebagai pembeda tetap. Trainee yang masih terpilih mempertahankan slotnya.

Keluarga dengan salinan milik akun pada level 35 ke atas dianggap selesai, termasuk bila salinan lain punya rating lebih tinggi. Salinan di slot 1 tidak diduplikasi ke slot latihan. Bila tidak ada pengganti, anggota lama tetap berada di tim dan tidak dilatih melewati batas. Latihan memakai XP yang sudah diperoleh; tidak membeli level atau bonus platinum untuk trainee.

Setelah selesai, slot beralih ke keluarga berikutnya yang sudah dimiliki dan memenuhi rating, termasuk kandidat tier berikutnya yang tidak tercantum di daftar replacement. Keluarga terpilih yang belum memiliki salinan 17+ masuk antrean upgrade hanya ketika tidak ada lagi kandidat latihan milik akun. Bila semua upgrade dimiliki dan wishlist kosong, pertarungan untuk XP berlanjut pada rute trainee yang tersedia. Pada alur khusus latihan ini, encounter dilawan untuk XP meskipun Run from unwanted encounters aktif. Sesudah semua pilihan selesai, pencarian berhenti ketika tidak ada lagi rute/target latihan.

Pergantian tim dan level-up juga diperiksa di antara tahap campaign sebelum battle berikutnya. Alur campaign dan penyembuhan virtue yang sudah ada tetap berlaku.

## Contoh capture rating rendah

Freedom belum punya salinan 17+. Aktifkan **Allow selected captures below minimum rating** untuk tetap menangkap Freedom rating 16 atau lebih rendah. Salinan itu disimpan, tetapi tidak memenuhi syarat latihan otomatis.

Dengan **Remove target after confirmed kept capture**, Freedom hilang dari wishlist setelah acknowledgement Keep. Pilihan Freedom di daftar latihan tetap ada, sehingga script masih mencari upgrade 17+. Setelah upgrade 17+ tersedia, antrean upgrade berhenti dan salinan terbaik dapat dipilih untuk dilatih. Hasil capture gagal, acknowledgement lawan, atau respons yang belum jelas tidak menghapus target.

**Clear all targets** mengosongkan wishlist yang terlihat. Antrean upgrade dari pilihan latihan tetap aktif; nonaktifkan latihan atau Clear tier bila ingin menghentikan antrean itu juga.

Cooldown, akses map, jadwal spawn, daily limit, dan peluang capture tetap mengikuti server game. Main memindahkan target ke urutan pertama; target lain tetap dicari saat rute berjalan. Tidak ada jaminan spawn atau hasil capture.

## Verifikasi

Pengujian terisolasi memakai respons server tiruan, termasuk pemilihan tier, duplikat, indeks evolusi, batas level, free XP, urutan campaign, penghapusan setelah Keep, impor tier dan pengaturan saat request masih pending. Suite yang sama dirender untuk memeriksa panel ukuran standar dan compact. Hasil terbaru: 4.025 pemeriksaan lulus pada `validation/desktop-level35-update.json` dan `validation/desktop-level35-tests.log`.

Belum diuji pada capture atau campaign akun live. Konfigurasi akun desktop dipertahankan; fitur latihan baru mulai nonaktif hingga Anda memilih dan mengaktifkannya.
