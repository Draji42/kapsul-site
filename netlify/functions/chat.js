// netlify/functions/chat.js
exports.handler = async (event) => {
    // Sadece POST isteklerini kabul et
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // İstekten gelen mesajı al
        const { message } = JSON.parse(event.body);
        
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Mesaj gerekli' })
            };
        }

        // Environment variable'dan API anahtarını al
        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
            console.error('GROQ_API_KEY environment variable tanımlanmamış!');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'API anahtarı bulunamadı. Lütfen Netlify dashboard\'da GROQ_API_KEY değişkenini tanımlayın.' 
                })
            };
        }

        // Groq API'ye istek gönder
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
            return {
                statusCode: response.status,
                body: JSON.stringify({ 
                    error: data.error?.message || 'Groq API hatası oluştu' 
                })
            };
        }

        // Cevabı döndür
        return {
            statusCode: 200,
            body: JSON.stringify({
                reply: data.choices?.[0]?.message?.content || 'Üzgünüm, cevap alamadım.'
            })
        };

    } catch (error) {
        console.error('Fonksiyon hatası:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Bir hata oluştu: ' + error.message 
            })
        };
    }
};