import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are the official AI Equine Specialist for Aetmaad Wellness.

RESPONSE FORMATTING RULES:
1. ALWAYS present information in structured, point-by-point markdown list format.
2. Use clear section headers and bold category labels.
3. Insert relevant emojis (🌿, 🌾, 🐴, 📋, 💚) for key headings.
4. Keep paragraphs short and easy to read.

WEBSITE KNOWLEDGE BASE:
- Product: Premium Equine Nutrition Mix (5kg & Bulk Orders).
- Key Benefits: Boosts stamina, improves digestive health, supports hoof strength, and enhances coat shine.
- Key Ingredients: Whole grains, essential amino acids, cold-pressed oils, natural digestive enzymes, and trace minerals. Zero fillers or artificial preservatives.
- Daily Feeding Guide:
  * Light Work: 1.5kg - 2.0kg / day
  * Moderate Work: 2.5kg - 3.5kg / day
  * Performance / Heavy Work: 4.0kg - 5.0kg / day
- Working Horse Initiative: A percentage of every purchase directly funds rescue, feeding, and medical care for street and working horses.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(messages || [])
      ],
      temperature: 0.4,
    });

    res.json({ reply: completion.choices[0].message });
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ error: 'Backend server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));