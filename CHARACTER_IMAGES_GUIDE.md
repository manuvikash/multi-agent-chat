# 🎨 Character Images Setup Guide

## Overview
The UI now displays character images for each anime persona in the bot selection screens. Images are shown in circular frames with colored borders matching each character's theme.

## 📁 Folder Location

Character images should be placed in:
```
web-react/public/personas/
```

This folder has been created and is ready for your images!

## 🖼️ Required Images

Add images for these 8 anime characters:

| File Name | Character | Anime |
|-----------|-----------|-------|
| `gooner.png` or `gooner.jpg` | Saitama | One Punch Man |
| `professor.png` or `professor.jpg` | Light Yagami | Death Note |
| `glitchcore.png` or `glitchcore.jpg` | Accelerator | A Certain Magical Index |
| `mama.png` or `mama.jpg` | Nezuko | Demon Slayer |
| `edgelord.png` or `edgelord.jpg` | Sasuke Uchiha | Naruto |
| `corporate.png` or `corporate.jpg` | Reigen Arataka | Mob Psycho 100 |
| `goblin.png` or `goblin.jpg` | Goku | Dragon Ball |
| `zen.png` or `zen.jpg` | Whis | Dragon Ball Super |

## 📐 Image Specifications

### Recommended:
- **Format**: PNG (preferred) or JPG
- **Size**: 400x400px (square aspect ratio)
- **Max File Size**: 500KB per image
- **Style**: Character portrait, headshot, or face close-up
- **Background**: Any (will be cropped to circle)

### Tips:
- Square images work best (1:1 aspect ratio)
- Center the character's face in the image
- Higher resolution is better for sharp display
- Transparent backgrounds (PNG) are optional

## 🔍 Where to Find Images

### Option 1: Official Art
- MyAnimeList character pages
- Anime official websites
- Wikia/Fandom pages

### Option 2: Screenshots
- Take screenshots from the anime
- Crop to focus on the character's face

### Option 3: Fan Art
- DeviantArt (with permission)
- Pixiv (with permission)
- Always credit artists if required

### Option 4: AI Generated
- Use tools like Midjourney, Stable Diffusion
- Generate portraits in anime style

## 📝 File Naming Rules

**IMPORTANT**: File names are case-sensitive and must match exactly:

✅ Correct:
- `gooner.png`
- `professor.jpg`
- `mama.png`

❌ Wrong:
- `Gooner.png` (capital G)
- `gooner.PNG` (capital PNG)
- `gooner_image.png` (extra text)

## 🎯 How It Works

1. **Image Display**: 
   - Images are shown in a circular frame
   - Border color matches the character's theme
   - Size: 96x96px (24rem) in the UI

2. **Fallback System**:
   - If `gooner.png` doesn't exist, tries `gooner.jpg`
   - If both fail, displays the emoji (👊, 📓, etc.)
   - No error shown to users - seamless fallback

3. **Where Images Appear**:
   - Create Room Modal (when selecting starting bot)
   - Bot Selector Modal (when adding bots to active room)

## 🚀 Testing Your Images

1. Add an image to `web-react/public/personas/`
2. Refresh your browser (Ctrl+F5 / Cmd+Shift+R)
3. Open the Create Room modal or Bot Selector
4. You should see your image in a circular frame!

## 🎨 Example Image Setup

```bash
cd /path/to/project/web-react/public/personas/

# Add your images here
# Example:
mv ~/Downloads/saitama.png gooner.png
mv ~/Downloads/light.jpg professor.jpg
# ... etc
```

## 🔧 Troubleshooting

### Image Not Showing?
1. Check file name is exactly correct (case-sensitive)
2. Verify file is in `web-react/public/personas/`
3. Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
4. Check browser console for 404 errors

### Image Looks Bad?
1. Use higher resolution source (400x400px minimum)
2. Ensure face is centered in the image
3. Try PNG format for better quality
4. Crop image to square before uploading

### Image Too Large?
1. Use online image compressor (TinyPNG, Squoosh)
2. Resize to 400x400px
3. Convert to JPG if PNG is too large
4. Aim for under 500KB per image

## 📋 Quick Checklist

Before going live:
- [ ] All 8 character images added
- [ ] File names match exactly
- [ ] Images are square (or cropped well)
- [ ] File sizes under 500KB
- [ ] Tested in browser - all images display
- [ ] Fallback works (emoji shows if image missing)

## 🎭 Visual Result

With images, your bot selection will show:
```
┌─────────────────────┐
│   [Character Img]   │  ← Circular frame with colored border
│                     │
│   Character Name    │  ← Colored text
│   Description       │  ← Gray text
│   [Add/Active Btn]  │  ← Gradient button
└─────────────────────┘
```

Without images (fallback):
```
┌─────────────────────┐
│       [Emoji]       │  ← Large emoji (👊, 📓, etc.)
│                     │
│   Character Name    │
│   Description       │
│   [Add/Active Btn]  │
└─────────────────────┘
```

## 📦 Git Considerations

The `personas` folder is tracked in git but images are NOT committed by default. To commit images:

```bash
git add web-react/public/personas/*.png
git add web-react/public/personas/*.jpg
git commit -m "Add character persona images"
```

Or add to `.gitignore` if you don't want images in version control:
```
web-react/public/personas/*.png
web-react/public/personas/*.jpg
```

---

**Ready to add images?** Just drop them in `web-react/public/personas/` with the correct names and refresh your browser! 🎉

