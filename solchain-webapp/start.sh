#!/bin/bash

echo "==============================================="
echo "          SolChain Platform Launcher"
echo "==============================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "📥 Download from: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first."
    echo "📥 Download from: https://python.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo

# Create necessary directories
mkdir -p logs uploads database backend/database ai-services/database smart-contracts/deployments

echo "📋 Setting up environment files..."

# Copy environment files if they don't exist
if [[ ! -f "backend/.env" && -f "backend/.env.example" ]]; then
    cp "backend/.env.example" "backend/.env"
    echo "✅ Created backend/.env from template"
fi

if [[ ! -f "frontend/.env" && -f "frontend/.env.example" ]]; then
    cp "frontend/.env.example" "frontend/.env"
    echo "✅ Created frontend/.env from template"
fi

if [[ ! -f "smart-contracts/.env" && -f "smart-contracts/.env.example" ]]; then
    cp "smart-contracts/.env.example" "smart-contracts/.env"
    echo "✅ Created smart-contracts/.env from template"
fi

if [[ ! -f "ai-services/.env" && -f "ai-services/.env.example" ]]; then
    cp "ai-services/.env.example" "ai-services/.env"
    echo "✅ Created ai-services/.env from template"
fi

echo
echo "📦 Installing dependencies..."
echo

# Install root dependencies
if [[ -f "package.json" ]]; then
    echo "Installing root dependencies..."
    npm install
fi

# Install smart contracts dependencies
if [[ -f "smart-contracts/package.json" ]]; then
    echo "Installing smart contracts dependencies..."
    cd smart-contracts
    npm install
    cd ..
fi

# Install backend dependencies
if [[ -f "backend/package.json" ]]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install frontend dependencies
if [[ -f "frontend/package.json" ]]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Install AI services dependencies
if [[ -f "ai-services/requirements.txt" ]]; then
    echo "Installing AI services dependencies..."
    cd ai-services
    pip3 install -r requirements.txt
    cd ..
fi

echo
echo "🚀 Starting SolChain Platform..."
echo
echo "📍 Services will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - AI Services: http://localhost:8000"
echo "   - Blockchain: http://localhost:8545"
echo
echo "🔐 Make sure MetaMask is configured for localhost:8545"
echo "💡 Press Ctrl+C to stop all services"
echo

# Start all services
npm run dev

echo
echo "👋 SolChain Platform stopped"
