
# Rekod Disiplin — Frontend (GitHub Pages)

Aplikasi web kecil untuk merekod salah laku pelajar terus ke Google Sheets. 
Autocomplete nama murid datang dari **Google Apps Script Web App** yang membaca senarai di helaian *SENARAI NAMA*.

## Fail dalam ZIP ini
- `index.html` — UI borang mesra telefon
- `styles.css` — gaya ringkas
- `script.js` — logik autocomplete & hantar rekod
- `README.md` — panduan ringkas

## Konfigurasi (WAJIB)
1. Dapatkan **Web App URL** dari Apps Script (menu **Deploy > Manage deployments > Web app**).
   - Access: **Anyone** (anonymous) supaya boleh dipanggil dari GitHub Pages.
2. Buka `script.js` dan **ganti** baris ini dengan URL anda:
   ```js
   const API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. (Pilihan) Tukar tajuk dan gaya ikut citarasa anda.

## Cara publish di GitHub Pages
1. Buat repo baharu, contoh `rekod-disiplin`.
2. Upload semua fail (`index.html`, `styles.css`, `script.js`, `README.md`). 
3. Pergi **Settings > Pages** > pilih `Branch: main` dan `Folder: /(root)`.
4. Simpan — GitHub akan berikan pautan, contoh: `https://username.github.io/rekod-disiplin/`

## Cara guna (untuk guru)
1. Buka pautan GitHub Pages di telefon.
2. Isi **Kelas** (contoh: `3 INOVATIF`).
3. Di medan **Nama Murid**, mula taip 2+ huruf — sistem akan cadangkan berdasarkan kelas.
4. Isi **Jenis Kesalahan** dan (jika perlu) **Catatan**.
5. Tekan **Hantar** — rekod terus disimpan ke helaian *REKOD KESALAHAN* di Google Sheets.

## Petua & Ralat biasa
- Jika autocomplete **tiada hasil**: semak ejaan kelas; huruf & spasi mesti sama dengan yang di helaian *SENARAI NAMA*.
- Jika mesej `Gagal mendapatkan senarai murid` atau `Ralat rangkaian`: 
  - Pastikan Web App **Anyone** (anonymous), bukan `Only myself`.
  - Pastikan URL di `script.js` betul (tanpa spasi).
- Anda boleh simpan nilai **kelas** dan **pengguna** — sistem akan mengingati (localStorage).

Selamat mencuba! 🎉
