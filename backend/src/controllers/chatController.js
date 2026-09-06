import Groq from 'groq-sdk';

const getLocalReply = (question = '') => {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes('feed') || normalizedQuestion.includes('dosage') || normalizedQuestion.includes('how much')) {
    return '### Daily Feeding Guide\n\n- Light work: 1.5-2.0 kg per day\n- Moderate work: 2.5-3.5 kg per day\n- Heavy or performance work: 4.0-5.0 kg per day\n\nSplit the daily amount across meals and adjust with your veterinarian based on body condition.';
  }

  if (normalizedQuestion.includes('ingredient')) {
    return '### Ingredients\n\n- Whole grains\n- Essential amino acids\n- Cold-pressed oils\n- Natural digestive enzymes\n- Trace minerals\n\nFor a horse with a specific condition, consult a veterinarian before changing its diet.';
  }

  if (normalizedQuestion.includes('horse') || normalizedQuestion.includes('working')) {
    return '### Working Horse Initiative\n\nASHVA supports nutrition, rescue, medical care, and community distribution for working horses. You can also use the Working Horses Initiative page to donate or apply as a volunteer.';
  }

  return 'I can help with feeding amounts, ingredients, digestive support, hoof health, and working-horse nutrition. What would you like to know?';
};

export const chat = async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const latestQuestion = messages.filter((message) => message.role === 'user').pop()?.content || '';

  if (!process.env.GROQ_API_KEY) {
    return res.json({ success: true, reply: getLocalReply(latestQuestion), source: 'local' });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: 'You are ASHVA Wellness equine nutrition support. Give concise, practical answers. Do not diagnose medical conditions. Recommend a veterinarian for health concerns.',
        },
        ...messages.slice(-10),
      ],
    });

    return res.json({
      success: true,
      reply: completion.choices[0]?.message?.content || getLocalReply(latestQuestion),
      source: 'groq',
    });
  } catch (error) {
    console.error(`Chat provider error: ${error.message}`);
    return res.json({ success: true, reply: getLocalReply(latestQuestion), source: 'local-fallback' });
  }
};