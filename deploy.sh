#!/bin/bash

echo "🚀 Starting deployment to main branch..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Configure git
git config user.name "Deploy Bot"
git config user.email "deploy@audit-readiness-hub.com"

# Add built files
echo "📁 Adding built files..."
git add dist -f

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy: $(date)"

# Force push to main
echo "🔄 Force pushing to main branch..."
git push origin main --force

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Site will be available at: https://seriouz85.github.io/audit-readiness-hub"
else
    echo "❌ Deployment failed!"
    exit 1
fi 