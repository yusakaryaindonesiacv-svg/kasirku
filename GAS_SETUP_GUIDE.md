# Panduan Setup Google Apps Script Backend

Anda dapat memindahkan database aplikasi ini ke Google Sheets agar bisa diakses secara online dan kolaboratif.

## 1. Persiapan Google Sheet
1. Buka [Google Sheets](https://sheets.new).
2. Beri nama file, misal: "Database Kasir POS".
3. Klik menu **Extensions** > **Apps Script**.

## 2. Setup Kode (code.gs)
Hapus semua kode yang ada di editor Apps Script, lalu salin dan tempel isi dari file `code.gs` yang ada di aplikasi ini.

## 3. Deployment
1. Di halaman Apps Script, klik tombol **Deploy** biru di pojok kanan atas.
2. Pilih **New Deployment**.
3. Klik ikon Gear (Select type) dan pilih **Web App**.
4. Isi deskripsi: "POS Backend v1".
5. **Execute as**: Pilih **Me** (akun Google anda).
6. **Who has access**: Pilih **Anyone**. (Ini wajib agar aplikasi bisa terhubung).
7. Klik **Deploy**. Jika diminta otorisasi, berikan izin ke akun anda sendiri.
8. Salin **Web App URL** yang muncul (berakhiran `/exec`).

## 4. Hubungkan ke Aplikasi
1. Buka aplikasi POS ini.
2. Pergi ke menu **Pengaturan**.
3. Cari kolom **Google Apps Script URL**.
4. Tempel URL yang sudah anda salin tadi.
5. Klik **Simpan Pengaturan**.
6. Refresh halaman aplikasi. Sekarang aplikasi anda sudah menggunakan Google Sheets sebagai database utamanya!

## Keuntungan Menggunakan GAS:
- **Online**: Data bisa diakses dari mana saja.
- **Gratis**: Tidak ada biaya server.
- **Backup Otomatis**: Google Sheets memiliki fitur version history.
- **Transparan**: Anda bisa melihat data mentah di sheet bernama "DATABASE".
