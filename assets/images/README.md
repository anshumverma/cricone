# CricOne Logo Setup Instructions

## Required Action

Please save the CricOne logo image (the red shield with "CricOne" text) to this directory with the filename:

```
cricone-logo.png
```

## Full Path
The image should be saved at:
```
assets/images/cricone-logo.png
```

## Image Specifications

### Recommended Specifications:
- **Format**: PNG (with transparency preferred)
- **Size**: 512x512 pixels or larger (will be scaled down)
- **Aspect Ratio**: Square (1:1) or shield shape
- **Background**: Transparent or solid color

### Current Usage:
1. **Favicon** (browser tab icon)
   - Displayed at 16x16 or 32x32 pixels
   - Shows in browser tabs and bookmarks

2. **Header Logo** (next to title)
   - Desktop: 32x32 pixels
   - Tablet: 28x28 pixels  
   - Mobile: 24x24 pixels

## How to Save the Image

### Option 1: From Chat
1. Right-click on the logo image in the chat
2. Select "Save Image As..."
3. Navigate to the `assets/images/` folder in your project
4. Save as `cricone-logo.png`

### Option 2: Drag and Drop
1. Drag the logo image from the chat
2. Drop it into the `assets/images/` folder
3. Rename it to `cricone-logo.png`

### Option 3: Command Line
If you have the image file already:
```bash
# From your project root directory
mv /path/to/your/logo.png assets/images/cricone-logo.png
```

## Verification

After saving the image, refresh your browser to see:
- ✅ Logo appears next to "CricOne" title in the header
- ✅ Favicon appears in the browser tab

## Troubleshooting

### Logo Not Showing?
1. Check the file path: `assets/images/cricone-logo.png`
2. Check the filename is exactly: `cricone-logo.png` (lowercase, no spaces)
3. Clear browser cache and refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for 404 errors

### Favicon Not Showing?
1. Favicons can take time to update in browsers
2. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Clear browser cache completely
4. Close and reopen the browser

## Alternative: Using a Different Image

If you want to use a different image:

1. Save your image to `assets/images/` with any name
2. Update the references in `index.html`:
   ```html
   <!-- Change both occurrences -->
   <link rel="icon" type="image/png" href="assets/images/YOUR-IMAGE-NAME.png">
   <img src="assets/images/YOUR-IMAGE-NAME.png" alt="CricOne Logo" class="logo">
   ```

## Image Optimization (Optional)

For best performance, you can optimize the image:

### Using Online Tools:
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/

### Using Command Line:
```bash
# Install ImageMagick (if not already installed)
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Optimize and resize
convert cricone-logo.png -resize 512x512 -quality 85 cricone-logo-optimized.png
```

## Current Implementation

The logo has been integrated into:

### HTML (`index.html`):
- Favicon link in `<head>`
- Logo image in header with `.header-brand` wrapper

### CSS (`src/styles.css`):
- `.header-brand` - Flexbox container for logo and title
- `.logo` - Logo sizing and styling
- Responsive breakpoints for different screen sizes

## Support

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Verify the file exists at the correct path
3. Ensure the image format is supported (PNG, JPG, SVG, ICO)
