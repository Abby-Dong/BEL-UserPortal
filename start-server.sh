#!/bin/bash

# BEL Platform Local Development Server
# This script starts a simple HTTP server to serve the BEL Platform files

echo "🚀 Starting BEL Platform Development Server..."
echo "📂 Serving files from: $(pwd)"
echo "🌐 Server will be available at: http://localhost:8000"
echo ""
echo "📝 Available pages:"
echo "   • Dashboard: http://localhost:8000/index.html"
echo "   • My Account: http://localhost:8000/my-account.html"
echo "   • Earnings & Orders: http://localhost:8000/earnings-orders.html"
echo "   • Resource Center: http://localhost:8000/resource-center.html"
echo "   • Support & FAQ: http://localhost:8000/support-faq.html"
echo "   • Terms & Conditions: http://localhost:8000/terms.html"
echo ""
echo "⚠️  Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Error: Python is not installed or not found in PATH"
    echo "   Please install Python to run the development server"
    exit 1
fi
