# 🎨 Kids Art Gallery

A static masonry gallery site showcasing artwork by Yoga and Siyu.

**Live site**: [guoliang25.github.io/kids-gallery](https://guoliang25.github.io/kids-gallery/)

## How to Add New Artwork

1. Place the image in the corresponding folder:
   - Yoga's art: `images/artworks/yoga/`
   - Siyu's art: `images/artworks/siyu/`
2. Edit `data/artworks.json` and add an entry to the appropriate array:
   ```json
   {
     "file": "2026-04-flower.jpg",
     "title": "Artwork 1",
     "date": "2026-04"
   }
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Add new artwork"
   git push
   ```
4. GitHub Pages will update automatically.

## Local Preview

```bash
cd ~/kids-gallery
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

## Features

- 🧑‍🎨 Dual tabs: switch between Yoga and Siyu's artwork
- 📱 Responsive masonry layout (3 columns / 2 columns / 1 column)
- 🔍 Lightbox preview with arrow key navigation and ESC to close
- ⚡ Lazy loading for images
- 📋 Simple JSON-based artwork management
- 🚀 Pure static site — push to deploy, no build step needed
