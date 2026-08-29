const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Groq API ayarları
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Ana sayfa
app.get('/', (req, res) => {
    res.json({
        message: 'Kapsül AI Backend çalışıyor!',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        api_key_configured: !!GROQ_API_KEY
    });
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mesaj gerekli' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'API anahtarı bulunamadı' });
        }

        console.log('Mesaj alındı:', message);

        // Groq API'ye istek
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [
                    {
                        role: 'system',
                        content: 'Sen Kapsül Teknoloji Platformu dijital asistanısın. Eğitimler, sertifikalar, TEKNOFEST takımları ve laboratuvarlar hakkında yardımcı oluyorsun. Türkçe konuşuyorsun, samimi ve yardımseversin. Kısa ve öz cevaplar ver.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Groq API hatası:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'Groq API hatası' 
            });
        }

        const reply = data.choices?.[0]?.message?.content || 'Cevap alınamadı';

        console.log('Cevap:', reply);

        res.json({
            reply: reply,
            model: 'openai/gpt-oss-120b',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Backend hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu: ' + error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Backend ${PORT} portunda çalışıyor`);
    console.log(`API key durumu: ${GROQ_API_KEY ? 'Tanımlı' : 'Tanımsız'}`);
});