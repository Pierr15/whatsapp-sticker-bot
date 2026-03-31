const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode  = require('qrcode');
const sharp   = require('sharp');
const http    = require('http');
const axios   = require('axios'); // Tambahkan axios untuk API Brat

// ── Default stiker info ────────────────────────────────────────────────────────
const DEFAULT_STICKER_NAME   = '✨ Stiker';
const DEFAULT_STICKER_AUTHOR = 'Bot Wangsaf';

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
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36' // Tambahkan ini
        ],
    }
});

client.on('qr', (qr) => {
    latestQR = qr;
    console.log('\n📱 QR tersedia! Buka http://localhost:3000 di browser kamu\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    latestQR = null; 
    console.log('\n✅ Bot WhatsApp Stiker siap digunakan!');
    console.log('📌 Perintah: .s | .st | .brat | .help\n');
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
        const command = body.split(' ')[0].toLowerCase();
        const args = body.slice(command.length).trim();

        if (['.help', '.menu'].includes(command)) {
            await sendHelp(msg); return;
        }

        if (command === '.s') {
            await handleSticker(msg, DEFAULT_STICKER_NAME, DEFAULT_STICKER_AUTHOR); return;
        }

        if (command === '.st') {
            await handleStickerText(msg, args); return;
        }

        if (command === '.brat') {
            await handleBrat(msg, args); return;
        }

        if (command.startsWith('.stiker')) {
            const cmdArgs = body.slice(7).trim();
            const parts  = cmdArgs.split('|');
            const name   = (parts[0] ?? '').trim() || DEFAULT_STICKER_NAME;
            const author = (parts[1] ?? '').trim() || DEFAULT_STICKER_AUTHOR;
            await handleSticker(msg, name, author); return;
        }

    } catch (err) {
        console.error('❌ Error memproses pesan:', err.message);
    }
});

// ═════════════════════════════════════════════════════════════════════════════
//  HANDLER: STIKER BIASA (.s)
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
        await msg.reply('⚠️ *Kirim/Reply gambar* pake perintah *.s*');
        return;
    }

    try {
        await msg.reply('⏳ Sabar, lagi bikin nih...');
        const media = await mediaMsg.downloadMedia();
        const inputBuffer = Buffer.from(media.data, 'base64');
        
        const outputBuffer = await sharp(inputBuffer)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 80 })
            .toBuffer();

        const stickerMedia = new MessageMedia('image/webp', outputBuffer.toString('base64'), 'sticker.webp');
        await client.sendMessage(msg.from, stickerMedia, {
            sendMediaAsSticker: true,
            stickerName,
            stickerAuthor,
        });
    } catch (err) {
        await msg.reply('❌ Gagal bikin stiker');
    }
}

// ═════════════════════════════════════════════════════════════════════════════
//  HANDLER: STIKER TEXT (.st)
// ═════════════════════════════════════════════════════════════════════════════

async function handleStickerText(msg, text) {
    let mediaMsg = null;
    if (msg.hasMedia && msg.type === 'image') mediaMsg = msg;
    else if (msg.hasQuotedMsg) {
        const quoted = await msg.getQuotedMessage();
        if (quoted.hasMedia && quoted.type === 'image') mediaMsg = quoted;
    }

    if (!mediaMsg || !text) {
        await msg.reply('⚠️ Pake format: Kirim/Reply gambar pake caption *.st teks lu*');
        return;
    }

    try {
        await msg.reply('⏳ Lagi nambahin teks...');
        const media = await mediaMsg.downloadMedia();
        const inputBuffer = Buffer.from(media.data, 'base64');

        // Membuat overlay teks menggunakan SVG
        const svgText = `
            <svg width="512" height="512">
                <style>
                    .title { fill: white; font-size: 50px; font-weight: bold; font-family: sans-serif; filter: drop-shadow(3px 3px 2px rgba(0,0,0,0.8)); }
                </style>
                <text x="50%" y="90%" text-anchor="middle" class="title">${text}</text>
            </svg>`;

        const outputBuffer = await sharp(inputBuffer)
            .resize(512, 512, { fit: 'cover' })
            .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
            .webp({ quality: 80 })
            .toBuffer();

        const stickerMedia = new MessageMedia('image/webp', outputBuffer.toString('base64'), 'sticker.webp');
        await client.sendMessage(msg.from, stickerMedia, { sendMediaAsSticker: true });
    } catch (err) {
        await msg.reply('❌ Gagal memproses stiker teks');
    }
}

// ═════════════════════════════════════════════════════════════════════════════
//  HANDLER: BRAT (.brat)
// ═════════════════════════════════════════════════════════════════════════════

async function handleBrat(msg, text) {
    if (!text) return msg.reply('⚠️ Pake format: *.brat teks kamu*');

    try {
        await msg.reply('⏳ Sabar, lagi bikin nih...');
        const apiRes = await axios.get(`https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text)}`, {
            responseType: 'arraybuffer'
        });

        const outputBuffer = await sharp(apiRes.data)
            .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .webp({ quality: 80 })
            .toBuffer();

        const stickerMedia = new MessageMedia('image/webp', outputBuffer.toString('base64'), 'sticker.webp');
        await client.sendMessage(msg.from, stickerMedia, { 
            sendMediaAsSticker: true,
            stickerName: 'Brat Sticker',
            stickerAuthor: 'Bot Wangsaf'
        });
    } catch (err) {
        await msg.reply('❌ Gagal ngambil data Brat. Coba lagi nanti.');
    }
}

// ═════════════════════════════════════════════════════════════════════════════
//  HANDLER: HELP
// ═════════════════════════════════════════════════════════════════════════════

async function sendHelp(msg) {
    const helpText =
        '╔══════════════════════════╗\n' +
        '║   🤖  *BOT STIKER WA* ║\n' +
        '╚══════════════════════════╝\n\n' +
        '📌 *LIST COMMANDS*\n' +
        '─────────────────────────\n\n' +
        '🖼️ *.s*\n' +
        '  Gambar → Stiker Biasa\n\n' +
        '✍️ *.st <teks>*\n' +
        '  Gambar + Teks → Stiker\n\n' +
        '☁️ *.brat <teks>*\n' +
        '  Teks → Stiker gaya Brat\n\n' +
        '🎨 *.stiker nama|author*\n' +
        '  Custom Nama/Author Stiker\n\n' +
        '❓ *.menu / .help*\n\n' +
        '─────────────────────────\n' +
        '💡 *CONTOH*\n' +
        '• Kirim gambar pake caption: `.st Nguwawor`';
    await msg.reply(helpText);
}

// ═════════════════════════════════════════════════════════════════════════════
//  START
// ═════════════════════════════════════════════════════════════════════════════

console.log('🚀 Memulai Bot WhatsApp Stiker...');
client.initialize();