import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY is missing from environment variables (.env).',
      });
    }

    // Instantiate Groq inside the handler so missing keys don't crash server initialization
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = {
      role: 'system',
      content: `You are the friendly and knowledgeable AI Assistant for Aetmaad Wellness. 
      Help users with health advice, products, appointment bookings, and volunteer opportunities. 
      Provide concise, well-formatted answers using bullet points or paragraphs where appropriate.`,
    };

    const messages = [
      systemPrompt,
      ...conversationHistory.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Groq Chat Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate response from Chatbot.' });
  }
});

export default router;