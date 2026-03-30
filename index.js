const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode  = require('qrcode');
const sharp   = require('sharp');
const http    = require('http');

// ── Default stiker info ────────────────────────────────────────────────────────
const DEFAULT_STICKER_NAME   = '✨ Stiker';
const DEFAULT_STICKER_AUTHOR = 'StikerBot';

// ── QR server state ───────────────────────────────────────────────────────────
let latestQR = null;

// ── HTTP server — buka http://localhost:3000 untuk scan QR ────────────────────
const server = http.createServer(async (req, res) => {
    if (req.url !== '/') { res.writeHead(404); res.end(); return; }

    if (!latestQR) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="refresh" content="3">
                <title>WhatsApp Bot — QR</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; flex-direction: column;
                           align-items: center; justify-content: center; height: 100vh;
                           margin: 0; background: #f0f2f5; }
                    .box { background: white; border-radius: 16px; padding: 40px;
                           box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
                    h2 { color: #128C7E; margin-bottom: 8px; }
                    p  { color: #666; }
                    .spinner { margin: 20px auto; width: 48px; height: 48px;
                               border: 5px solid #ddd; border-top-color: #128C7E;
                               border-radius: 50%; animation: spin 0.8s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="box">
                    <h2>🤖 WhatsApp Stiker Bot</h2>
                    <p>Menunggu QR Code dari WhatsApp...</p>
                    <div class="spinner"></div>
                    <p><small>Halaman ini refresh otomatis setiap 3 detik</small></p>
                </div>
            </body>
            </html>
        `);
        return;
    }

    // Generate QR sebagai gambar PNG (data URL)
    const qrImage = await QRCode.toDataURL(latestQR, { width: 300, margin: 2 });

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="refresh" content="30">
            <title>WhatsApp Bot — Scan QR</title>
            <style>
                body { font-family: Arial, sans-serif; display: flex; flex-direction: column;
                       align-items: center; justify-content: center; height: 100vh;
                       margin: 0; background: #f0f2f5; }
                .box { background: white; border-radius: 16px; padding: 40px;
                       box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
                h2  { color: #128C7E; margin-bottom: 4px; }
                img { margin: 20px 0; border: 4px solid #128C7E; border-radius: 12px; }
                ol  { text-align: left; color: #444; line-height: 2; }
                small { color: #999; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>🤖 WhatsApp Stiker Bot</h2>
                <p>Scan QR berikut dengan WhatsApp kamu</p>
                <img src="${qrImage}" width="280" height="280" alt="QR Code"/>
                <ol>
                    <li>Buka WhatsApp di HP</li>
                    <li>Ketuk <b>⋮ Menu → Perangkat Tertaut</b></li>
                    <li>Ketuk <b>Tautkan Perangkat</b></li>
                    <li>Arahkan kamera ke QR di atas</li>
                </ol>
                <small>QR refresh otomatis setiap 30 detik</small>
            </div>
        </body>
        </html>
    `);
});

server.listen(3000, () => {
    console.log('🌐 Buka browser dan akses: http://localhost:3000');
    console.log('📱 Scan QR Code yang tampil di browser untuk login\n');
});

// ═════════════════════════════════════════════════════════════════════════════
//  WHATSAPP CLIENT
// ═════════════════════════════════════════════════════════════════════════════

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

client.on('qr', (qr) => {
    latestQR = qr;
    // Tetap tampilkan di terminal juga (sebagai cadangan)
    console.log('\n📱 QR tersedia! Buka http://localhost:3000 di browser kamu\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    latestQR = null; // Hapus QR setelah berhasil login
    console.log('\n✅ Bot WhatsApp Stiker siap digunakan!');
    console.log('📌 Perintah: .s | .stiker nama|author | .help\n');
});

client.on('authenticated', () => console.log('🔐 Autentikasi berhasil!'));
client.on('auth_failure',  (msg) => console.error('❌ Autentikasi gagal:', msg));
client.on('disconnected',  (reason) => console.log('🔌 Bot terputus:', reason));

// ═════════════════════════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ═════════════════════════════════════════════════════════════════════════════

client.on('message', async (msg) => {
    try {
        const body = msg.body?.trim() ?? '';

        if (['.help', '.menu'].includes(body.toLowerCase())) {
            await sendHelp(msg); return;
        }

        if (body.toLowerCase() === '.s') {
            await handleSticker(msg, DEFAULT_STICKER_NAME, DEFAULT_STICKER_AUTHOR); return;
        }

        if (body.toLowerCase().startsWith('.stiker')) {
            const args   = body.slice(7).trim();
            const parts  = args.split('|');
            const name   = (parts[0] ?? '').trim() || DEFAULT_STICKER_NAME;
            const author = (parts[1] ?? '').trim() || DEFAULT_STICKER_AUTHOR;
            await handleSticker(msg, name, author); return;
        }

    } catch (err) {
        console.error('❌ Error memproses pesan:', err.message);
    }
});

// ═════════════════════════════════════════════════════════════════════════════
//  HANDLER: STIKER
// ═════════════════════════════════════════════════════════════════════════════

async function handleSticker(msg, stickerName, stickerAuthor) {
    let mediaMsg = null;

    if (msg.hasMedia && (msg.type === 'image' || msg.type === 'sticker')) {
        mediaMsg = msg;
    } else if (msg.hasQuotedMsg) {
        const quoted = await msg.getQuotedMessage();
        if (quoted.hasMedia && (quoted.type === 'image' || quoted.type === 'sticker')) {
            mediaMsg = quoted;
        }
    }

    if (!mediaMsg) {
        await msg.reply(
            '⚠️ *Gambarnya mana woy!*\n\n' +
            'Kirim gambar pake caption command, atau reply gambar pake command.'
        );
        return;
    }

    try {
        await msg.reply('⏳ Sabar, lagi bikin nih...');

        const media        = await mediaMsg.downloadMedia();
        const inputBuffer  = Buffer.from(media.data, 'base64');
        const outputBuffer = await sharp(inputBuffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer();

        const stickerMedia = new MessageMedia(
            'image/webp',
            outputBuffer.toString('base64'),
            'sticker.webp'
        );

        await msg.reply(stickerMedia, null, {
            sendMediaAsSticker: true,
            stickerName:   stickerName,
            stickerAuthor: stickerAuthor,
        });

        console.log(`✅ Stiker "${stickerName}" by "${stickerAuthor}" → ${msg.from}`);

    } catch (err) {
        console.error('❌ Gagal bikin stiker:', err.message);
        await msg.reply('❌ Gagal bikin stiker. Pastiin file pake format yang valid! (JPG/PNG/WEBP)');
    }
}

// ═════════════════════════════════════════════════════════════════════════════
//  HANDLER: HELP
// ═════════════════════════════════════════════════════════════════════════════

async function sendHelp(msg) {
    const helpText =
        '╔══════════════════════════╗\n' +
        '║   🤖  *BOT STIKER WA*    ║\n' +
        '╚══════════════════════════╝\n\n' +

        '📌 *LIST COMMAND*\n' +
        '─────────────────────────\n\n' +

        '🖼️ *.s*\n' +
        '  Ubah foto yang lo kirim jadi stiker\n' +

        '🎨 *.stiker nama pack sticker|author*\n' +
        '  Ubah foto yang lo kirim jadi stiker\n' +
        '  plus kasih watermark ke stiker lo\n\n' +

        '❓ *.menu / .help*\n' +
        '  Nampilin pesan panduan ini\n\n' +

        '─────────────────────────\n' +
        '📖 *TUTORIAL*\n\n' +

        '1️⃣  Kirim gambar + caption *.s*\n' +
        '2️⃣  Reply gambar dengan *.s*\n' +
        '3️⃣  Kirim gambar + caption\n' +
        '    _.stiker Nama Pack Stiker|Nama Author_\n\n' +

        '─────────────────────────\n' +
        '💡 *CONTOH*\n\n' +
        '• `.stiker kumpulan doksli|mas amba`\n' +
        '• `.stiker |mas gatot`  _(nama pack default)_\n' +
        '• `.stiker kumpulan timpa|`  _(author default)_\n\n' +

        '_Format: JPG · PNG · WEBP_\n\n' +

        'Author: Pierr (wa.me/6285875530175)';

    await msg.reply(helpText);
}

// ═════════════════════════════════════════════════════════════════════════════
//  START
// ═════════════════════════════════════════════════════════════════════════════

console.log('🚀 Memulai Bot WhatsApp Stiker...');
client.initialize();
