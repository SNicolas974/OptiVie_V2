#!/usr/bin/env bash
# Lance l'app Expo (mode polling pour éviter EMFILE sur macOS sans Watchman).

cd "$(dirname "$0")"
ulimit -n 65536 2>/dev/null || ulimit -n 10240 2>/dev/null || true
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true
exec npx expo start
