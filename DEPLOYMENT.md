# CricOne - GitHub Pages Deployment Guide

## Overview

This guide will help you deploy the CricOne application to GitHub Pages under your account: `anshumverma/cricone`

The app will be accessible at: `https://anshumverma.github.io/cricone/`

## Prerequisites

- Git installed on your computer
- GitHub account (anshumverma)
- Terminal/Command Line access

## Step-by-Step Deployment

### Step 1: Initialize Git Repository

From your project root directory, run:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: CricOne Cricket Academy Membership Manager"
```

### Step 2: Create GitHub Repository

1. Go to GitHub: https://github.com/new
2. Repository name: `cricone`
3. Description: "Cricket Academy Membership Manager - Browser-based membership tracking"
4. Visibility: **Public** (required for GitHub Pages free tier)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/anshumverma/cricone.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository: https://github.com/anshumverma/cricone
2. Click "Settings" tab
3. Click "Pages" in the left sidebar
4. Under "Source":
   - Branch: Select `main`
   - Folder: Select `/ (root)`
5. Click "Save"
6. Wait 1-2 minutes for deployment

### Step 5: Verify Deployment

Your app will be live at:
```
https://anshumverma.github.io/cricone/
```

GitHub will show the URL in the Pages settings once deployment is complete.

## Important Notes

### File Paths

All file paths in the application are relative, so they work correctly on GitHub Pages:
- ✅ `src/styles.css` (relative path)
- ✅ `src/app.js` (relative path)
- ✅ `assets/images/cricone-logo.png` (relative path)

### Logo Image

**IMPORTANT**: Before deploying, make sure to add the CricOne logo:
```bash
# Save the logo to:
assets/images/cricone-logo.png
```

Then commit and push:
```bash
git add assets/images/cricone-logo.png
git commit -m "Add CricOne logo"
git push
```

### External Dependencies

The app uses CDN links for external libraries (no installation needed):
- SheetJS (Excel parsing)
- date-fns (date manipulation)

These will work on GitHub Pages without any configuration.

## Updating the Deployed App

Whenever you make changes:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push

# GitHub Pages will automatically redeploy (takes 1-2 minutes)
```

## Custom Domain (Optional)

If you want to use a custom domain like `cricone.yourdomain.com`:

### Step 1: Configure DNS

Add a CNAME record in your domain's DNS settings:
```
Type: CNAME
Name: cricone (or @ for root domain)
Value: anshumverma.github.io
```

### Step 2: Update CNAME File

Edit the `CNAME` file in your repository:
```
cricone.yourdomain.com
```

### Step 3: Configure GitHub Pages

1. Go to Settings > Pages
2. Under "Custom domain", enter: `cricone.yourdomain.com`
3. Click "Save"
4. Wait for DNS check to complete
5. Enable "Enforce HTTPS" (recommended)

## Troubleshooting

### Issue: 404 Page Not Found

**Solution**:
- Verify the repository is public
- Check that GitHub Pages is enabled in Settings > Pages
- Wait 2-3 minutes after enabling Pages
- Clear browser cache

### Issue: Styles Not Loading

**Solution**:
- Check browser console for errors (F12)
- Verify all file paths are relative (no leading `/`)
- Check that files exist in the repository

### Issue: Logo Not Showing

**Solution**:
- Verify `assets/images/cricone-logo.png` exists
- Check file name is exactly `cricone-logo.png` (case-sensitive)
- Commit and push the logo file

### Issue: Changes Not Appearing

**Solution**:
- Wait 1-2 minutes after pushing
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check GitHub Actions tab for deployment status

## GitHub Actions (Automatic Deployment)

GitHub Pages automatically deploys when you push to the `main` branch. You can check deployment status:

1. Go to your repository
2. Click "Actions" tab
3. See "pages build and deployment" workflows

## Repository Structure

```
cricone/
├── .gitignore              # Git ignore rules
├── .nojekyll               # Disable Jekyll processing
├── CNAME                   # Custom domain configuration (optional)
├── DEPLOYMENT.md           # This file
├── README.md               # Project documentation
├── index.html              # Main application file
├── package.json            # Project metadata
├── assets/
│   └── images/
│       ├── cricone-logo.png    # Logo (add this!)
│       └── README.md
├── src/
│   ├── app.js              # Main application logic
│   ├── sidebar-handler.js  # Sidebar functionality
│   └── styles.css          # Application styles
├── docs/                   # Documentation
└── tests/                  # Test files (optional in production)
```

## Security Considerations

### Data Privacy

- ✅ All data processing happens in the browser (client-side)
- ✅ No data is sent to any server
- ✅ Excel files are processed locally
- ✅ No backend or database required

### HTTPS

- ✅ GitHub Pages provides free HTTPS
- ✅ Automatically enabled for `*.github.io` domains
- ✅ Available for custom domains (enable in settings)

## Performance Optimization

The app is already optimized for GitHub Pages:
- ✅ Minimal file size
- ✅ CDN-hosted libraries
- ✅ No build process required
- ✅ Static files only

## Monitoring

### Check Deployment Status

```bash
# View deployment history
# Go to: https://github.com/anshumverma/cricone/deployments
```

### View Live Site

```bash
# Open in browser
open https://anshumverma.github.io/cricone/

# Or on Windows
start https://anshumverma.github.io/cricone/
```

## Backup and Version Control

### Create a Backup Branch

```bash
# Create a backup branch
git checkout -b backup
git push -u origin backup

# Return to main branch
git checkout main
```

### Tag Releases

```bash
# Create a version tag
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

## Collaboration

### Adding Collaborators

1. Go to Settings > Collaborators
2. Click "Add people"
3. Enter GitHub username
4. Select permission level

### Branch Protection

For production stability:
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews"
4. Enable "Require status checks to pass"

## Analytics (Optional)

### Google Analytics

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Support

### Resources

- GitHub Pages Documentation: https://docs.github.com/en/pages
- GitHub Community: https://github.community/
- Project Issues: https://github.com/anshumverma/cricone/issues

### Getting Help

1. Check this deployment guide
2. Review GitHub Pages documentation
3. Check repository Issues tab
4. Contact repository maintainer

## Quick Reference

### Essential Commands

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View remote URL
git remote -v

# View commit history
git log --oneline
```

### Useful Links

- Repository: https://github.com/anshumverma/cricone
- Live Site: https://anshumverma.github.io/cricone/
- Settings: https://github.com/anshumverma/cricone/settings
- Pages Settings: https://github.com/anshumverma/cricone/settings/pages

## Next Steps

After deployment:

1. ✅ Test the live application
2. ✅ Share the URL with users
3. ✅ Monitor for any issues
4. ✅ Set up custom domain (optional)
5. ✅ Add analytics (optional)
6. ✅ Create documentation for users

## Maintenance

### Regular Updates

```bash
# Pull latest changes
git pull

# Make your changes
# ...

# Commit and push
git add .
git commit -m "Update: description"
git push
```

### Rollback if Needed

```bash
# View commit history
git log --oneline

# Rollback to specific commit
git revert <commit-hash>
git push
```

## Success Checklist

- [ ] Git repository initialized
- [ ] GitHub repository created (anshumverma/cricone)
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Logo image added
- [ ] Live site accessible
- [ ] All features working
- [ ] HTTPS enabled
- [ ] Documentation updated

## Congratulations!

Your CricOne application is now live on GitHub Pages! 🎉

Access it at: https://anshumverma.github.io/cricone/
