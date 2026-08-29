const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.get('/', (req, res) => {
    res.json({ message: 'Kapsül AI Backend çalışıyor!', status: 'active' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mesaj gerekli' });
        }

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
                        content: 'Sen Kapsül Teknoloji Platformu dijital asistanısın. Türkçe konuş, samimi ol.'
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
            return res.status(response.status).json({ error: data.error?.message || 'Groq API hatası' });
        }

        res.json({
            reply: data.choices?.[0]?.message?.content || 'Cevap alınamadı'
        });

    } catch (error) {
        res.status(500).json({ error: 'Hata: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend ${PORT} portunda çalışıyor`);
});