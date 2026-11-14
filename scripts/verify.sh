#!/usr/bin/env bash
# scripts/verify.sh
# Ejecuta localmente las mismas verificaciones que el pipeline de CI.
# Uso: ./scripts/verify.sh
set -e

echo "🔧 [1/3] Instalando dependencias..."
npm ci

echo "🔍 [2/3] Verificación de tipos..."
npm run typecheck

echo "🧪 [3/3] Ejecutando pruebas con cobertura..."
npm test -- --coverage --ci

echo ""
echo "✅ Todo en verde. Puedes hacer push con confianza."
echo "📊 Reporte de cobertura: ./coverage/lcov-report/index.html"