#!/bin/bash
set -e

echo "Running post-install setup..."

# Only run migrations if DATABASE_URL is set (i.e., on Vercel)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL found, running migrations..."
  npx prisma migrate deploy
  echo "Migrations completed successfully"
  
  echo "Seeding blog posts..."
  node scripts/seed-blog.js
  echo "Blog seeding completed"
else
  echo "DATABASE_URL not set, skipping migrations and seeding"
fi
