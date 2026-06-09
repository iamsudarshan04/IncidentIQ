const db = require('../database');
const aiService = require('../services/aiService');

exports.getStatus = (req, res) => {
  const status = aiService.getAiStatus();
  res.json(status);
};

exports.getHealth = async (req, res) => {
  try {
    const response = await aiService.generateContent('ping');
    res.json({ status: "connected", provider: response.provider });
  } catch (error) {
    console.error('[AI Health Check Error]:', error.message || error);
    res.json({ status: "failed", reason: error.message || error.toString() });
  }
};

exports.chat = async (req, res) => {
  const { message, pageContext } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const prompt = `You are the IncidentIQ AI assistant. The user is a ${req.user.role}. The user is currently viewing the ${pageContext || 'Dashboard'} page. If they ask a context-specific question (like "what is this?", "how do I use this page?"), use the current page context to give a targeted answer. Help them with their query: ${message}`;
    
    const response = await aiService.generateContent(prompt, 'chat');
    
    db.run('INSERT INTO ChatHistory (user_id, message, sender) VALUES (?, ?, ?)', [req.user.id, message, 'user']);
    db.run('INSERT INTO ChatHistory (user_id, message, sender) VALUES (?, ?, ?)', [req.user.id, response.text, 'bot']);

    res.json({ reply: response.text, provider: response.provider });
  } catch (error) {
    console.error('\n==================================================');
    console.error('EXACT AI BACKEND ERROR:');
    console.error(error.message || error);
    console.error('==================================================\n');
    
    const fallbackMessage = "I'm temporarily unable to reach the AI service.\nPlease try again in a few moments.";
    db.run('INSERT INTO ChatHistory (user_id, message, sender) VALUES (?, ?, ?)', [req.user.id, fallbackMessage, 'bot']);
    
    res.json({ reply: fallbackMessage, provider: 'None' });
  }
};
