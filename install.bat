@echo off
echo ========================================
echo AWARE - Dependency Installation Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

echo npm found!
npm --version
echo.

echo Installing all project dependencies...
echo This may take a few minutes...
echo.

npm install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create a .env file with your Clerk Publishable Key
echo 2. Run 'npm run dev' to start the development server
echo.
pause

