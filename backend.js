const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get('/', (req, res) => {
    res.json({ message: 'OK' });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'user', content: message }
                ]
            })
        });
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        res.json({ reply: reply });
    } catch (err) {
        res.json({ reply: 'Hata: ' + err.message });
    }
});

app.listen(process.env.PORT || 3000);