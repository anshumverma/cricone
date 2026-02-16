# CricOne - GitHub Pages Deployment Checklist

Use this checklist to ensure a smooth deployment to GitHub Pages.

## Pre-Deployment Checklist

### 1. Logo Image
- [ ] CricOne logo saved to `assets/images/cricone-logo.png`
- [ ] Logo is PNG format
- [ ] Logo displays correctly in browser
- [ ] Favicon shows in browser tab

### 2. Code Quality
- [ ] All features tested locally
- [ ] No console errors in browser (F12)
- [ ] Export button works after import
- [ ] Campaign filter populates correctly
- [ ] Theme switcher works (light/dark)
- [ ] All links and buttons functional

### 3. File Verification
- [ ] `index.html` exists and loads
- [ ] `src/app.js` exists
- [ ] `src/sidebar-handler.js` exists
- [ ] `src/styles.css` exists
- [ ] All file paths are relative (no absolute paths)

### 4. Documentation
- [ ] README.md updated with live URL
- [ ] DEPLOYMENT.md reviewed
- [ ] All docs in `docs/` folder are current

## GitHub Repository Setup

### 1. Create Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `cricone`
- [ ] Owner: `anshumverma`
- [ ] Visibility: **Public** (required for free GitHub Pages)
- [ ] **Do NOT** initialize with README, .gitignore, or license
- [ ] Click "Create repository"

### 2. Repository Settings
- [ ] Repository created successfully
- [ ] URL is: https://github.com/anshumverma/cricone
- [ ] Repository is public

## Local Git Setup

### Option A: Using Setup Script (Recommended)

**macOS/Linux:**
```bash
./setup-github.sh
```

**Windows:**
```cmd
setup-github.bat
```

### Option B: Manual Setup

- [ ] Initialize Git: `git init`
- [ ] Add files: `git add .`
- [ ] Create commit: `git commit -m "Initial commit: CricOne Cricket Academy Membership Manager"`
- [ ] Add remote: `git remote add origin https://github.com/anshumverma/cricone.git`
- [ ] Rename branch: `git branch -M main`
- [ ] Push to GitHub: `git push -u origin main`

## GitHub Pages Configuration

### 1. Enable GitHub Pages
- [ ] Go to https://github.com/anshumverma/cricone/settings/pages
- [ ] Under "Source":
  - [ ] Branch: Select `main`
  - [ ] Folder: Select `/ (root)`
- [ ] Click "Save"
- [ ] Wait for "Your site is live at..." message

### 2. Verify Deployment
- [ ] Wait 1-2 minutes for initial deployment
- [ ] Visit: https://anshumverma.github.io/cricone/
- [ ] Page loads successfully
- [ ] No 404 errors
- [ ] Styles load correctly
- [ ] Logo displays

## Post-Deployment Testing

### 1. Basic Functionality
- [ ] Page loads without errors
- [ ] Logo displays in header
- [ ] Favicon shows in browser tab
- [ ] Theme switcher works
- [ ] All buttons are visible

### 2. Core Features
- [ ] Import button opens file dialog
- [ ] Excel file uploads successfully
- [ ] Data displays in table
- [ ] Campaign filter populates
- [ ] Export button becomes active
- [ ] Export downloads file

### 3. Responsive Design
- [ ] Test on desktop browser
- [ ] Test on tablet (or resize browser)
- [ ] Test on mobile (or use device emulation)
- [ ] All elements visible at different sizes

### 4. Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

## Optional Enhancements

### 1. Custom Domain (Optional)
- [ ] Purchase domain
- [ ] Configure DNS CNAME record
- [ ] Update CNAME file in repository
- [ ] Configure in GitHub Pages settings
- [ ] Enable HTTPS

### 2. Analytics (Optional)
- [ ] Set up Google Analytics
- [ ] Add tracking code to index.html
- [ ] Verify tracking works

### 3. SEO (Optional)
- [ ] Add meta description
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Create sitemap.xml
- [ ] Add robots.txt

## Troubleshooting

### Issue: 404 Page Not Found
- [ ] Verify repository is public
- [ ] Check GitHub Pages is enabled
- [ ] Wait 2-3 minutes and try again
- [ ] Clear browser cache

### Issue: Styles Not Loading
- [ ] Check browser console for errors
- [ ] Verify file paths are relative
- [ ] Check files exist in repository
- [ ] Hard refresh: Ctrl+Shift+R

### Issue: Logo Not Showing
- [ ] Verify file exists: `assets/images/cricone-logo.png`
- [ ] Check file name is exact (case-sensitive)
- [ ] Commit and push logo file
- [ ] Clear browser cache

### Issue: Export Button Not Working
- [ ] Check browser console for errors
- [ ] Verify data imported successfully
- [ ] Check `appState.players` has data
- [ ] Review BUGFIX-EXPORT-BUTTON-NOT-ENABLING.md

## Maintenance Checklist

### Regular Updates
- [ ] Pull latest changes: `git pull`
- [ ] Make changes locally
- [ ] Test changes in browser
- [ ] Commit: `git commit -m "Description"`
- [ ] Push: `git push`
- [ ] Verify deployment (1-2 minutes)

### Version Control
- [ ] Create tags for releases: `git tag -a v1.0.0 -m "Release 1.0.0"`
- [ ] Push tags: `git push origin v1.0.0`
- [ ] Create GitHub releases

### Backup
- [ ] Create backup branch: `git checkout -b backup`
- [ ] Push backup: `git push -u origin backup`
- [ ] Return to main: `git checkout main`

## Success Criteria

Your deployment is successful when:

- ✅ Repository exists at https://github.com/anshumverma/cricone
- ✅ GitHub Pages is enabled
- ✅ Site is live at https://anshumverma.github.io/cricone/
- ✅ All features work correctly
- ✅ No console errors
- ✅ Logo displays
- ✅ Responsive on all devices
- ✅ HTTPS is enabled

## Quick Reference

### Essential URLs
- **Repository**: https://github.com/anshumverma/cricone
- **Live Site**: https://anshumverma.github.io/cricone/
- **Settings**: https://github.com/anshumverma/cricone/settings
- **Pages Settings**: https://github.com/anshumverma/cricone/settings/pages
- **Actions**: https://github.com/anshumverma/cricone/actions

### Essential Commands
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest
git pull

# View log
git log --oneline
```

## Support

If you encounter issues:

1. Review [DEPLOYMENT.md](DEPLOYMENT.md)
2. Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
3. Review error messages in browser console
4. Check GitHub Actions for deployment status
5. Create an issue on GitHub

## Completion

- [ ] All checklist items completed
- [ ] Site is live and functional
- [ ] Documentation updated
- [ ] Team notified (if applicable)

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Live URL**: https://anshumverma.github.io/cricone/

**Status**: ⬜ In Progress  ⬜ Complete  ⬜ Issues Found

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
