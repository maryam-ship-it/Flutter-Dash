// Game Configuration - All tunable settings
const CONFIG = {
  // Physics Settings
  gravity: 1500, // px/s²
  jumpImpulse: -420, // px/s (negative = upward)
  terminalVelocity: 800, // Maximum fall speed

  // Obstacle Settings
  pipeSpeed: 220, // px/s
  pipeSpawnInterval: 1400, // ms
  pipeGap: 150, // px
  pipeWidth: 80, // px

  // Game World
  groundHeight: 100, // px
  worldBounds: {
    top: 50,
    bottom: -50, // Relative to ground
  },

  // Player Settings
  playerSize: 40, // px
  playerStartX: 150, // px from left
  playerStartY: 300, // px from top

  // Collectibles
  coinSpawnChance: 0.3, // 30% chance per pipe
  coinValue: 1, // Base coin value
  coinSize: 25, // px

  // Power-ups
  powerUpSpawnChance: 0.15, // 15% chance per pipe
  powerUpDurations: {
    shield: 1, // Number of hits
    slowTime: 3000, // ms
    doubleScore: 10000, // ms
    magnet: 5000, // ms
  },

  // Visual Settings
  parallaxSpeeds: {
    background: 0.2, // Slowest layer
    midground: 0.5, // Medium layer
    foreground: 0.8, // Fastest layer (excluding obstacles)
  },

  // Particle System
  particles: {
    maxParticles: 100,
    flapParticles: 8,
    collisionParticles: 15,
    coinParticles: 6,
    powerUpParticles: 10,
  },

  // Audio Settings
  defaultVolumes: {
    music: 0.7,
    sfx: 0.8,
  },

  // Performance
  targetFPS: 60,
  maxDeltaTime: 1 / 30, // Cap delta time to prevent large jumps

  // Themes Configuration
  themes: {
    "pastel-clouds": {
      name: "Pastel Clouds",
      colors: {
        primary: "#FFB6C1",
        secondary: "#E6E6FA",
        accent: "#98FB98",
        background: "#F0F8FF",
        text: "#4B0082",
      },
      backgroundLayers: 3,
      musicFile: "pastel-clouds.mp3",
    },
    "neon-cyberpunk": {
      name: "Neon Cyberpunk",
      colors: {
        primary: "#FF1493",
        secondary: "#00FFFF",
        accent: "#FFFF00",
        background: "#0D0D0D",
        text: "#FFFFFF",
      },
      backgroundLayers: 3,
      musicFile: "neon-cyberpunk.mp3",
    },
    "egyptian-dusk": {
      name: "Egyptian Dusk",
      colors: {
        primary: "#DAA520",
        secondary: "#CD853F",
        accent: "#FF4500",
        background: "#2F1B14",
        text: "#F5DEB3",
      },
      backgroundLayers: 3,
      musicFile: "egyptian-dusk.mp3",
    },
    "watercolor-forest": {
      name: "Watercolor Forest",
      colors: {
        primary: "#228B22",
        secondary: "#32CD32",
        accent: "#FFD700",
        background: "#F0FFF0",
        text: "#006400",
      },
      backgroundLayers: 3,
      musicFile: "watercolor-forest.mp3",
    },
  },

  // Skins Configuration
  skins: {
    default: { name: "Classic Butterfly", price: 0, unlocked: true },
    monarch: { name: "Monarch", price: 50, unlocked: false },
    "blue-morpho": { name: "Blue Morpho", price: 75, unlocked: false },
    rainbow: { name: "Rainbow Wings", price: 100, unlocked: false },
    crystal: { name: "Crystal Wings", price: 150, unlocked: false },
    fire: { name: "Fire Butterfly", price: 200, unlocked: false },
    ice: { name: "Ice Butterfly", price: 200, unlocked: false },
    golden: { name: "Golden Wings", price: 300, unlocked: false },
    shadow: { name: "Shadow Butterfly", price: 400, unlocked: false },
    cosmic: { name: "Cosmic Wings", price: 500, unlocked: false },
  },

  // Daily Challenges
  dailyChallenges: [
    { id: "coins20", description: "Collect 20 coins in a single run", target: 20, reward: 50, type: "coins" },
    { id: "score50", description: "Reach a score of 50", target: 50, reward: 75, type: "score" },
    { id: "powerups5", description: "Collect 5 power-ups in one game", target: 5, reward: 60, type: "powerups" },
    { id: "survive60", description: "Survive for 60 seconds", target: 60000, reward: 80, type: "time" },
    { id: "nohit30", description: "Score 30 points without using shield", target: 30, reward: 100, type: "nohit" },
  ],

  // Controls
  controls: {
    keyboard: ["Space", "ArrowUp", "KeyW"],
    touch: true,
    mouse: true,
  },

  // Storage Keys
  storageKeys: {
    highScore: "butterfly_high_score",
    totalCoins: "butterfly_total_coins",
    unlockedSkins: "butterfly_unlocked_skins",
    selectedSkin: "butterfly_selected_skin",
    selectedTheme: "butterfly_selected_theme",
    settings: "butterfly_settings",
    dailyChallenge: "butterfly_daily_challenge",
    language: "butterfly_language",
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG
}
