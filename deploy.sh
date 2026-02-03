#!/bin/bash
# Deployment script for LinguaFormula frontend to Vercel

set -e  # Exit on error

echo "🚀 Deploying LinguaFormula frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

# Get API URL from argument or prompt
API_URL=${1:-""}

if [ -z "$API_URL" ]; then
    echo "⚠️  No API URL provided."
    echo "   Usage: ./deploy.sh https://your-heroku-app.herokuapp.com"
    echo "   Or set NEXT_PUBLIC_API_URL environment variable"
    exit 1
fi

echo "📦 Backend API URL: $API_URL"

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking Vercel project..."
    vercel link
else
    echo "✅ Vercel project already linked"
fi

# Set environment variable
echo "🔑 Setting NEXT_PUBLIC_API_URL..."
vercel env add NEXT_PUBLIC_API_URL production <<< "$API_URL" || vercel env rm NEXT_PUBLIC_API_URL production --yes && vercel env add NEXT_PUBLIC_API_URL production <<< "$API_URL"
vercel env add NEXT_PUBLIC_API_URL preview <<< "$API_URL" || vercel env rm NEXT_PUBLIC_API_URL preview --yes && vercel env add NEXT_PUBLIC_API_URL preview <<< "$API_URL"
vercel env add NEXT_PUBLIC_API_URL development <<< "$API_URL" || vercel env rm NEXT_PUBLIC_API_URL development --yes && vercel env add NEXT_PUBLIC_API_URL development <<< "$API_URL"

# Deploy
echo "📤 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure custom domain (if you have linguaformula.com):"
echo "      vercel domains add linguaformula.com"
echo "      vercel domains add www.linguaformula.com"
echo "   2. Update DNS records to point to Vercel"
echo "   3. Check deployment: vercel ls"
