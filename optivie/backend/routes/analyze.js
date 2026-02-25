import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, getUserPrompt, getImageAnalysisPrompt, getRecalculatePrompt, ADVICE_SYSTEM_PROMPT, getAdvicePrompt } from '../prompts/antiInflammatory.js';

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

// POST /api/analyze - Analyze a dish (text or image)
router.post('/analyze', async (req, res) => {
  try {
    const { plat, image, mimeType } = req.body;

    console.log('Analyze request received:', { 
      hasPlat: !!plat, 
      hasImage: !!image, 
      mimeType,
      imageLength: image ? image.length : 0 
    });

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
          text: getImageAnalysisPrompt()
        }
      ];
    } else {
      // Text analysis
      messageContent = getUserPrompt(plat.trim());
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
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
router.post('/recalculate', async (req, res) => {
  try {
    const { plat, ingredients } = req.body;

    console.log('Recalculate request received:', { plat, ingredients });

    if (!plat || !ingredients) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        message: 'Veuillez fournir le nom du plat et la liste des ingrédients'
      });
    }

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: getRecalculatePrompt(plat, ingredients)
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
