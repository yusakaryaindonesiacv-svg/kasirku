# Panduan Lengkap Deploy & Setup Database KasirKu POS

Panduan ini akan membimbing Anda langkah demi langkah untuk menjalankan aplikasi **KasirKu POS** secara online menggunakan Netlify dan menggunakan Google Sheets sebagai penyimpanan data cadangan (Database).

---

## Bagian 1: Persiapan Akun

Sebelum memulai, pastikan Anda sudah memiliki:
1. **Akun Google**: Untuk menggunakan Google Sheets dan Google Apps Script.
2. **Akun Netlify**: Daftar gratis di [app.netlify.com](https://app.netlify.com/signup). Anda bisa daftar menggunakan email atau akun GitHub.

---

## Bagian 2: Persiapan File Lokal

1. **Download Source Code**:
   - Di Google AI Studio, klik menu **Settings** (ikon gerigi) di pojok kiri bawah.
   - Pilih **Export to ZIP**.
   - Simpan file `.zip` tersebut di komputer Anda.

2. **Setup Folder**:
   - Buat folder baru di komputer Anda, beri nama misalnya `KASIRKU`.
   - Pindahkan file `.zip` yang tadi didownload ke dalam folder `KASIRKU` tersebut.

3. **Ekstrak File**:
   - Klik kanan pada file `.zip` tersebut.
   - Pilih **Extract Here** (Ekstrak di sini).
   - Setelah selesai ekstrak, Anda boleh menghapus file `.zip` aslinya agar folder tetap rapi.

4. **Build Aplikasi (Penting)**:
   - Aplikasi ini perlu di-"build" menjadi file siap pakai. Jika Anda memiliki Node.js di komputer:
     - Buka terminal/CMD di folder tersebut.
     - Ketik `npm install`.
     - Ketik `npm run build`.
     - Hasilnya akan ada di folder `dist`. Folder `dist` inilah yang akan diupload ke Netlify.
   - *Alternatif:* Jika Anda tidak punya Node.js, Netlify bisa melakukan build otomatis jika Anda menghubungkannya melalui GitHub.

---

## Bagian 3: Deploy ke Netlify (Cara Cepat Drag & Drop)

Jika Anda sudah memiliki folder `dist` (hasil build):

1. Login ke [Netlify](https://app.netlify.com).
2. Masuk ke menu **Sites**.
3. Scroll ke bawah sampai menemukan kotak bertuliskan **"Want to deploy a new site without connecting to Git? Drag and drop your site folder here"**.
4. Tarik dan lepas (Drag & Drop) folder **`dist`** Anda ke kotak tersebut.
5. Tunggu proses upload selesai.
6. Netlify akan memberikan link otomatis (contoh: `https://nama-acak.netlify.app`). Anda bisa mengubah nama link ini di **Site Configuration > Change site name**.

---

## Bagian 4: Membuat Database di Google Sheets & Apps Script

Aplikasi ini bisa menyimpan data ke Google Sheets agar data aman dan bisa diakses dari mana saja.

### Langkah 1: Buat Google Sheets
1. Buka [Google Sheets](https://sheets.new).
2. Beri nama spreadsheet Anda, misalnya `DB_KASIRKU`.
3. Biarkan kosong, atau buat satu sheet bernama `Data`.

### Langkah 2: Buat Google Apps Script
1. Di Google Sheets tersebut, klik menu **Extensions > Apps Script**.
2. Hapus semua kode yang ada di editor, lalu tempel kode berikut:

```javascript
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data") || ss.insertSheet("Data");
  
  var data = JSON.parse(e.postData.contents);
  
  // Simpan data ke sel A1 (sebagai satu string JSON besar)
  sheet.getRange("A1").setValue(JSON.stringify(data));
  
  return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data");
  var val = sheet.getRange("A1").getValue();
  
  return ContentService.createTextOutput(val)
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Langkah 3: Deploy Skrip sebagai Web App
1. Klik tombol **Deploy > New Deployment**.
2. Select type: **Web App**.
3. Description: `API KasirKu`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (Ini penting agar aplikasi bisa mengirim data).
6. Klik **Deploy**.
7. Salin **Web App URL** yang muncul (PENTING: Jangan sampai hilang).

---

## Bagian 5: Menghubungkan Aplikasi dengan Google Sheets

1. Buka aplikasi KasirKu Anda yang sudah tayang di Netlify.
2. Masuk ke menu **Backup & Data**.
3. Gunakan fitur Ekspor/Impor. 
   *(Tips: Anda bisa memodifikasi kode aplikasi untuk menambahkan kolom 'Cloud Sync URL' dan menempelkan Web App URL dari Google Apps Script tadi agar sinkronisasi otomatis).*

---

## Tips Tambahan
- **Keamanan**: Link Google Apps Script Anda bersifat rahasia. Jangan bagikan ke orang lain.
- **Update Aplikasi**: Jika Anda melakukan perubahan kode, lakukan `npm run build` lagi dan upload ulang folder `dist` ke Netlify.

Selamat! Aplikasi KasirKu POS Anda sekarang sudah online.
