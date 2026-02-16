#!/bin/bash

# CricOne - GitHub Repository Setup Script
# This script helps you quickly set up and deploy to GitHub Pages

echo "🏏 CricOne - GitHub Pages Setup"
echo "================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed"
    echo "Please install Git first: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if already initialized
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
    echo ""
    read -p "Do you want to continue? This will add a new remote. (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
else
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Add all files
echo "📝 Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Create initial commit if needed
if ! git rev-parse HEAD &> /dev/null; then
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: CricOne Cricket Academy Membership Manager"
    echo "✅ Initial commit created"
    echo ""
fi

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Old remote removed"
    else
        echo "Keeping existing remote"
        echo ""
        echo "To push manually, run:"
        echo "  git push -u origin main"
        exit 0
    fi
fi

# Add GitHub remote
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/anshumverma/cricone.git
echo "✅ Remote added: https://github.com/anshumverma/cricone.git"
echo ""

# Verify remote
echo "🔍 Verifying remote..."
git remote -v
echo ""

# Rename branch to main if needed
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🔄 Renaming branch to 'main'..."
    git branch -M main
    echo "✅ Branch renamed to 'main'"
    echo ""
fi

# Ask if user wants to push now
echo "📤 Ready to push to GitHub!"
echo ""
echo "⚠️  IMPORTANT: Make sure you have:"
echo "   1. Created the repository on GitHub: https://github.com/anshumverma/cricone"
echo "   2. Added the CricOne logo to: assets/images/cricone-logo.png"
echo ""
read -p "Do you want to push now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to GitHub..."
    if git push -u origin main; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Next steps:"
        echo "   1. Go to: https://github.com/anshumverma/cricone/settings/pages"
        echo "   2. Under 'Source', select 'main' branch and '/ (root)' folder"
        echo "   3. Click 'Save'"
        echo "   4. Wait 1-2 minutes for deployment"
        echo "   5. Your app will be live at: https://anshumverma.github.io/cricone/"
        echo ""
    else
        echo ""
        echo "❌ Push failed. This might be because:"
        echo "   1. The repository doesn't exist on GitHub yet"
        echo "   2. You don't have permission to push"
        echo "   3. Authentication failed"
        echo ""
        echo "Please:"
        echo "   1. Create the repository: https://github.com/new"
        echo "   2. Repository name: cricone"
        echo "   3. Make it public"
        echo "   4. Don't initialize with README"
        echo "   5. Run this script again or push manually:"
        echo "      git push -u origin main"
    fi
else
    echo ""
    echo "📋 To push manually later, run:"
    echo "   git push -u origin main"
    echo ""
    echo "📖 For detailed instructions, see: DEPLOYMENT.md"
fi

echo ""
echo "✨ Setup complete!"
