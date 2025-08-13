#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "Necesitas Node y npm instalados."; exit 1
fi

echo "Instalando dependencias..."
npm init -y >/dev/null 2>&1 || true

npm i next@14 react react-dom   @tanstack/react-query   zod react-hook-form @hookform/resolvers   framer-motion   sonner   next-themes   lucide-react   @supabase/supabase-js   recharts

npm i -D typescript @types/react @types/node   tailwindcss postcss autoprefixer   eslint @types/react-dom

# Tailwind init
npx tailwindcss init -p

# Ajustar tailwind.config.js a TS
rm -f tailwind.config.js
cat > tailwind.config.ts <<'EOF'
import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
    },
  },
  plugins: [],
} satisfies Config
EOF

# Eslint basic
cat > .eslintrc.json <<'EOF'
{
  "extends": ["next/core-web-vitals"]
}
EOF

echo "Listo. Ahora copia .env.example a .env.local y corre: npm run dev"
chmod +x install.sh
