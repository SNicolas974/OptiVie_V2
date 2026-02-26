import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonalizedSystemPrompt, getUserPrompt, getImageAnalysisPrompt, getRecalculatePrompt, ADVICE_SYSTEM_PROMPT, getAdvicePrompt } from '../prompts/antiInflammatory.js';
import { optionalAuth } from '../middleware/auth.js';
import db from '../models/db.js';
import { updateStatsAfterScan } from './stats.js';

const router = express.Router();

// Initialize Anthropic client
const getAnthropicClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée. Ajoutez-la dans le fichier .env');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
};

// Helper to parse JSON response from Claude
const parseClaudeResponse = (text) => {
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  return JSON.parse(jsonText.trim());
};

// Helper to get user goals from database
const getUserGoals = (userId) => {
  if (!userId) return [];
  
  try {
    const rows = db.prepare(
      'SELECT goal_type FROM health_goals WHERE user_id = ? AND is_active = 1'
    ).all(userId);
    return rows.map(row => row.goal_type);
  } catch (error) {
    console.error('Error fetching user goals:', error);
    return [];
  }
};

// Helper to save analysis to history and update stats
const saveAnalysisHistory = (userId, analysisResult) => {
  if (!userId) return;
  
  try {
    db.prepare(`
      INSERT INTO analysis_history (user_id, plat, score_global, ingredients, analysis_data) 
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userId, 
      analysisResult.plat, 
      analysisResult.score_global, 
      JSON.stringify(analysisResult.ingredients),
      JSON.stringify(analysisResult)
    );

    // Mettre à jour les statistiques
    updateStatsAfterScan(userId, analysisResult.score_global, analysisResult.plat);
  } catch (error) {
    console.error('Error saving analysis history:', error);
  }
};

// POST /api/analyze - Analyze a dish (text or image)
router.post('/analyze', optionalAuth, async (req, res) => {
  try {
    const { plat, image, mimeType } = req.body;
    const userId = req.userId; // From optionalAuth middleware

    console.log('Analyze request received:', { 
      hasPlat: !!plat, 
      hasImage: !!image, 
      mimeType,
      userId: userId || 'anonymous',
      imageLength: image ? image.length : 0 
    });

    // Get user goals if authenticated
    const userGoals = getUserGoals(userId);
    console.log('User goals:', userGoals);

    // Validate input: either plat (text) or image (base64)
    const hasText = plat && typeof plat === 'string' && plat.trim().length > 0;
    const hasImage = image && mimeType;

    if (!hasText && !hasImage) {
      return res.status(400).json({
        error: 'Paramètre invalide',
        message: 'Veuillez fournir un nom de plat ou une image'
      });
    }

    const anthropic = getAnthropicClient();

    // Get personalized system prompt based on user goals
    const systemPrompt = getPersonalizedSystemPrompt(userGoals);

    let messageContent;

    if (hasImage) {
      // Image analysis with Vision API
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validMimeTypes.includes(mimeType)) {
        return res.status(400).json({
          error: 'Format invalide',
          message: 'Format d\'image non supporté. Utilisez JPG, PNG, WebP ou GIF.'
        });
      }

      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: image
          }
        },
        {
          type: 'text',
          text: getImageAnalysisPrompt(userGoals)
        }
      ];
    } else {
      // Text analysis
      messageContent = getUserPrompt(plat.trim(), userGoals);
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ]
    });

    // Extract text content from response
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('Réponse invalide de Claude');
    }

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = parseClaudeResponse(textContent.text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', textContent.text);
      throw new Error('Impossible de parser la réponse de l\'analyse');
    }

    // Save to history if user is authenticated
    saveAnalysisHistory(userId, analysisResult);

    res.json(analysisResult);

  } catch (error) {
    console.error('Analysis Error:', error);
    
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Erreur d\'authentification',
        message: 'Clé API Anthropic invalide ou expirée'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Limite atteinte',
        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
      });
    }

    res.status(500).json({
      error: 'Erreur d\'analyse',
      message: error.message || 'Une erreur est survenue lors de l\'analyse du plat'
    });
  }
});

// POST /api/recalculate - Recalculate score with modified ingredients
router.post('/recalculate', optionalAuth, async (req, res) => {
  try {
    const { plat, ingredients } = req.body;
    const userId = req.userId;

    console.log('Recalculate request received:', { plat, ingredients, userId: userId || 'anonymous' });

    if (!plat || !ingredients) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        message: 'Veuillez fournir le nom du plat et la liste des ingrédients'
      });
    }

    // Get user goals if authenticated
    const userGoals = getUserGoals(userId);

    const anthropic = getAnthropicClient();
    const systemPrompt = getPersonalizedSystemPrompt(userGoals);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: getRecalculatePrompt(plat, ingredients, userGoals)
        }
      ]
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('Réponse invalide de Claude');
    }

    let analysisResult;
    try {
      analysisResult = parseClaudeResponse(textContent.text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', textContent.text);
      throw new Error('Impossible de parser la réponse du recalcul');
    }

    // Save to history if user is authenticated
    saveAnalysisHistory(userId, analysisResult);

    res.json(analysisResult);

  } catch (error) {
    console.error('Recalculate Error:', error);
    
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Erreur d\'authentification',
        message: 'Clé API Anthropic invalide ou expirée'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Limite atteinte',
        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
      });
    }

    res.status(500).json({
      error: 'Erreur de recalcul',
      message: error.message || 'Une erreur est survenue lors du recalcul'
    });
  }
});

// GET /api/advice - Get daily advice
router.get('/advice', async (req, res) => {
  try {
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: ADVICE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: getAdvicePrompt()
        }
      ]
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('Réponse invalide de Claude');
    }

    let adviceResult;
    try {
      adviceResult = parseClaudeResponse(textContent.text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Impossible de parser les conseils');
    }

    res.json(adviceResult);

  } catch (error) {
    console.error('Advice Error:', error);
    
    // Return fallback advice on error
    res.json({
      conseils: [
        {
          titre: "Ajoutez du safran péï",
          description: "Le curcuma réunionnais est un puissant anti-inflammatoire. Ajoutez-en une cuillère à café dans vos caris pour booster leurs bienfaits.",
          ingredient_star: "Safran péï"
        },
        {
          titre: "Privilégiez les brèdes",
          description: "Les brèdes chouchou, mourong ou mafane sont riches en antioxydants. Intégrez-les régulièrement à vos repas.",
          ingredient_star: "Brèdes"
        },
        {
          titre: "Optez pour le gingembre frais",
          description: "Le gingembre possède des propriétés anti-inflammatoires reconnues. Râpez-en dans vos plats ou infusions.",
          ingredient_star: "Gingembre"
        }
      ]
    });
  }
});

export default router;
