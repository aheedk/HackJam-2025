#!/bin/bash

echo "🚀 Starting USF Events Map Backend..."
echo ""

cd backend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Starting server on http://localhost:3000"
echo "📍 Press Ctrl+C to stop"
echo ""

npm start
