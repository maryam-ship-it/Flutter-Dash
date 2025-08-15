# Butterfly Flight - Enhanced Flappy Bird Game

A complete, production-ready HTML5 web game featuring a butterfly character with advanced gameplay mechanics, multiple themes, multilingual support, and comprehensive customization options.

## 🎮 Features

### Core Gameplay
- **Smooth Physics**: 60 FPS gameplay with delta-time physics
- **Responsive Controls**: Touch, mouse, and keyboard support
- **Progressive Difficulty**: Dynamic obstacle generation
- **Power-up System**: Shield, Slow Time, Double Score, and Magnet power-ups
- **Coin Collection**: Collectible coins for purchasing upgrades

### Visual Themes (4 Complete Themes)
1. **Pastel Clouds** - Soft, dreamy atmosphere with pastel colors
2. **Neon Cyberpunk** - Futuristic neon-lit cityscape
3. **Egyptian Dusk** - Ancient Egyptian desert at sunset
4. **Watercolor Forest** - Artistic forest with watercolor effects

### Customization
- **10 Butterfly Skins**: Unlockable through coin collection
- **Theme Switching**: Real-time theme changes with smooth transitions
- **Audio Controls**: Separate music and sound effect volume controls
- **Language Support**: 10 languages including RTL support for Arabic

### Advanced Features
- **Daily Challenges**: Rotating challenges with coin rewards
- **Particle Effects**: Dynamic visual effects for all interactions
- **Parallax Backgrounds**: Multi-layer scrolling backgrounds
- **Local Storage**: Persistent progress and settings
- **Mobile Optimized**: Responsive design for all screen sizes

## 🚀 Quick Start

### Option 1: Direct Deployment to Vercel
1. Download or clone this repository
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import this folder
5. Deploy with default settings
6. Your game will be live at `your-project.vercel.app`

### Option 2: Local Development
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. The game will run immediately - no build process required

### Option 3: Using Vercel CLI
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Navigate to game folder
cd butterfly-flight-game

# Deploy
vercel

