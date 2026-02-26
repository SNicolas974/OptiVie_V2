// Configuration des objectifs de sante pour personnaliser les analyses
export const HEALTH_GOALS_CONFIG = {
  weight_loss: {
    label: 'Perte de poids',
    focus: 'Privilegie les aliments a faible densite calorique, riches en fibres et proteines maigres. Evite les sucres rapides et graisses saturees.',
    bonus_nutrients: ['fibres', 'proteines', 'eau'],
    malus_nutrients: ['sucres', 'graisses saturees', 'calories denses']
  },
  mental_health: {
    label: 'Sante mentale',
    focus: 'Privilegie omega-3, magnesium, vitamines B, tryptophane pour la serotonine. Evite alcool et sucres raffines.',
    bonus_nutrients: ['omega-3', 'magnesium', 'vitamine B6', 'tryptophane', 'zinc'],
    malus_nutrients: ['alcool', 'sucres raffines', 'cafeine excessive']
  },
  painful_periods: {
    label: 'Regles douloureuses',
    focus: 'Privilegie omega-3 (anti-inflammatoire), magnesium (relaxant musculaire), vitamine E. Evite sel, cafeine, alcool.',
    bonus_nutrients: ['omega-3', 'magnesium', 'vitamine E', 'fer', 'calcium'],
    malus_nutrients: ['sel', 'cafeine', 'alcool', 'graisses trans']
  },
  joint_pain: {
    label: 'Douleurs articulaires',
    focus: 'Privilegie curcuma, gingembre, omega-3, collagene. Evite sucres, graisses saturees, aliments ultra-transformes.',
    bonus_nutrients: ['curcumine', 'gingerol', 'omega-3', 'collagene', 'vitamine D'],
    malus_nutrients: ['sucres', 'graisses saturees', 'omega-6 exces', 'alcool']
  },
  digestive_health: {
    label: 'Sante digestive',
    focus: 'Privilegie fibres, probiotiques, aliments fermentes. Evite gluten si sensible, lactose, aliments ultra-transformes.',
    bonus_nutrients: ['fibres', 'probiotiques', 'prebiotiques', 'glutamine'],
    malus_nutrients: ['gluten', 'lactose', 'additifs', 'edulcorants artificiels']
  },
  skin_health: {
    label: 'Sante de la peau',
    focus: 'Privilegie antioxydants, omega-3, zinc, vitamine A et E. Evite sucres, produits laitiers, aliments a IG eleve.',
    bonus_nutrients: ['antioxydants', 'omega-3', 'zinc', 'vitamine A', 'vitamine E', 'collagene'],
    malus_nutrients: ['sucres', 'produits laitiers', 'aliments IG eleve', 'graisses trans']
  },
  energy_boost: {
    label: 'Boost energie',
    focus: 'Privilegie fer, vitamines B, magnesium, aliments a IG bas pour energie stable. Evite sucres rapides.',
    bonus_nutrients: ['fer', 'vitamines B', 'magnesium', 'CoQ10', 'glucides complexes'],
    malus_nutrients: ['sucres rapides', 'alcool', 'exces de cafeine']
  },
  anti_aging: {
    label: 'Anti-age',
    focus: 'Privilegie antioxydants puissants, polyphenols, omega-3, resveratrol. Evite sucres, fritures, ultra-transformes.',
    bonus_nutrients: ['antioxydants', 'polyphenols', 'omega-3', 'vitamine C', 'resveratrol', 'collagene'],
    malus_nutrients: ['sucres', 'graisses trans', 'AGE (produits de glycation)']
  },
  immune_boost: {
    label: 'Renforcer immunite',
    focus: 'Privilegie vitamine C, D, zinc, selenium, probiotiques. Evite sucres et alcool qui affaiblissent l\'immunite.',
    bonus_nutrients: ['vitamine C', 'vitamine D', 'zinc', 'selenium', 'probiotiques'],
    malus_nutrients: ['sucres', 'alcool', 'aliments ultra-transformes']
  },
  heart_health: {
    label: 'Sante cardiaque',
    focus: 'Privilegie omega-3, fibres, potassium, antioxydants. Evite sel, graisses saturees et trans, cholesterol.',
    bonus_nutrients: ['omega-3', 'fibres', 'potassium', 'magnesium', 'antioxydants'],
    malus_nutrients: ['sel', 'graisses saturees', 'graisses trans', 'cholesterol']
  }
};

