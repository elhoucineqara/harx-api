#!/bin/bash

echo "🚀 HARX2 Backend Server - Startup Script"
echo "========================================"
echo ""

if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "📝 Please create a .env file based on .env.example"
    echo ""
    echo "Quick start:"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your configuration"
    echo ""
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting server..."
    npm start
else
    echo ""
    echo "⚠️  Build completed with warnings"
    echo "💡 The server may still run, but some features might not work correctly"
    echo ""
    read -p "Do you want to start the server anyway? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Starting server..."
        npm start
    else
        echo "❌ Startup cancelled"
        exit 1
    fi
fi
