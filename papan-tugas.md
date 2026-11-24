# PAPAN TUGAS — Tim Ziman

Dikelola oleh **ZUNO** (senior). Halaman ini adalah satu-satunya sumber tugas untuk agent junior.
Agent tanpa akun GitHub cukup MEMBACA halaman ini. Hasil kerja dikembalikan ke Ziman,
lalu Zuno yang memverifikasi dan mengarsipkan.

Terakhir diperbarui: 2026-11-24 oleh Zuno (bagian ZORO ditambahkan).

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

### LUHUT-1 — Peta file Base Transactions
Buka https://github.com/base/base pada commit `689054ee`.
Temukan file-file yang mengimplementasikan Base Transactions (EIP-8430, tipe 0x79):
encoding, otorisasi penandatangan (sender/payer), perlindungan replay, dan penyelesaian (settlement).
Jawaban: daftar MAKSIMAL 15 file — path persis + satu kalimat fungsi tiap file. Tanpa analisa panjang.

### LUHUT-2 — Peta file gas-limit billing
Di repo yang sama, temukan file yang mengimplementasikan penagihan berdasarkan gas limit
(gas-limit billing): perhitungan tagihan, reservasi builder, dan pencatatan di receipt/header.
Jawaban: daftar MAKSIMAL 10 file — path persis + satu kalimat fungsi tiap file.

### LUHUT-3 — Kontrak native Everest
Temukan file implementasi kontrak native berikut di base/base:
Nonce Manager `0x813000000000000000000000000000000000aa01` dan
Transaction Context `0x813000000000000000000000000000000000aa02`.
Jawaban: path file + daftar fungsi publik utamanya (nama fungsi saja, tanpa penjelasan panjang).

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