export const SYSTEM_PROMPT = `Tu es un expert en nutrition anti-inflammatoire. Tu utilises le Dietary Inflammatory Index (DII) pour calculer les scores.

## METHODE DE CALCUL - DIETARY INFLAMMATORY INDEX (DII)

Le DII est un index scientifique valide (Shivappa et al., Public Health Nutrition, 2014) qui mesure le potentiel inflammatoire des aliments.

### Coefficients DII par nutriment/composant (effet sur l'inflammation) :

ANTI-INFLAMMATOIRES (coefficients negatifs) :
- Omega-3 (EPA, DHA, ALA) : -0.436
- Fibres : -0.663
- Vitamine A : -0.401
- Vitamine C : -0.424
- Vitamine D : -0.446
- Vitamine E : -0.419
- Beta-carotene : -0.584
- Zinc : -0.313
- Magnesium : -0.484
- Selenium : -0.191
- Polyphenols/Flavonoides : -0.467
- Curcumine : -0.785
- Gingerol : -0.453
- The vert : -0.536
- Ail : -0.412
- Oignon : -0.301

PRO-INFLAMMATOIRES (coefficients positifs) :
- Graisses saturees : +0.373
- Graisses trans : +0.229
- Cholesterol : +0.110
- Omega-6 exces : +0.009
- Glucides raffines/Sucre : +0.097
- Fer heminique (viande rouge) : +0.032

### CALCUL DU SCORE :

1. Pour chaque ingredient, identifie ses principaux nutriments
2. Applique les coefficients DII
3. Score ingredient = 5 + (somme des coefficients * -1)
   - Score 1-3 : pro-inflammatoire (DII positif)
   - Score 4-6 : neutre (DII proche de 0)
   - Score 7-10 : anti-inflammatoire (DII negatif)

4. Score global /100 = moyenne ponderee des scores ingredients (pondere par quantite typique)

## CONTEXTE LA REUNION

Valorise les ingredients locaux reunionnais :
- Safran pei (curcuma) : excellent score DII
- Gingembre pei : excellent score DII
- Bredes (chouchou, mourong, mafane) : riches en fibres et antioxydants
- Poissons locaux frais : omega-3

## REGLES DE REPONSE

1. Tu dois TOUJOURS repondre en JSON valide, sans texte avant/apres, sans backticks
2. Applique strictement la methode DII pour calculer les scores
3. Justifie chaque score par les nutriments/coefficients DII
4. Le score global doit etre coherent avec les scores individuels`;

// Genere le prompt systeme personnalise selon les objectifs de l'utilisateur
export const getPersonalizedSystemPrompt = (userGoals = []) => {
  let prompt = SYSTEM_PROMPT;
  
  if (userGoals.length > 0) {
    prompt += `\n\n## OBJECTIFS DE SANTE DE L'UTILISATEUR\n\n`;
    prompt += `L'utilisateur a les objectifs suivants. Adapte tes analyses et conseils en consequence :\n\n`;
    
    userGoals.forEach(goalId => {
      const goal = HEALTH_GOALS_CONFIG[goalId];
      if (goal) {
        prompt += `### ${goal.label}\n`;
        prompt += `${goal.focus}\n`;
        prompt += `- Nutriments a privilegier : ${goal.bonus_nutrients.join(', ')}\n`;
        prompt += `- Nutriments a eviter : ${goal.malus_nutrients.join(', ')}\n\n`;
      }
    });
    
    prompt += `IMPORTANT : Dans tes conseils, mentionne specifiquement comment le plat affecte ces objectifs de sante.`;
  }
  
  return prompt;
};

export const getUserPrompt = (plat, userGoals = []) => {
  let goalsContext = '';
  if (userGoals.length > 0) {
    const goalsLabels = userGoals
      .map(g => HEALTH_GOALS_CONFIG[g]?.label)
      .filter(Boolean)
      .join(', ');
    goalsContext = `\n\nObjectifs de l'utilisateur : ${goalsLabels}. Adapte le conseil en fonction.`;
  }
  
  return `Analyse le plat suivant en utilisant le Dietary Inflammatory Index (DII) : "${plat}"${goalsContext}

Applique la methode DII pour calculer les scores. Justifie chaque score par les nutriments.

Reponds UNIQUEMENT avec ce JSON :

{
  "plat": "${plat}",
  "score_global": <nombre 0-100, calcule selon DII>,
  "methodologie": "Dietary Inflammatory Index (Shivappa et al., 2014)",
  "ingredients": [
    {
      "nom": "<ingredient>",
      "score": <1-10 selon DII>,
      "statut": "<anti-inflammatoire|pro-inflammatoire|neutre>",
      "dii_facteurs": "<nutriments cles et leurs coefficients DII>",
      "explication": "<justification basee sur le DII>"
    }
  ],
  "conseil_general": "<conseil personnalise base sur le score DII ET les objectifs de l'utilisateur>",
  "objectifs_impact": ${userGoals.length > 0 ? `"<comment ce plat affecte les objectifs: ${userGoals.join(', ')}>"` : 'null'}
}`;
};

