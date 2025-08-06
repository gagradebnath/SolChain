@echo off
echo ===============================================
echo          SolChain Platform Launcher
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo 📥 Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    echo 📥 Download from: https://python.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Create necessary directories
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "database" mkdir database
if not exist "backend\database" mkdir backend\database
if not exist "ai-services\database" mkdir ai-services\database
if not exist "smart-contracts\deployments" mkdir smart-contracts\deployments

echo 📋 Setting up environment files...

REM Copy environment files if they don't exist
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo ✅ Created backend\.env from template
    )
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo ✅ Created frontend\.env from template
    )
)

if not exist "smart-contracts\.env" (
    if exist "smart-contracts\.env.example" (
        copy "smart-contracts\.env.example" "smart-contracts\.env" >nul
        echo ✅ Created smart-contracts\.env from template
    )
)

if not exist "ai-services\.env" (
    if exist "ai-services\.env.example" (
        copy "ai-services\.env.example" "ai-services\.env" >nul
        echo ✅ Created ai-services\.env from template
    )
)

echo.
echo 📦 Installing dependencies...
echo.

REM Install root dependencies
if exist "package.json" (
    echo Installing root dependencies...
    call npm install
)

REM Install smart contracts dependencies
if exist "smart-contracts\package.json" (
    echo Installing smart contracts dependencies...
    cd smart-contracts
    call npm install
    cd ..
)

REM Install backend dependencies
if exist "backend\package.json" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Install frontend dependencies
if exist "frontend\package.json" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Install AI services dependencies
if exist "ai-services\requirements.txt" (
    echo Installing AI services dependencies...
    cd ai-services
    pip install -r requirements.txt
    cd ..
)

echo.
echo 🚀 Starting SolChain Platform...
echo.
echo 📍 Services will be available at:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - AI Services: http://localhost:8000
echo    - Blockchain: http://localhost:8545
echo.
echo 🔐 Make sure MetaMask is configured for localhost:8545
echo 💡 Press Ctrl+C to stop all services
echo.

REM Start all services
call npm run dev

echo.
echo 👋 SolChain Platform stopped
pause
