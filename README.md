# Disiplin Sekolah – Single Link (Tanpa Login)

Tujuan: rekod semua **kesalahan disiplin ringan** dan **mengenalpasti pelajar kerap melanggar**. Berfungsi **offline**, tiada login, satu pautan dikongsi kepada semua guru.

## Fail Utama
- `index.html` — Borang rekod + senarai belum hantar + butang Sync.
- `report.html` — Laporan ringkas (kekerapan kesalahan per pelajar).
- `config.js` — **Letak URL Apps Script** di sini.
- `Code.gs` — Kod Google Apps Script (API untuk tulis/rumus data di Google Sheet).

## Cara Guna (Ringkas)
1. **Host fail** (GitHub Pages / Netlify / mana-mana static hosting).
2. **Google Sheet & Apps Script**
   - Cipta Google Sheet kosong.
   - Buka **Extensions → Apps Script**.
   - Tampal kandungan `Code.gs` ke projek skrip.
   - EDIT pembolehubah `SHEET_ID` (ambil dari URL sheet) & `NAMA_SHEET` jika mahu.
   - Deploy: **Deploy → New deployment → Web app**, *Execute as: Me*, *Who has access: Anyone*.
   - Salin URL web app (yang tamat dengan `/exec`). Tampal ke `config.js` sebagai `APPS_SCRIPT_ENDPOINT`.
3. **Cuba Hantar Rekod**
   - Buka `index.html`, isi borang, klik **Simpan ke Senarai** (boleh offline).
   - Klik **Hantar & Sync** bila ada internet.
4. **Laporan**
   - Buka `report.html`. Papar kekerapan kesalahan pelajar. Boleh tapis cepat.

## Nota
- Imej dikecilkan automatik sebelum dihantar (jimat data).
- Jika mahu **hadkan capaian** (contoh, hanya akaun domain sekolah), ubah tetapan *Who has access* semasa deploy Apps Script.
- Tiada login: pastikan pautan disalur kepada guru yang dibenarkan sahaja.

Dijana: 2025-08-19
