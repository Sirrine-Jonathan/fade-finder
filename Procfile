web: DATABASE_URL="${DATABASE_URL:-file:./dev.db}" npx prisma db push --accept-data-loss && DATABASE_URL="${DATABASE_URL:-file:./dev.db}" npx tsx prisma/seed.ts && next start -p ${PORT:-3000}
