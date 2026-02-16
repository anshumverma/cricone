#!/bin/bash

# CricOne - Fix Authentication and Push
# This script helps fix the authentication issue and push to GitHub

echo "🏏 CricOne - Fix Authentication & Push"
echo "======================================"
echo ""

echo "The issue: Git is trying to authenticate as 'vaishalivr' instead of 'anshumverma'"
echo ""

echo "Option 1: Clear cached credentials and try again"
echo "Option 2: Use Personal Access Token"
echo "Option 3: Switch to SSH"
echo ""

read -p "Choose option (1/2/3): " -n 1 -r
echo ""
echo ""

if [[ $REPLY == "1" ]]; then
    echo "🔧 Clearing cached GitHub credentials..."
    printf "host=github.com\nprotocol=https\n\n" | git credential-osxkeychain erase
    echo "✅ Credentials cleared"
    echo ""
    echo "📤 Attempting to push..."
    echo "You will be prompted for GitHub credentials."
    echo "Username: anshumverma"
    echo "Password: Use a Personal Access Token (create at: https://github.com/settings/tokens)"
    echo ""
    git push -u origin main
    
elif [[ $REPLY == "2" ]]; then
    echo "📝 To use a Personal Access Token:"
    echo ""
    echo "1. Create token at: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'repo' scope"
    echo "4. Copy the token"
    echo ""
    read -p "Enter your Personal Access Token: " token
    echo ""
    echo "🔧 Updating remote URL with token..."
    git remote set-url origin "https://${token}@github.com/anshumverma/cricone.git"
    echo "✅ Remote URL updated"
    echo ""
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    
elif [[ $REPLY == "3" ]]; then
    echo "🔑 Switching to SSH..."
    echo ""
    
    # Check if SSH key exists
    if [ -f ~/.ssh/id_ed25519.pub ] || [ -f ~/.ssh/id_rsa.pub ]; then
        echo "✅ SSH key found"
        
        if [ -f ~/.ssh/id_ed25519.pub ]; then
            echo ""
            echo "Your SSH public key:"
            cat ~/.ssh/id_ed25519.pub
        else
            echo ""
            echo "Your SSH public key:"
            cat ~/.ssh/id_rsa.pub
        fi
        
        echo ""
        echo "📋 Copy the key above and add it to GitHub:"
        echo "   https://github.com/settings/keys"
        echo ""
        read -p "Press Enter after adding the key to GitHub..."
        
    else
        echo "⚠️  No SSH key found. Creating one..."
        ssh-keygen -t ed25519 -C "anshum.verma@gmail.com"
        echo ""
        echo "✅ SSH key created"
        echo ""
        echo "Your SSH public key:"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "📋 Copy the key above and add it to GitHub:"
        echo "   https://github.com/settings/keys"
        echo ""
        read -p "Press Enter after adding the key to GitHub..."
    fi
    
    echo ""
    echo "🔧 Updating remote to use SSH..."
    git remote set-url origin git@github.com:anshumverma/cricone.git
    echo "✅ Remote URL updated to SSH"
    echo ""
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    
else
    echo "❌ Invalid option"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Next steps:"
    echo "   1. Go to: https://github.com/anshumverma/cricone/settings/pages"
    echo "   2. Under 'Source', select 'main' branch and '/ (root)' folder"
    echo "   3. Click 'Save'"
    echo "   4. Wait 1-2 minutes for deployment"
    echo "   5. Your app will be live at: https://anshumverma.github.io/cricone/"
else
    echo ""
    echo "❌ Push failed"
    echo ""
    echo "See FIX-AUTHENTICATION.md for more solutions"
fi

echo ""
echo "✨ Done!"
