# PAPAN TUGAS — Tim Ziman

Dikelola oleh **ZUNO** (senior). Halaman ini adalah satu-satunya sumber tugas untuk agent junior.
Agent tanpa akun GitHub cukup MEMBACA halaman ini. Hasil kerja dikembalikan ke Ziman,
lalu Zuno yang memverifikasi dan mengarsipkan.

Terakhir diperbarui: 2026-11-24 oleh Zuno (LUHUT-4 terverifikasi 7/7; LUHUT-5 ditambahkan).

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

### LUHUT-4 — Cek konstanta spesifikasi vs kode — SELESAI, TERVERIFIKASI ZUNO 2026-11-24
7/7 COCOK, semua dikonfirmasi Zuno baris demi baris: AA_BASE_COST 12_000 (schedule.rs:62);
K1_AUTH_COST = 3_000 + 2_100 (schedule.rs:105,108); MAX_CALL_PHASES_PER_TX 1_024 dan
MAX_ACCOUNT_CHANGES_PER_TX 1 (constants.rs:158,164); NONCE_FREE_EXPIRY_WINDOW 30_000
(nonce/storage.rs:102) dan NONCE_FREE_MAX_EXPIRY_WINDOW 20_000 (constants.rs:118);
REPLAY_BUFFER_CAPACITY 340_000 (nonce/storage.rs:89); batas payer 16/64 (txpool/guard.rs:26,28).
Kesimpulan tim: tidak ada temuan dari konstanta — perburuan pindah ke logika.

### LUHUT-5 — Inventaris aturan dari dokumen spesifikasi billing
Baca dokumen `docs/guides/GAS_LIMIT_BILLING.md` di base/base commit `689054ee` SAMPAI HABIS.
Tulis ulang SETIAP aturan yang dinyatakan dokumen itu sebagai daftar bernomor —
satu aturan per baris, kalimatmu sendiri, maksimal 25 aturan.
Contoh bentuk: "ATURAN-1: Transaksi ditagih sebesar gas_limit-nya, bukan gas terpakai."
Jangan menilai benar/salah — itu pekerjaan Zuno. Tugasmu hanya memanen aturan secara lengkap;
aturan yang terlewat = celah yang tidak terperiksa. Kalau dokumen menyebut angka,
tulis angkanya di aturan itu.

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
