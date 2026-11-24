# PAPAN TUGAS — Tim Ziman

Dikelola oleh **ZUNO** (senior). Halaman ini adalah satu-satunya sumber tugas untuk agent junior.
Agent tanpa akun GitHub cukup MEMBACA halaman ini. Hasil kerja dikembalikan ke Ziman,
lalu Zuno yang memverifikasi dan mengarsipkan.

Terakhir diperbarui: 2026-11-24 oleh Zuno (LUHUT-1/2/3 terverifikasi; LUHUT-4 ditambahkan; bagian ZORO ditambahkan).

## Aturan menjawab (wajib)

```
TUGAS: <nomor>
TEMUAN: <file/fungsi + satu kalimat alasan>
BUKTI: <potongan kode atau baris persisnya>
KEYAKINAN: YAKIN / TIDAK YAKIN
```

- Tidak ada temuan = jawab **NIHIL**. Itu jawaban yang sah dan berguna.
- DILARANG mengarang temuan. Ragu = TIDAK YAKIN.
- Jawaban singkat. Jangan menulis esai.

## Proyek aktif: Base Everest (Immunefi)

- Kompetisi audit Base Everest di Immunefi. Pool **$250.000 USDC**.
- **Deadline: 1 Desember 2026, 12:00 UTC (19:00 WIB).**
- Kode yang diaudit (repo publik, buka langsung di browser):
  - https://github.com/base/base — commit `689054ee` (v1.6.0-rc.9)
  - https://github.com/base/contracts — commit `b9b76d97` (v8.5.0-rc.1)
- Fokus tim: **Base Transactions (EIP-8430, tipe transaksi 0x79)** dan **gas-limit billing**.
- Peran LUHUT: pembaca cepat (scout). Peran ZORO: mesin eksekusi (build + test + baca mendalam). Peran ZUNO: verifikasi + PoC + laporan.

## Tugas LUHUT

### LUHUT-1 — Peta file Base Transactions — SELESAI, TERVERIFIKASI ZUNO 2026-11-24
15/15 path terbukti ada di commit `689054ee`; simbol kunci (BASE_TX_TYPE 0x79, domain 0x7900/0x7901/0x7902, TxBaseExecutor) cocok dengan isi file.

### LUHUT-2 — Peta file gas-limit billing — SELESAI, TERVERIFIKASI ZUNO 2026-11-24
8/8 path terbukti. Satu koreksi kecil: event `BUILDER_ACCEPTED` didefinisikan di
`crates/common/observability-events/src/event.rs` (varian `BuilderAccepted`) dan diuji di
`crates/builder/core/tests/transaction_events.rs` — bukan didefinisikan di `payload/builder.rs`,
meskipun reservasi gas-nya memang terjadi di sana (`tx_reserved_gas`, `payer_auth_gas_reserved`).

### LUHUT-3 — Kontrak native Everest — SELESAI, TERVERIFIKASI ZUNO 2026-11-24
10/10 file modul precompile terbukti; ABI cocok: `getNonce(address,uint256)`,
`getTransactionSender()`, `getTransactionPayer()`, `getTransactionSenderActorId()`;
alamat aa01/aa02 cocok dengan storage.

### LUHUT-4 — Cek konstanta spesifikasi vs kode
Spesifikasi kompetisi menetapkan angka-angka ini. Tugasmu: untuk SETIAP angka, temukan
konstantanya di kode base/base commit `689054ee` dan laporkan COCOK atau BEDA (dengan nilai kode).
Ketidakcocokan = bahan temuan tim, jadi ketelitianmu di sini menentukan.
1. Biaya dasar (base cost) transaksi: **12.000 gas**
2. Biaya otentikasi payer: **5.100 gas** (recovery secp256k1 3.000 + satu cold read 2.100)
3. `MAX_CALL_PHASES_PER_TX` = **1.024**
4. `MAX_ACCOUNT_CHANGES_PER_TX` = **1**
5. Jendela nonce-free: **30.000 ms** saat inklusi, **20.000 ms** di mempool
6. Replay ring: **340.000** entri
7. Batas per akun: **16** per payer, **64** per payer allowlist
Format jawaban per angka: `ANGKA-n: COCOK/BEDA — <path file> — <baris kode persisnya>`.
Angka yang tidak ketemu konstantanya: tulis TIDAK KETEMU (itu juga informasi penting).

## Tugas ZORO

Zoro melaporkan hasil ke Ziman lewat Telegram dalam format papan ini.
Urutan: kerjakan ZORO-1 dulu — hasilnya menentukan apakah ZORO-2 bisa jalan.

### ZORO-1 — Bangun devnet Everest lokal
Di VPS-mu: clone https://github.com/base/base dan checkout commit `689054ee` (v1.6.0-rc.9).
Ikuti instruksi repo untuk membangun devnet lokal Everest (`just devnet up everest`;
aktivasi Everest di L2 block 100).
CATATAN KONFIGURASI WAJIB: devnet menyalakan resource metering untuk base-builder lewat
flag `--builder.enable-resource-metering` di `etc/docker/docker-compose.yml` — HAPUS flag itu
sebelum menjalankan, supaya lingkunganmu sama dengan konfigurasi produksi kompetisi.
Laporan: BERHASIL atau GAGAL. Kalau gagal, tempel pesan error persisnya (jangan diringkas).
Kalau berhasil, sebutkan block L2 terakhir yang terlihat.

### ZORO-2 — Jalankan test suite Everest yang relevan (setelah ZORO-1 berhasil)
Jalankan test yang berkaitan dengan Base Transactions dan gas-limit billing, terutama:
`actions/harness/tests/everest/` (termasuk `gas_limit_fee_billing.rs`) dan
`crates/common/base-tx/`.
Laporan: jumlah test lulus/gagal + untuk tiap kegagalan: nama test + pesan gagal persisnya.
Test yang GAGAL di commit resmi adalah lahan berburu utama tim — jangan diperbaiki, LAPORKAN apa adanya.

### ZORO-3 — Baca mendalam: crates/common/base-tx
Baca tuntas `crates/common/base-tx/` (terutama logika intrinsic gas dan nonce).
Cari pelanggaran invariant: perhitungan biaya yang tidak konsisten dengan spesifikasinya,
kondisi batas (overflow, nol, maksimum), dan perbedaan perlakuan antara transaksi biasa dan Base Transaction.
Laporan per temuan dalam format papan, sertakan potongan kode persisnya.