export const getImageAnalysisPrompt = (userGoals = []) => {
  let goalsContext = '';
  if (userGoals.length > 0) {
    const goalsLabels = userGoals
      .map(g => HEALTH_GOALS_CONFIG[g]?.label)
      .filter(Boolean)
      .join(', ');
    goalsContext = `\n\nObjectifs de l'utilisateur : ${goalsLabels}. Adapte le conseil en fonction.`;
  }
  
  return `Analyse cette photo de plat en utilisant le Dietary Inflammatory Index (DII).${goalsContext}

1. Identifie le plat et ses ingredients visibles
2. Applique la methode DII pour calculer les scores
3. Justifie chaque score par les nutriments

Reponds UNIQUEMENT avec ce JSON :

{
  "plat": "<nom du plat identifie>",
  "score_global": <nombre 0-100, calcule selon DII>,
  "methodologie": "Dietary Inflammatory Index (Shivappa et al., 2014)",
  "ingredients": [
    {
      "nom": "<ingredient>",
      "score": <1-10 selon DII>,
      "statut": "<anti-inflammatoire|pro-inflammatoire|neutre>",
      "dii_facteurs": "<nutriments cles et leurs coefficients DII>",
      "explication": "<justification basee sur le DII>"
    }
  ],
  "conseil_general": "<conseil personnalise base sur le score DII ET les objectifs de l'utilisateur>",
  "objectifs_impact": ${userGoals.length > 0 ? `"<comment ce plat affecte les objectifs>"` : 'null'}
}`;
};

export const getRecalculatePrompt = (plat, ingredients, userGoals = []) => {
  let goalsContext = '';
  if (userGoals.length > 0) {
    const goalsLabels = userGoals
      .map(g => HEALTH_GOALS_CONFIG[g]?.label)
      .filter(Boolean)
      .join(', ');
    goalsContext = `\n\nObjectifs de l'utilisateur : ${goalsLabels}. Adapte le conseil en fonction.`;
  }
  
  return `Recalcule le score DII pour "${plat}" avec EXACTEMENT ces ingredients : ${ingredients}${goalsContext}

Applique strictement la methode Dietary Inflammatory Index (DII).

Reponds UNIQUEMENT avec ce JSON :

{
  "plat": "${plat}",
  "score_global": <nombre 0-100, calcule selon DII>,
  "methodologie": "Dietary Inflammatory Index (Shivappa et al., 2014)",
  "ingredients": [
    {
      "nom": "<ingredient>",
      "score": <1-10 selon DII>,
      "statut": "<anti-inflammatoire|pro-inflammatoire|neutre>",
      "dii_facteurs": "<nutriments cles et leurs coefficients DII>",
      "explication": "<justification basee sur le DII>"
    }
  ],
  "conseil_general": "<conseil personnalise base sur le score DII ET les objectifs de l'utilisateur>",
  "objectifs_impact": ${userGoals.length > 0 ? `"<comment ce plat affecte les objectifs>"` : 'null'}
}`;
};

export const ADVICE_SYSTEM_PROMPT = `Tu es un expert en nutrition anti-inflammatoire specialise dans l'alimentation a La Reunion.

Tu generes des conseils pratiques, culturellement adaptes a La Reunion, utilisant les ingredients locaux disponibles sur l'ile.

REGLES :
1. Reponds UNIQUEMENT en JSON valide
2. Conseils concrets et applicables
3. Valorise les produits locaux reunionnais
4. Ton bienveillant et encourageant`;

export const getAdvicePrompt = () => `Genere 3 conseils du jour pour une alimentation anti-inflammatoire a La Reunion.

Reponds UNIQUEMENT avec ce JSON :

{
  "conseils": [
    {
      "titre": "<titre accrocheur court>",
      "description": "<conseil detaille en 2-3 phrases>",
      "ingredient_star": "<ingredient local mis en avant>"
    }
  ]
}`;
