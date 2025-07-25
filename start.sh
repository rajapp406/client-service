#!/bin/bash

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the client service
# Using start:dev as per user's preference
echo "Starting client-service..."
npm run start:dev
