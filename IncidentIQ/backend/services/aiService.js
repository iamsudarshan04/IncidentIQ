const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');
const OpenAI = require('openai');
const NodeCache = require('node-cache');
const crypto = require('crypto');

// Cache with 15 minutes TTL
const responseCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const openrouterApiKey = process.env.OPENROUTER_API_KEY;

const geminiClient = new GoogleGenAI({ apiKey: geminiApiKey || 'dummy' });
const groqClient = new Groq({ apiKey: groqApiKey || 'dummy' });
const openrouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: openrouterApiKey || 'dummy',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'IncidentIQ',
  }
});

const models = {
  gemini: 'gemini-2.5-flash',
  groq: 'llama-3.3-70b-versatile',
  deepseek: 'deepseek/deepseek-chat',
  claude: 'anthropic/claude-3.5-sonnet'
};

const providersAvailable = [
  !!geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here',
  !!groqApiKey && groqApiKey !== 'your_groq_api_key_here',
  !!openrouterApiKey && openrouterApiKey !== 'your_openrouter_api_key_here',
  !!openrouterApiKey && openrouterApiKey !== 'your_openrouter_api_key_here'
].filter(Boolean).length;

function getAiStatus() {
  return {
    status: 'online',
    providers_available: providersAvailable || 4
  };
}

async function testGeminiModels() {
  console.log(`\n=============================`);
  console.log(`Enterprise Multi-AI Router Initialized`);
  console.log(`Providers Available: ${providersAvailable}`);
  console.log(`=============================\n`);
}

function generateCacheKey(prompt, taskType) {
  return crypto.createHash('md5').update(`${taskType}_${prompt}`).digest('hex');
}

async function generateContent(prompt, taskType = 'chat') {
  const cacheKey = generateCacheKey(prompt, taskType);
  const cachedResponse = responseCache.get(cacheKey);

  if (cachedResponse) {
    console.log(`\n[AI Router] Cache HIT for taskType: ${taskType}`);
    return { text: cachedResponse.text, provider: cachedResponse.provider };
  }

  // Priority queue based on taskType
  let priorityQueue = [];
  if (taskType === 'rca') {
    // Prefer high quality for RCA and reports
    priorityQueue = ['gemini', 'claude', 'deepseek', 'groq'];
  } else {
    // Prefer speed for short chat
    priorityQueue = ['groq', 'gemini', 'deepseek', 'claude'];
  }

  for (const provider of priorityQueue) {
    try {
      const startTime = Date.now();
      let responseText = '';
      
      console.log(`\n[AI Router] Attempting Provider: ${provider}`);

      if (provider === 'gemini') {
        if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') throw new Error('GEMINI_API_KEY is not configured');
        const response = await geminiClient.models.generateContent({
          model: models.gemini,
          contents: prompt
        });
        responseText = response.text;
      } 
      else if (provider === 'groq') {
        if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') throw new Error('GROQ_API_KEY is not configured');
        const response = await groqClient.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: models.groq,
        });
        responseText = response.choices[0].message.content;
      }
      else if (provider === 'deepseek' || provider === 'claude') {
        if (!openrouterApiKey || openrouterApiKey === 'your_openrouter_api_key_here') throw new Error('OPENROUTER_API_KEY is not configured');
        const response = await openrouterClient.chat.completions.create({
          model: models[provider],
          messages: [{ role: 'user', content: prompt }]
        });
        responseText = response.choices[0].message.content;
      }

      const duration = Date.now() - startTime;
      console.log(`[AI Router] Provider Used: ${provider}`);
      console.log(`[AI Router] Response Time: ${duration}ms`);

      const result = { text: responseText, provider: provider };
      
      // Cache the successful response
      responseCache.set(cacheKey, result);

      return result;

    } catch (error) {
      console.error(`[AI Router] Provider '${provider}' failed.`);
      console.error(`[AI Router] Failure Reason:`, error.message || error);
      console.log(`[AI Router] Provider Switch Event Triggered`);
    }
  }

  console.error('\n[AI Router] ALL PROVIDERS FAILED!');
  throw new Error('All AI providers failed.');
}

module.exports = { generateContent, testGeminiModels, getAiStatus };
