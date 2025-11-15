#!/bin/bash

echo "========================================"
echo "AWARE - Dependency Installation Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found!"
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

echo "npm found!"
npm --version
echo ""

echo "Installing all project dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Installation failed!"
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "========================================"
echo "Installation completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Create a .env file with your Clerk Publishable Key"
echo "2. Run 'npm run dev' to start the development server"
echo ""

