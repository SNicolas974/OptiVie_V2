# OptiVie – Application mobile (React Native / Expo)

Application mobile **React Native** avec **Expo**, même fonctionnalités que le site web OptiVie.

## Fonctionnalités

- **Scan** : saisie du nom du plat ou prise/choix d’une photo → analyse du score anti-inflammatoire (jauge, conseil, liste d’ingrédients). Ajout/suppression d’ingrédients avec recalcul.
- **Ingrédients** : détail de chaque ingrédient (score, statut, explication) et légende des scores.
- **Navigation** : onglets en bas (Scan | Ingrédients).
- **API** : mêmes endpoints que le frontend web (`/api/analyze`, `/api/recalculate`).

## Prérequis

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) ou utilisation de `npx expo`
- Backend OptiVie démarré (voir `../backend`)

## Configuration de l’API

L’URL de l’API est définie dans `src/config.js` :

- **Simulateur iOS** : `http://localhost:3001`
- **Émulateur Android** : `http://10.0.2.2:3001`
- **Appareil physique** : remplacer par l’IP de votre machine (ex. `http://192.168.1.10:3001`)

Modifiez `API_BASE_URL` dans `src/config.js` selon votre environnement.

## Lancer l’app

```bash
cd app_mobile
npm install
npx expo start
```

Puis :

- Scanner le QR code avec **Expo Go** sur votre téléphone, ou
- Appuyer sur **i** pour le simulateur iOS, **a** pour l’émulateur Android.

## Structure

```
app_mobile/
├── App.js                 # Point d’entrée, navigation, header
├── src/
│   ├── config.js          # URL de l’API
│   ├── theme.js           # Couleurs / espacements (palette OptiVie)
│   ├── context/
│   │   └── AnalysisContext.js   # État global analysisResult
│   ├── components/
│   │   ├── Header.js
│   │   ├── Icons.js        # Icônes SVG (tabs, scan, etc.)
│   │   ├── ScoreGauge.js   # Jauge circulaire du score
│   │   └── IngredientCard.js
│   └── screens/
│       ├── ScanScreen.js   # Analyse plat (texte/image), recalcul
│       └── IngredientsScreen.js
├── app.json
├── babel.config.js
└── package.json
```

Le **backend** est partagé avec le site web (dossier `../backend`).
