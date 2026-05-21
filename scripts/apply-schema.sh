#!/bin/bash

# Apply Schema to Supabase Database
# Usage: ./scripts/apply-schema.sh

echo "🔗 Connecting to Supabase database..."
echo "📋 Applying schema from database/schema.sql"

# Apply schema using connection string from .env
psql "$DATABASE_URL" -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema applied successfully!"
else
    echo "❌ Failed to apply schema"
    exit 1
fi

echo "🎉 Database setup complete!"
