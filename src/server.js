require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 
const { initializeWhatsApp } = require('./services/waService');
const Setting = require('./models/Setting'); // <-- HARUS ADA

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

// Teks bawaan sebelum database termuat
global.AI_PROMPT = "Anda adalah asisten AI dari WAIHub. Jawablah setiap pertanyaan pelanggan dengan ramah dan profesional.";

// PENTING: Tarik pengaturan dari MongoDB saat server menyala
connectDB().then(async () => {
    try {
        const savedPrompt = await Setting.findOne({ key: 'system_prompt' });
        if (savedPrompt && savedPrompt.value) {
            global.AI_PROMPT = savedPrompt.value; // Timpa dengan data MongoDB
            console.log('✅ System Prompt berhasil dimuat dari Database.');
        }
    } catch (error) {
        console.error('❌ Gagal memuat pengaturan:', error);
    }
});

// ... (sisanya tetap sama)

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const waClient = initializeWhatsApp(io); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});