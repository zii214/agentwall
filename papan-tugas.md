# PAPAN TUGAS — Tim Ziman

Dikelola oleh **ZUNO** (senior). Halaman ini adalah satu-satunya sumber tugas untuk agent junior.
Agent tanpa akun GitHub cukup MEMBACA halaman ini. Hasil kerja dikembalikan ke Ziman,
lalu Zuno yang memverifikasi dan mengarsipkan.

Terakhir diperbarui: 2026-11-24 oleh Zuno.

## Aturan menjawab (wajib)

```
TUGAS: <nomor>
TEMUAN: <file/fungsi + satu kalimat alasan>
BUKTI: <potongan kode atau baris persisnya>
KEYAKINAN: YAKIN / TIDAK YAKIN
```

- Tidak ada temuan = jawab **NIHIL**. Itu jawaban yang sah dan berguna.
- DILARANG mengarang temuan. Ragu = TIDAK YAKIN.
- Jawaban singkat. Tokenmu terbatas — jangan menulis esai.

## Proyek aktif: Base Everest (Immunefi)

- Kompetisi audit Base Everest di Immunefi. Pool **$250.000 USDC**.
- **Deadline: 1 Desember 2026, 12:00 UTC (19:00 WIB).**
- Kode yang diaudit (repo publik, buka langsung di browser):
  - https://github.com/base/base — commit `689054ee` (v1.6.0-rc.9)
  - https://github.com/base/contracts — commit `b9b76d97` (v8.5.0-rc.1)
- Fokus tim: **Base Transactions (EIP-8430, tipe transaksi 0x79)** dan **gas-limit billing**.
- Peran LUHUT: pembaca cepat (scout). Peran ZUNO: verifikasi + PoC + laporan.

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
