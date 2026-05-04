const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { generateAIResponse } = require('./aiService');
const ChatLog = require('../models/ChatLog');
const Setting = require('../models/Setting'); // <-- Import model Setting

const initializeWhatsApp = (io) => {
    console.log('🔄 Menginisialisasi mesin WhatsApp...');

    let currentStatus = 'disconnected';
    let currentPhone = '';
    let lastQR = '';

    // Deklarasikan client agar bisa diakses oleh fungsi internal
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: './.sessions' }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    io.on('connection', async (socket) => {
        console.log('🌐 Browser terhubung ke Socket.');

        // 1. Kirim Status WA Langsung
        socket.emit('wa_status', { 
            status: currentStatus, 
            phone: currentPhone || (currentStatus === 'connected' ? 'WhatsApp Active' : '') 
        });

        // 2. Ambil Riwayat untuk Dashboard (Recent)
        try {
            const recentChats = await ChatLog.find().sort({ createdAt: -1 }).limit(10);
            recentChats.reverse().forEach(chat => {
                socket.emit('chat_log', chat);
            });
        } catch (err) {
            console.error('Gagal ambil data dashboard:', err);
        }

        // 3. Listener Khusus Riwayat Lengkap (Tab History)
        socket.on('get_full_history', async () => {
            try {
                const allChats = await ChatLog.find().sort({ createdAt: -1 });
                socket.emit('full_history_data', allChats);
            } catch (err) {
                socket.emit('full_history_data', []);
            }
        });

        // 4. Listener Hapus Riwayat
        socket.on('clear_history', async () => {
            await ChatLog.deleteMany({});
            socket.emit('full_history_data', []);
        });

        // 5. Listener Logout WhatsApp
        socket.on('logout_device', async () => {
            if (currentStatus === 'connected') {
                await client.logout();
                currentStatus = 'disconnected';
                currentPhone = '';
                io.emit('wa_status', { status: 'disconnected' });
                client.destroy();
                client.initialize(); 
            }
        });

        // ==========================================
        // 6. Listener AI Settings (Permanen MongoDB)
        // ==========================================
        // Kirim pengaturan prompt saat ini ke web ketika tab Settings dibuka
        socket.on('get_prompt', () => {
            socket.emit('load_prompt', global.AI_PROMPT || ""); 
        });

        // Terima dan simpan pengaturan prompt baru dari Dashboard Web
        socket.on('update_prompt', async (newPrompt) => {
            // 1. Update ke memori (agar efek instan)
            global.AI_PROMPT = newPrompt; 
            
            // 2. Simpan permanen ke MongoDB
            // 2. Simpan permanen ke MongoDB
            try {
                await Setting.findOneAndUpdate(
                    { key: 'system_prompt' },
                    { value: newPrompt },
                    { upsert: true, returnDocument: 'after' } // <--- GANTI JADI SEPERTI INI
                );
                console.log("✏️ Prompt berhasil diperbarui dan tersimpan permanen di Database.");
            } catch (err) {
                console.error("❌ Gagal menyimpan prompt ke database:", err);
            }
        });
    });

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
        lastQR = qr; 
        currentStatus = 'disconnected';
        io.emit('qr_code', qr);
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp Client Terhubung!');
        currentStatus = 'connected';
        currentPhone = client.info.wid.user;
        lastQR = ''; 
        io.emit('wa_status', { status: currentStatus, phone: currentPhone });
    });

    client.on('message', async (msg) => {
        if (msg.from === 'status@broadcast' || msg.from.includes('@g.us')) return;

        const senderNumber = msg.from.replace('@c.us', '');
        console.log(`\n📩 Pesan masuk dari [${senderNumber}]: ${msg.body}`);

        try {
            const chat = await msg.getChat();
            await chat.sendStateTyping();

            const startTime = Date.now();
            const aiReply = await generateAIResponse(msg.body);
            const latency = ((Date.now() - startTime) / 1000).toFixed(2);

            await chat.clearState();
            await msg.reply(aiReply);
            
            const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            // SIMPAN KE MONGODB
            const newChatLog = new ChatLog({
                from: senderNumber,
                message: msg.body,
                reply: aiReply,
                latency: latency,
                time: timeNow
            });
            await newChatLog.save();

            // KIRIM LIVE UPDATE KE WEB
            io.emit('chat_log', {
                from: senderNumber,
                message: msg.body,
                reply: aiReply,
                latency: latency,
                time: timeNow
            });

        } catch (error) {
            console.error('❌ Gagal memproses pesan:', error);
        }
    });

    client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp Terputus:', reason);
        currentStatus = 'disconnected';
        currentPhone = '';
        io.emit('wa_status', { status: currentStatus });
        client.destroy();
        client.initialize(); 
    });

    client.initialize();
    return client;
};

module.exports = { initializeWhatsApp };