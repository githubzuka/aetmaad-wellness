import Groq from 'groq-sdk';
import Event from '../models/Event.js';

const getLocalReply = (question = '') => {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes('product') || normalizedQuestion.includes('mix') || normalizedQuestion.includes('buy') || normalizedQuestion.includes('price') || normalizedQuestion.includes('order')) {
    return '### ASHVA Nutrition Mix\n\nASHVA Equine Nutrition Mix is designed for working and active horses, with grains, amino acids, cold-pressed oils, digestive enzymes, and trace minerals. Use the Products Catalog to view the product and place an order. For exact price, availability, delivery, or order status, open the Products Catalog, Cart, or My Orders section.';
  }

  if (normalizedQuestion.includes('feed') || normalizedQuestion.includes('dosage') || normalizedQuestion.includes('how much')) {
    return '### Daily Feeding Guide\n\n- Light work: 1.5-2.0 kg per day\n- Moderate work: 2.5-3.5 kg per day\n- Heavy or performance work: 4.0-5.0 kg per day\n\nSplit the daily amount across meals and adjust with your veterinarian based on body condition.';
  }

  if (normalizedQuestion.includes('ingredient') || normalizedQuestion.includes('contain') || normalizedQuestion.includes('made')) {
    return '### Ingredients\n\n- Whole grains\n- Essential amino acids\n- Cold-pressed oils\n- Natural digestive enzymes\n- Trace minerals\n\nFor a horse with a specific condition, consult a veterinarian before changing its diet.';
  }

  if (normalizedQuestion.includes('event') || normalizedQuestion.includes('upcoming') || normalizedQuestion.includes('calendar')) {
    return '### Upcoming ASHVA Events\n\nApproved ASHVA welfare drives, community gatherings, and working-horse initiatives appear in the Upcoming Events section on the website. Event date, time, city, location, description, and host details are shown there.';
  }

  if (normalizedQuestion.includes('volunteer') || normalizedQuestion.includes('apply')) {
    return '### Volunteer Program\n\nAnyone can apply through the Volunteer section without creating a customer account. Applications are reviewed by the admin team. You will receive an alert after applying, and approved volunteers receive access to the volunteer dashboard and event notifications.';
  }

  if (normalizedQuestion.includes('donat') || normalizedQuestion.includes('impact') || normalizedQuestion.includes('rescue')) {
    return '### ASHVA Impact\n\nASHVA supports the nutrition, rescue, medical care, and community distribution of working horses. Visit the Donate or Working Horses Initiative page to learn more and contribute.';
  }

  if (normalizedQuestion.includes('digest') || normalizedQuestion.includes('gut') || normalizedQuestion.includes('stomach')) {
    return '### Digestive Support\n\nA consistent feeding routine, gradual feed changes, adequate forage, clean water, and suitable portions help support digestive health. Sudden diet changes or signs such as colic, persistent diarrhea, or loss of appetite require prompt veterinary care.';
  }

  if (normalizedQuestion.includes('hoof') || normalizedQuestion.includes('coat') || normalizedQuestion.includes('health')) {
    return '### General Horse Care\n\nBalanced nutrition supports energy, body condition, coat quality, and overall wellbeing, but it cannot replace examination or treatment. For lameness, hoof pain, injury, illness, or unusual behavior, contact a qualified veterinarian or farrier.';
  }

  if (normalizedQuestion.includes('horse') || normalizedQuestion.includes('working')) {
    return '### Working Horse Initiative\n\nASHVA supports nutrition, rescue, medical care, and community distribution for working horses. You can also use the Working Horses Initiative page to donate or apply as a volunteer.';
  }

  return 'I can help with ASHVA products, ingredients, feeding amounts, digestive support, horse care, upcoming events, volunteering, donations, orders, shops, and the working-horse initiative. Please ask a specific question and I will give the relevant details.';
};

const getComprehensiveLocalReply = (question) => {
  const normalizedQuestion = question.toLowerCase();
  const topics = ['product', 'mix', 'feed', 'ingredient', 'event', 'volunteer', 'donat', 'order', 'horse']
    .filter((topic) => normalizedQuestion.includes(topic));

  if (topics.length < 2) return getLocalReply(question);

  return [
    getLocalReply('product'),
    getLocalReply('feed'),
    getLocalReply('event'),
    getLocalReply('volunteer'),
    getLocalReply('donat'),
  ].join('\n\n');
};

export const chat = async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const latestQuestion = messages.filter((message) => message.role === 'user').pop()?.content || '';

  if (!process.env.GROQ_API_KEY) {
    return res.json({ success: true, reply: getComprehensiveLocalReply(latestQuestion), source: 'local' });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = await Event.find({ status: 'approved', date: { $gte: today } })
      .select('title description date time location city organizer volunteerHostName')
      .sort({ date: 1 })
      .limit(10)
      .lean();
    const eventContext = upcomingEvents.length
      ? JSON.stringify(upcomingEvents)
      : 'There are currently no approved upcoming events in the database.';
    const modelCandidates = [
      process.env.CHAT_MODEL,
      'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile',
      'meta-llama/llama-4-scout-17b-16e-instruct',
    ].filter(Boolean);
    let lastError;

    for (const model of [...new Set(modelCandidates)]) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.3,
          max_tokens: 900,
          messages: [
            {
              role: 'system',
              content: `You are the complete ASHVA Wellness website assistant. Answer the user's actual question with relevant details. Use only these verified facts: ASHVA Equine Nutrition Mix includes whole grains, essential amino acids, cold-pressed oils, natural digestive enzymes, and trace minerals; the site's feeding guide gives light work 1.5-2.0 kg/day, moderate work 2.5-3.5 kg/day, and heavy/performance work 4.0-5.0 kg/day; volunteers can apply without creating a customer account and admins review applications; ASHVA supports nutrition, rescue, medical care, and community distribution for working horses. Current approved events from the database are: ${eventContext}. Never invent product percentages, formulations, prices, stock, orders, event names, event dates, or medical diagnoses. If information is not available, say so and direct the user to the relevant website section. For illness, injury, colic, lameness, or treatment questions, give general safety guidance and recommend a qualified veterinarian. Use clear headings and bullet points when useful.`,
            },
            ...messages.slice(-10),
          ],
        });

        return res.json({
          success: true,
          reply: completion.choices[0]?.message?.content || getComprehensiveLocalReply(latestQuestion),
          source: 'groq',
          model,
        });
      } catch (error) {
        lastError = error;
        if (!error.message?.includes('model_not_found')) throw error;
      }
    }

    throw lastError;
  } catch (error) {
    console.error(`Chat provider error: ${error.message}`);
    return res.json({ success: true, reply: getComprehensiveLocalReply(latestQuestion), source: 'local-fallback' });
  }
};