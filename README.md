# 🤖 Bot WhatsApp Stiker v2

Bot WhatsApp untuk mengkonversi gambar menjadi stiker dengan nama & author custom.

---

## ✅ Fitur

| Perintah | Fungsi |
|----------|--------|
| `.s` | Konversi gambar jadi stiker (nama & author default) |
| `.stiker Nama\|Author` | Konversi gambar jadi stiker dengan nama & author custom |
| `.help` / `.menu` | Tampilkan panduan penggunaan |

---

## 📦 Persyaratan

- **Node.js** v18 atau lebih baru → [nodejs.org](https://nodejs.org)
- **VS Code** (rekomendasi editor) → [code.visualstudio.com](https://code.visualstudio.com)

---

## 🚀 Cara Menjalankan

### 1. Buka folder di VS Code

Buka VS Code → **File** → **Open Folder** → pilih folder ini

### 2. Buka Terminal

Tekan **Ctrl + `** (backtick) di VS Code

### 3. Install dependensi

```bash
npm install
```

### 4. Jalankan bot

```bash
npm start
```

### 5. Scan QR Code

QR code muncul di terminal → buka WhatsApp → **Perangkat Tertaut** → **Tautkan Perangkat** → scan

---

## 📱 Cara Pakai

### Cara 1 — Gambar + caption perintah
Kirim gambar dengan caption salah satu perintah berikut:
- `.s`
- `.stiker NamaStiker|NamaAuthor`

### Cara 2 — Reply gambar
Reply pesan gambar dengan perintah `.s` atau `.stiker Nama|Author`

### Contoh perintah `.stiker`

```
.stiker Kucingku|BotKu         → nama: Kucingku, author: BotKu
.stiker |BotKu                 → nama: default, author: BotKu
.stiker Kucingku|              → nama: Kucingku, author: default
.stiker                        → nama & author default
```

---

## ⚙️ Konfigurasi Default

Ubah nama & author default di bagian atas `index.js`:

```js
const DEFAULT_STICKER_NAME   = '✨ Stiker';   // ganti sesuai keinginan
const DEFAULT_STICKER_AUTHOR = 'StikerBot';  // ganti sesuai keinginan
```

---

## 📁 Struktur File

```
whatsapp-sticker-bot/
├── index.js          ← File utama bot
├── package.json      ← Dependensi
├── README.md         ← Dokumentasi ini
└── .wwebjs_auth/     ← Sesi WhatsApp (otomatis dibuat)
```

---

## ⚠️ Catatan

- Jangan hapus folder `.wwebjs_auth/` agar tidak perlu scan QR ulang
- Gunakan **nomor WhatsApp khusus** (bukan nomor utama) untuk bot
- Bot menggunakan `whatsapp-web.js` yang bersifat tidak resmi

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Error `sharp` | Jalankan `npm rebuild sharp` |
| QR tidak muncul | Restart terminal & jalankan ulang |
| Bot tidak merespons | Cek koneksi internet |
| Error Chromium | Install: `apt-get install chromium-browser` (Linux) |
