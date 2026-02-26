#!/usr/bin/env bash
# Lance le backend OptiVie puis l'app mobile Expo.
# Si le port 3001 est déjà utilisé, le backend est considéré comme lancé.
# Ctrl+C arrête le backend si c'est ce script qui l'a démarré.

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""

# Sur macOS, Metro peut crasher avec "EMFILE: too many open files". Watchman le corrige.
if ! command -v watchman >/dev/null 2>&1; then
  echo "💡 Sans Watchman, en cas d'erreur 'too many open files', lancez d'abord dans ce terminal :"
  echo "   ulimit -n 65536"
  echo "   Puis : ./start-all.sh"
  echo ""
  echo "   Ou installez Watchman (une fois) : brew install watchman"
  echo "   (Si brew échoue, corrigez les droits : sudo chown -R \$(whoami) /opt/homebrew)"
  echo ""
fi

# Vérifier si le port 3001 est déjà utilisé (macOS/Linux)
port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -i :3001 -sTCP:LISTEN -t >/dev/null 2>&1
  else
    return 1
  fi
}

cleanup() {
  echo ""
  if [ -n "$BACKEND_PID" ]; then
    echo "Arrêt du backend (PID $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup INT TERM

if port_in_use; then
  echo "🌿 Le backend tourne déjà sur le port 3001."
else
  echo "🌿 Démarrage du backend..."
  cd "$ROOT/backend"
  node server.js &
  BACKEND_PID=$!
  cd "$ROOT"
  sleep 2
fi

echo "📱 Démarrage de l'app mobile..."
cd "$ROOT/app_mobile"

# Vérifier la limite de fichiers (souvent trop basse sur macOS par défaut)
CURRENT=$(ulimit -n 2>/dev/null || echo "?")
HARD=$(ulimit -Hn 2>/dev/null || echo "?")
if [ "$CURRENT" != "?" ] && [ "$HARD" != "?" ] && [ "$CURRENT" -lt 2048 ] 2>/dev/null; then
  echo "⚠️  Limite de fichiers trop basse (actuel: $CURRENT, max: $HARD)."
  echo "   Une fois (par session ou après redémarrage), exécutez dans un terminal :"
  echo "   sudo launchctl limit maxfiles 65536 65536"
  echo "   Puis dans CE terminal : ulimit -n 65536 && ./start-all.sh"
  echo ""
fi

# Mode polling pour réduire les descripteurs (si Metro le supporte)
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true
exec npx expo start