# Follow the prompts to deploy
\`\`\`

## 📁 File Structure

\`\`\`
butterfly-flight-game/
├── index.html          # Main HTML file with game structure
├── main.js            # Core game engine and logic (2000+ lines)
├── config.js          # All tunable game settings
├── translations.js    # Multilingual support (10 languages)
├── styles.css         # Complete styling and animations
├── audio-manager.js   # Advanced audio system
└── README.md          # This file
\`\`\`

## 🎯 Game Controls

### Desktop
- **Spacebar** or **Arrow Up** or **W**: Make butterfly flap
- **P**: Pause/Resume game
- **Mouse Click**: Alternative flap control

### Mobile/Touch
- **Tap Screen**: Make butterfly flap
- **Tap Pause Button**: Pause/Resume game
- **Touch Controls**: Optimized for mobile gameplay

## ⚙️ Customization Guide

### Adjusting Game Difficulty
Edit `config.js` to modify gameplay parameters:

\`\`\`javascript
const CONFIG = {
  // Physics Settings
  gravity: 1500,        // Increase for faster falling
  jumpImpulse: -420,    // More negative = higher jumps
  
  // Obstacle Settings
  pipeSpeed: 220,       // Increase for faster obstacles
  pipeGap: 150,         // Decrease for harder difficulty
  pipeSpawnInterval: 1400, // Decrease for more frequent obstacles
  
  // Power-up Settings
  powerUpSpawnChance: 0.15, // 0.0-1.0 (0% to 100%)
  coinSpawnChance: 0.3,     // 0.0-1.0 (0% to 100%)
}
\`\`\`

### Adding New Themes
1. Add theme configuration to `config.js`:
\`\`\`javascript
themes: {
  "your-theme": {
    name: "Your Theme Name",
    colors: {
      primary: "#FF0000",
      secondary: "#00FF00",
      accent: "#0000FF",
      background: "#FFFFFF",
      text: "#000000",
    },
    backgroundLayers: 3,
    musicFile: "your-theme.mp3",
  }
}
\`\`\`

2. Add theme option to HTML select in `index.html`
3. Add translations for theme name in `translations.js`

### Adding New Languages
1. Add translations to `translations.js`:
\`\`\`javascript
TRANSLATIONS.newLang = {
  gameTitle: "Your Translation",
  play: "Your Translation",
  // ... add all required keys
}
\`\`\`

2. Add language config:
\`\`\`javascript
LANGUAGE_CONFIG.newLang = {
  name: "Language Name",
  dir: "ltr", // or "rtl"
  flag: "🏳️"
}
\`\`\`

3. Add option to language select in `index.html`

### Adding New Butterfly Skins
Edit the `skins` section in `config.js`:
\`\`\`javascript
skins: {
  "your-skin": {
    name: "Your Skin Name",
    price: 100,
    unlocked: false
  }
}
\`\`\`

## 🔧 Technical Details

### Performance Optimizations
- **Object Pooling**: Particles and obstacles are pooled for memory efficiency
- **Delta Time Physics**: Smooth gameplay regardless of frame rate
- **Canvas Optimization**: Efficient rendering with minimal draw calls
- **Asset Preloading**: All resources loaded before gameplay starts

### Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Support**: iOS Safari 12+, Chrome Mobile 60+
- **Features Used**: Canvas 2D, Web Audio API, LocalStorage, RequestAnimationFrame

### Audio System
- **Procedural Sound Generation**: Fallback sounds generated when audio files unavailable
- **Spatial Audio**: 3D positioned audio effects
- **Dynamic Music**: Theme-specific background music with smooth transitions
- **Volume Controls**: Separate music and SFX volume management

## 🌍 Supported Languages

1. **English** (en) - Default
2. **Arabic** (ar) - RTL layout support
3. **French** (fr)
4. **Spanish** (es)
5. **German** (de)
6. **Italian** (it)
7. **Portuguese** (pt)
8. **Russian** (ru)
9. **Japanese** (ja)
10. **Chinese Simplified** (zh)

## 🎨 Themes Overview

### Pastel Clouds
- Soft pink and lavender color palette
- Dreamy cloud formations
- Gentle, floating aesthetic

### Neon Cyberpunk
- Electric pink and cyan colors
- Futuristic cityscape background
- High-contrast neon effects

### Egyptian Dusk
- Golden and orange sunset colors
- Desert landscape with pyramids
- Ancient Egyptian motifs

### Watercolor Forest
- Natural green and gold tones
- Artistic watercolor textures
- Organic forest environment

## 🏆 Game Progression

### Coin System
- Collect coins during gameplay
- Use coins to unlock new butterfly skins
- Bonus coins from daily challenges

### Daily Challenges
- Rotating daily objectives
- Bonus coin rewards
- Progress tracking and completion rewards

### Unlockable Content
- 10 unique butterfly skins
- 4 complete visual themes
- Achievement-based progression

## 🐛 Troubleshooting

### Game Won't Load
- Ensure all files are in the same directory
- Check browser console for errors
- Try refreshing the page

### Audio Issues
- Check browser audio permissions
- Verify volume settings in game
- Some browsers require user interaction before playing audio

### Performance Issues
- Close other browser tabs
- Check if hardware acceleration is enabled
- Lower browser zoom level if needed

### Mobile Issues
- Ensure touch events are enabled
- Check if browser supports required features
- Try landscape orientation for better experience

## 📱 Mobile Optimization

- **Responsive Design**: Adapts to all screen sizes
- **Touch Controls**: Optimized touch targets
- **Performance**: Efficient rendering for mobile GPUs
- **Battery Life**: Optimized for mobile power consumption

## 🔒 Privacy & Data

- **Local Storage Only**: All data stored locally on device
- **No External Requests**: Game runs entirely offline after loading
- **No Analytics**: No tracking or data collection
- **GDPR Compliant**: No personal data processed

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit improvements! Areas for enhancement:
- Additional themes and skins
- New power-up types
- More language translations
- Performance optimizations
- New game modes

---

**Enjoy playing Butterfly Flight!** 🦋

For support or questions, please check the troubleshooting section above.
