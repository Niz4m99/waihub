const Groq = require('groq-sdk');
const Setting = require('../models/Setting'); 

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateAIResponse = async (userMessage) => {
    try {
        console.log('\n--- 🤖 MEMULAI PROSES AI ---');
        
        let systemPrompt = "Kamu adalah asisten WAIHub."; 
        
        try {
            const savedSetting = await Setting.findOne({ key: 'system_prompt' });
            
            if (savedSetting && savedSetting.value) {
                systemPrompt = savedSetting.value;
                console.log('✅ BACA DARI MONGODB BERHASIL!');
            } else if (global.AI_PROMPT) {
                systemPrompt = global.AI_PROMPT;
                console.log('⚠️ MONGODB KOSONG, BACA DARI MEMORI SERVER');
            } else {
                console.log('❌ GAGAL KEDUANYA, PAKAI DEFAULT');
            }
        } catch (dbError) {
            console.error("❌ ERROR KONEKSI DB:", dbError.message);
            if (global.AI_PROMPT) systemPrompt = global.AI_PROMPT;
        }

        console.log('📝 ISI PROMPT: "' + systemPrompt + '"');
        console.log('----------------------------\n');

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            // GUNAKAN MODEL TERBARU INI:
            model: 'llama-3.1-8b-instant', 
            temperature: 0.7,
            max_tokens: 1024
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('❌ Error Groq AI:', error);
        return 'Maaf, sistem AI sedang gangguan.';
    }
};

module.exports = { generateAIResponse };