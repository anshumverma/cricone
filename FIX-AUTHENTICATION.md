# Fix GitHub Authentication Issue

## Problem

The push failed with this error:
```
remote: Permission to anshumverma/cricone.git denied to vaishalivr.
fatal: unable to access 'https://github.com/anshumverma/cricone.git/': The requested URL returned error: 403
```

This means Git is trying to authenticate as `vaishalivr` instead of `anshumverma`.

## Solution

You need to update your GitHub credentials. Choose one of the methods below:

### Method 1: Clear Cached Credentials (Recommended)

**macOS:**
```bash
# Remove cached GitHub credentials
git credential-osxkeychain erase
host=github.com
protocol=https

# Press Enter twice (once after the blank line)
```

Or use this one-liner:
```bash
printf "host=github.com\nprotocol=https\n\n" | git credential-osxkeychain erase
```

**Then try pushing again:**
```bash
git push -u origin main
```

You'll be prompted to enter your GitHub credentials for `anshumverma`.

### Method 2: Use Personal Access Token (Most Secure)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Note: "CricOne Deployment"
   - Expiration: Choose duration (90 days recommended)
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Update Remote URL with Token:**
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/anshumverma/cricone.git
   ```
   
   Replace `YOUR_TOKEN` with the token you copied.

3. **Push:**
   ```bash
   git push -u origin main
   ```

### Method 3: Use SSH Instead of HTTPS

1. **Check if you have SSH keys:**
   ```bash
   ls -la ~/.ssh
   ```
   
   Look for `id_rsa.pub` or `id_ed25519.pub`

2. **If no SSH key exists, create one:**
   ```bash
   ssh-keygen -t ed25519 -C "anshum.verma@gmail.com"
   ```
   
   Press Enter to accept defaults.

3. **Add SSH key to GitHub:**
   ```bash
   # Copy your public key
   cat ~/.ssh/id_ed25519.pub
   ```
   
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: "CricOne Deployment"
   - Paste the key
   - Click "Add SSH key"

4. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:anshumverma/cricone.git
   ```

5. **Push:**
   ```bash
   git push -u origin main
   ```

### Method 4: Use GitHub CLI (Easiest)

1. **Install GitHub CLI:**
   ```bash
   # macOS
   brew install gh
   
   # Or download from: https://cli.github.com/
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```
   
   Follow the prompts:
   - Choose: GitHub.com
   - Choose: HTTPS
   - Authenticate with: Login with a web browser
   - Follow the browser flow

3. **Push:**
   ```bash
   git push -u origin main
   ```

## Quick Fix (Try This First)

Run these commands in order:

```bash
# 1. Clear cached credentials
printf "host=github.com\nprotocol=https\n\n" | git credential-osxkeychain erase

# 2. Try pushing again
git push -u origin main

# You'll be prompted for username and password
# Username: anshumverma
# Password: Use a Personal Access Token (not your GitHub password)
```

## Create Repository First

Before pushing, make sure the repository exists on GitHub:

1. Go to: https://github.com/new
2. Repository name: `cricone`
3. Owner: `anshumverma`
4. Visibility: **Public**
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Verify Authentication

After fixing authentication, verify it works:

```bash
# Test GitHub connection
ssh -T git@github.com

# Or for HTTPS
git ls-remote https://github.com/anshumverma/cricone.git
```

## Alternative: Push from GitHub Desktop

If command line authentication is problematic:

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with `anshumverma` account
3. File → Add Local Repository
4. Select the `cricone` folder
5. Click "Publish repository"
6. Name: `cricone`
7. Keep public
8. Click "Publish repository"

## After Successful Push

Once you successfully push:

1. Go to: https://github.com/anshumverma/cricone/settings/pages
2. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
3. Click "Save"
4. Wait 1-2 minutes
5. Your app will be live at: https://anshumverma.github.io/cricone/

## Still Having Issues?

If you continue to have authentication problems:

1. **Check which account is logged in:**
   ```bash
   gh auth status
   ```

2. **Switch accounts:**
   ```bash
   gh auth logout
   gh auth login
   ```

3. **Or use a different remote URL format:**
   ```bash
   # With username in URL
   git remote set-url origin https://anshumverma@github.com/anshumverma/cricone.git
   ```

## Summary

The issue is that Git is using cached credentials for the wrong user (`vaishalivr` instead of `anshumverma`). 

**Quickest fix:**
1. Clear cached credentials
2. Create the repository on GitHub
3. Push again with correct credentials

**Most secure fix:**
1. Create a Personal Access Token
2. Use token in remote URL
3. Push

Choose the method that works best for you!
