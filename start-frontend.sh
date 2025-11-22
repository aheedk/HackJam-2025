#!/bin/bash

echo "📱 Starting USF Events Map Frontend..."
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Starting Expo development server"
echo "📲 Scan the QR code with Expo Go app"
echo "📍 Press Ctrl+C to stop"
echo ""

npx expo start
