# OptiVie - Nutrition Anti-inflammatoire a La Reunion

Application web MVP pour analyser le potentiel anti-inflammatoire des plats reunionnais grace a l'IA Claude.

## Fonctionnalites

- **Analyse de plats** : Entrez le nom d'un plat et obtenez son score anti-inflammatoire /100
- **Plats predefinis** : 5 plats reunionnais populaires pour tester rapidement
- **Detail des ingredients** : Score individuel par ingredient avec explications
- **Substitutions** : Suggestions pour ameliorer le score de vos plats
- **Conseils adaptes** : Recommandations nutritionnelles specifiques a La Reunion
- **Aliments stars** : Decouvrez les meilleurs ingredients locaux anti-inflammatoires

## Prerequis

- **Node.js** version 18.0.0 ou superieur
- Une **cle API Anthropic** (obtenez-la sur https://console.anthropic.com)

## Installation

### 1. Cloner ou telecharger le projet

```bash
cd optivie
```

### 2. Configurer la cle API

Creez le fichier `backend/.env` :

```bash
cp backend/.env.example backend/.env
```

Editez `backend/.env` et ajoutez votre cle API :

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### 3. Installer les dependances

**Backend :**
```bash
cd backend
npm install
```

**Frontend :**
```bash
cd ../frontend
npm install
```

## Lancement

Ouvrez **deux terminaux** :

### Terminal 1 - Backend (port 3001)
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend (port 5173)
```bash
cd frontend
npm run dev
```

L'application est accessible sur **http://localhost:5173**

## Architecture

```
optivie/
├── backend/
│   ├── server.js           # Serveur Express
│   ├── routes/
│   │   └── analyze.js      # Routes API (/api/analyze, /api/advice)
│   ├── prompts/
│   │   └── antiInflammatory.js  # Prompts systeme pour Claude
│   ├── package.json
│   └── .env                # Cle API (a creer)
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Application principale avec routing
│   │   ├── main.jsx        # Point d'entree React
│   │   ├── index.css       # Styles Tailwind + animations
│   │   ├── components/
│   │   │   ├── BottomNav.jsx      # Navigation inferieure
│   │   │   ├── ScoreGauge.jsx     # Jauge circulaire animee
│   │   │   └── IngredientCard.jsx # Carte ingredient
│   │   └── pages/
│   │       ├── ScanPage.jsx       # Page d'analyse
│   │       ├── IngredientsPage.jsx # Detail ingredients
│   │       └── AdvicePage.jsx     # Conseils
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## API Backend

### POST /api/analyze

Analyse un plat et retourne son score anti-inflammatoire.

**Request :**
```json
{
  "plat": "Cari poulet"
}
```

**Response :**
```json
{
  "plat": "Cari poulet",
  "score_global": 62,
  "ingredients": [
    {
      "nom": "Curcuma (safran pei)",
      "score": 9,
      "statut": "anti-inflammatoire",
      "explication": "Puissant anti-inflammatoire naturel"
    }
  ],
  "substitutions": [
    {
      "ingredient_original": "Riz blanc",
      "suggestion": "Riz complet",
      "gain_points": 8,
      "raison": "Index glycemique plus bas"
    }
  ],
  "conseil_general": "Ce plat est equilibre..."
}
```

### GET /api/advice

Retourne 3 conseils du jour generes par l'IA.

## Stack Technique

- **Frontend** : React 18 + Vite + TailwindCSS + React Router
- **Backend** : Node.js + Express
- **IA** : API Anthropic (claude-sonnet-4-20250514)
- **Pas de base de donnees** : Tout est gere en memoire ou via l'IA

## Palette de couleurs

| Nom | Hex |
|-----|-----|
| Primary 900 | #1B4332 |
| Primary 800 | #2D6A4F |
| Primary 600 | #52B788 |
| Primary 300 | #B7E4C7 |
| Primary 100 | #F8FFF4 |

## Notes de securite

- La cle API Anthropic est stockee uniquement cote backend dans `.env`
- Le frontend ne peut pas acceder directement a l'API Anthropic
- Toutes les requetes passent par le proxy `/api`

## Depannage

### Erreur "ANTHROPIC_API_KEY non configuree"
Verifiez que le fichier `backend/.env` existe et contient votre cle.

### Erreur de connexion au backend
Assurez-vous que le backend tourne sur le port 3001.

### Build de production

```bash
cd frontend
npm run build
```

Les fichiers de production seront dans `frontend/dist/`.
