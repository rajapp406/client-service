#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' ../.env | xargs)

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Execute the SQL file
echo "Seeding the database with sample data..."
PGPASSWORD=$(echo $DATABASE_URL | grep -oP '(?<=:)[^:]+(?=@)' | cut -d'@' -f1) \
psql -h localhost -U postgres -d educationapp -f seed.sql

echo "Database seeding completed!"
