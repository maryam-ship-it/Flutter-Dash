// Butterfly Flight - Enhanced Flappy Bird Game Engine
// Main game logic, physics, rendering, and state management

const CONFIG = {
  playerSize: 50,
  playerStartX: 100,
  playerStartY: 300,
  gravity: 980,
  terminalVelocity: 500,
  pipeSpeed: 200,
  pipeWidth: 70,
  pipeGap: 150,
  groundHeight: 100,
  worldBounds: {
    top: 0,
  },
  maxDeltaTime: 0.1,
  pipeSpawnInterval: 1500,
  coinSpawnChance: 0.15, // Increased coin spawn chance
  powerUpSpawnChance: 0.08, // Increased power-up spawn chance
  particles: {
    coinParticles: 12,
    powerUpParticles: 20,
    flapParticles: 8,
    collisionParticles: 25,
    magnetParticles: 15,
  },
  powerUpDurations: {
    slowTime: 6000,
    doubleScore: 12000,
    magnet: 10000,
    shield: 1, // Number of hits to absorb
  },
  coinSystem: {
    baseValue: 1,
    bonusMultiplier: 1.5, // Multiplier for consecutive coins
    magnetRange: 120, // Pixels
    animationSpeed: 3, // Rotation speed
    bobSpeed: 2, // Floating animation speed
    collectRange: 25, // Collection detection range
  },
  powerUpEffects: {
    slowTime: {
      gameSpeedMultiplier: 0.4,
      particleColor: "#9370DB",
      glowColor: "#DDA0DD",
    },
    doubleScore: {
      scoreMultiplier: 2,
      particleColor: "#FFD700",
      glowColor: "#FFFF99",
    },
    magnet: {
      range: 120,
      strength: 300, // Attraction force
      particleColor: "#FF4500",
      glowColor: "#FF6347",
    },
    shield: {
      particleColor: "#4169E1",
      glowColor: "#87CEEB",
      pulseSpeed: 2,
    },
  },
  controls: {
    keyboard: ["Space", "ArrowUp"],
  },
  storageKeys: {
    highScore: "highScore",
    totalCoins: "totalCoins",
    settings: "settings",
    selectedTheme: "selectedTheme",
    selectedSkin: "selectedSkin",
    language: "language",
  },
  themes: {
    "pastel-clouds": {
      colors: {
        primary: "#F0F8FF",
        secondary: "#E6E6FA",
        accent: "#FFB6C1",
        background: "#87CEEB",
        text: "#000000",
      },
      sky: {
        top: "#87CEEB",
        bottom: "#F0F8FF",
      },
      obstacles: {
        primary: "#E6E6FA",
        secondary: "#FFB6C1",
      },
      name: "Pastel Clouds",
    },
    "neon-cyberpunk": {
      colors: {
        primary: "#0D0D0D",
        secondary: "#1A1A2E",
        accent: "#FF1493",
        background: "#0F3460",
        text: "#FFFFFF",
      },
      sky: {
        top: "#0F3460",
        bottom: "#1A1A2E",
      },
      obstacles: {
        primary: "#FF1493",
        secondary: "#0D0D0D",
      },
      name: "Neon Cyberpunk",
    },
    "egyptian-dusk": {
      colors: {
        primary: "#2F1B14",
        secondary: "#8B4513",
        accent: "#DAA520",
        background: "#CD853F",
        text: "#000000",
      },
      sky: {
        top: "#CD853F",
        bottom: "#2F1B14",
      },
      obstacles: {
        primary: "#DAA520",
        secondary: "#8B4513",
      },
      name: "Egyptian Dusk",
    },
    "watercolor-forest": {
      colors: {
        primary: "#F0FFF0",
        secondary: "#98FB98",
        accent: "#32CD32",
        background: "#228B22",
        text: "#FFFFFF",
      },
      sky: {
        top: "#228B22",
        bottom: "#98FB98",
      },
      obstacles: {
        primary: "#32CD32",
        secondary: "#F0FFF0",
      },
      name: "Watercolor Forest",
    },
  },
  parallaxSpeeds: {
    background: 0.05,
  },
}

const TRANSLATIONS = {
  en: {
    play: "Play",
    shop: "Shop",
    settings: "Settings",
    dailyChallenge: "Daily Challenge",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    mainMenu: "Main Menu",
    retry: "Retry",
    changeTheme: "Change Theme",
  },
  ar: {
    play: "لعب",
    shop: "المتجر",
    settings: "الإعدادات",
    dailyChallenge: "تحدي يومي",
    pause: "إيقاف",
    resume: "استئناف",
    restart: "إعادة تشغيل",
    mainMenu: "القائمة الرئيسية",
    retry: "إعادة المحاولة",
    changeTheme: "تغيير الموضوع",
  },
}

class Game {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.gameState = "loading"
    this.lastTime = 0
    this.deltaTime = 0

    // Game objects
    this.player = null
    this.obstacles = []
    this.coins = []
    this.powerUps = []
    this.particles = []

    // Game stats
    this.score = 0
    this.coinsCollected = 0
    this.gameTime = 0
    this.powerUpEffects = {}
    this.coinStreak = 0 // Consecutive coins collected
    this.lastCoinTime = 0 // For streak timing
    this.coinMultiplier = 1 // Current coin value multiplier
    this.powerUpsCollected = 0 // Track power-ups for challenges

    // Input handling
    this.keys = {}
    this.touchStartY = 0
    this.lastJumpTime = 0

    // Assets
    this.assets = {
      images: {},
      sounds: {},
      loaded: 0,
      total: 0,
    }

    this.audioManager = new AudioManager()

    // Settings
    this.currentTheme = "pastel-clouds"
    this.currentSkin = "default"
    this.currentLanguage = "en"
    this.settings = {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      musicEnabled: true,
      sfxEnabled: true,
    }

    // Game timing
    this.lastObstacleSpawn = 0
    this.lastCoinSpawn = 0
    this.lastPowerUpSpawn = 0

    // Initialize the game
    this.init()
  }

  async init() {
    console.log("[v0] Initializing Butterfly Flight game...")

    // Setup canvas
    this.setupCanvas()

    await this.audioManager.initialize()

    // Load saved data
    this.loadGameData()

    // Setup event listeners
    this.setupEventListeners()

    // Load assets
    await this.loadAssets()

    // Initialize UI
    this.initializeUI()

    // Start game loop
    this.gameLoop()

    console.log("[v0] Game initialization complete")
  }

  setupCanvas() {
    this.canvas = document.getElementById("game-canvas")
    this.ctx = this.canvas.getContext("2d")

    // Set canvas size
    this.resizeCanvas()

    // Setup canvas properties
    this.ctx.imageSmoothingEnabled = false
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
  }

  resizeCanvas() {
    const container = document.getElementById("game-container")
    const rect = container.getBoundingClientRect()

    // Set canvas size to fill container
    this.canvas.width = rect.width
    this.canvas.height = rect.height

    // Store dimensions for easy access
    this.width = this.canvas.width
    this.height = this.canvas.height

    console.log(`[v0] Canvas resized to ${this.width}x${this.height}`)
  }

  setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true

      if (CONFIG.controls.keyboard.includes(e.code)) {
        e.preventDefault()
        this.handleJump()
      }

      // Pause with P key
      if (e.code === "KeyP" && this.gameState === "playing") {
        this.pauseGame()
      }
    })

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false
    })

    // Mouse controls
    this.canvas.addEventListener("click", (e) => {
      if (this.gameState === "playing") {
        this.handleJump()
      }
    })

    // Touch controls
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.touchStartY = e.touches[0].clientY

      if (this.gameState === "playing") {
        this.handleJump()
      }
    })

    const resumeAudio = async () => {
      await this.audioManager.resumeAudioContext()
    }

    document.addEventListener("touchstart", resumeAudio, { once: true })
    document.addEventListener("click", resumeAudio, { once: true })

    // Mobile flap button
    const flapBtn = document.getElementById("flap-btn")
    if (flapBtn) {
      flapBtn.addEventListener("touchstart", (e) => {
        e.preventDefault()
        if (this.gameState === "playing") {
          this.handleJump()
        }
      })
    }

    // Window resize
    window.addEventListener("resize", () => {
      this.resizeCanvas()
    })

    // UI Event listeners
    this.setupUIEventListeners()
  }

  setupUIEventListeners() {
    // Main menu buttons
    document.getElementById("play-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.startGame()
    })
    document.getElementById("shop-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.showShop()
    })
    document.getElementById("settings-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.showSettings()
    })
    document.getElementById("daily-challenge-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.showDailyChallenge()
    })

    // Pause menu buttons
    document.getElementById("pause-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.pauseGame()
    })
    document.getElementById("resume-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.resumeGame()
    })
    document.getElementById("restart-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.restartGame()
    })
    document.getElementById("main-menu-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.showMainMenu()
    })

    // Game over buttons
    document.getElementById("retry-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.restartGame()
    })
    document.getElementById("shop-btn-gameover")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.showShop()
    })
    document.getElementById("change-theme-btn")?.addEventListener("click", (event) => {
      this.audioManager.playUIClick()
      this.addRippleEffect(event.target)
      this.showSettings()
    })

    // Close buttons
    document.getElementById("shop-close-btn")?.addEventListener("click", () => {
      this.audioManager.playUIClick()
      this.hideShop()
    })
    document.getElementById("settings-close-btn")?.addEventListener("click", () => {
      this.audioManager.playUIClick()
      this.hideSettings()
    })
    document.getElementById("challenge-close-btn")?.addEventListener("click", () => {
      this.audioManager.playUIClick()
      this.hideDailyChallenge()
    })

    this.setupAudioControls()
    this.setupShopInteractions()
    this.setupThemeSelector()
    this.setupLanguageSelector()
    this.addButtonHoverEffects()
  }

  setupLanguageSelector() {
    const languageSelect = document.getElementById("language-select")
    if (languageSelect) {
      // Populate language options with flags and names
      const languages = this.translationManager.getAvailableLanguages()
      languageSelect.innerHTML = ""

      languages.forEach((lang) => {
        const option = document.createElement("option")
        option.value = lang.code
        option.textContent = `${lang.flag} ${lang.name}`
        if (lang.code === this.translationManager.getCurrentLanguage()) {
          option.selected = true
        }
        languageSelect.appendChild(option)
      })

      // Handle language change with enhanced feedback
      languageSelect.addEventListener("change", (e) => {
        this.audioManager.playUIClick()
        const newLanguage = e.target.value
        const success = translationManager.setLanguage(newLanguage)

        if (success) {
          this.currentLanguage = newLanguage
          this.saveGameData()

          // Show language change notification
          const langConfig = translationManager.getCurrentLanguageConfig()
          this.showNotification(
            `${langConfig.flag} ${translationManager.get("language")} ${translationManager.get("changeTheme")}`,
            "success",
          )

          // Update all UI elements
          this.updateUILanguage()

          // Create language change particles
          this.createParticles(this.width / 2, this.height / 2, "theme-change", 15)
        }
      })
    }
  }

  addRippleEffect(button) {
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = size + "px"
    ripple.style.left = x + "px"
    ripple.style.top = y + "px"
    ripple.classList.add("ripple")

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  setupShopInteractions() {
    // Shop category switching
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.audioManager.playUIClick()
        this.switchShopCategory(e.target.dataset.category)
      })
    })
  }

  switchShopCategory(category) {
    // Update active category button
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-category="${category}"]`).classList.add("active")

    // Update shop items display
    this.updateShopItems(category)
  }

  updateShopItems(category) {
    const shopItems = document.getElementById("shop-items")
    shopItems.innerHTML = ""

    if (category === "skins") {
      this.displaySkinItems(shopItems)
    } else if (category === "themes") {
      this.displayThemeItems(shopItems)
    }
  }

  displaySkinItems(container) {
    const skins = [
      { id: "default", name: "Classic Butterfly", price: 0, owned: true },
      { id: "monarch", name: "Monarch Butterfly", price: 100, owned: false },
      { id: "rainbow", name: "Rainbow Wings", price: 250, owned: false },
      { id: "crystal", name: "Crystal Wings", price: 500, owned: false },
      { id: "fire", name: "Fire Phoenix", price: 750, owned: false },
      { id: "ice", name: "Ice Fairy", price: 1000, owned: false },
    ]

    skins.forEach((skin) => {
      const item = this.createShopItem(skin, "skin")
      container.appendChild(item)
    })
  }

  displayThemeItems(container) {
    const themes = [
      { id: "pastel-clouds", name: "Pastel Clouds", price: 0, owned: true },
      { id: "neon-cyberpunk", name: "Neon Cyberpunk", price: 200, owned: false },
      { id: "egyptian-dusk", name: "Egyptian Dusk", price: 300, owned: false },
      { id: "watercolor-forest", name: "Watercolor Forest", price: 400, owned: false },
    ]

    themes.forEach((theme) => {
      const item = this.createShopItem(theme, "theme")
      container.appendChild(item)
    })
  }

  createShopItem(item, type) {
    const div = document.createElement("div")
    div.className = "shop-item"
    div.innerHTML = `
      <div class="item-preview">
        <canvas class="item-canvas" width="80" height="80"></canvas>
      </div>
      <div class="item-info">
        <h4>${item.name}</h4>
        <div class="item-price">${item.price} 🪙</div>
      </div>
      <button class="item-btn ${item.owned ? "owned" : "buy"}" 
              data-item="${item.id}" data-type="${type}" data-price="${item.price}">
        ${item.owned ? "Owned" : "Buy"}
      </button>
    `

    // Add click handler for purchase/selection
    const btn = div.querySelector(".item-btn")
    btn.addEventListener("click", () => {
      if (item.owned) {
        this.selectItem(item.id, type)
      } else {
        this.purchaseItem(item.id, type, item.price)
      }
    })

    // Generate preview
    this.generateItemPreview(div.querySelector(".item-canvas"), item, type)

    return div
  }

  generateItemPreview(canvas, item, type) {
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, 80, 80)

    if (type === "skin") {
      this.drawButterflyPreview(ctx, item.id)
    } else if (type === "theme") {
      this.drawThemePreview(ctx, item.id)
    }
  }

  drawButterflyPreview(ctx, skinId) {
    // Generate butterfly sprite preview
    const colors = this.getSkinColors(skinId)

    ctx.save()
    ctx.translate(40, 40)

    // Draw butterfly wings
    ctx.fillStyle = colors.primary
    ctx.beginPath()
    ctx.ellipse(-15, -10, 12, 8, -0.3, 0, Math.PI * 2)
    ctx.ellipse(15, -10, 12, 8, 0.3, 0, Math.PI * 2)
    ctx.ellipse(-12, 5, 8, 12, -0.1, 0, Math.PI * 2)
    ctx.ellipse(12, 5, 8, 12, 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Wing patterns
    ctx.fillStyle = colors.secondary
    ctx.beginPath()
    ctx.ellipse(-15, -10, 6, 4, -0.3, 0, Math.PI * 2)
    ctx.ellipse(15, -10, 6, 4, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillStyle = colors.body
    ctx.fillRect(-1, -15, 2, 30)

    ctx.restore()
  }

  drawThemePreview(ctx, themeId) {
    const theme = CONFIG.themes[themeId]

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 80)
    gradient.addColorStop(0, theme.sky.top)
    gradient.addColorStop(1, theme.sky.bottom)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 80, 80)

    // Draw simple obstacle representation
    ctx.fillStyle = theme.obstacles.primary
    ctx.fillRect(10, 0, 15, 30)
    ctx.fillRect(10, 50, 15, 30)
    ctx.fillRect(55, 0, 15, 40)
    ctx.fillRect(55, 60, 15, 20)
  }

  getSkinColors(skinId) {
    const colorSets = {
      default: { primary: "#FF6B9D", secondary: "#4ECDC4", body: "#2C3E50" },
      monarch: { primary: "#FF8C00", secondary: "#000000", body: "#8B4513" },
      rainbow: { primary: "#FF0080", secondary: "#00FF80", body: "#8000FF" },
      crystal: { primary: "#E0E0E0", secondary: "#B0E0E6", body: "#708090" },
      fire: { primary: "#FF4500", secondary: "#FFD700", body: "#8B0000" },
      ice: { primary: "#87CEEB", secondary: "#FFFFFF", body: "#4682B4" },
    }
    return colorSets[skinId] || colorSets.default
  }

  setupThemeSelector() {
    const themeSelect = document.getElementById("theme-select")
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.audioManager.playUIClick()
        this.changeTheme(e.target.value)
      })
    }
  }

  changeTheme(themeId) {
    this.currentTheme = themeId
    this.saveGameData()

    // Apply theme colors to UI
    this.applyThemeToUI(themeId)

    // Show theme change notification
    this.showNotification(`Theme changed to ${CONFIG.themes[themeId].name}`)
  }

  applyThemeToUI(themeId) {
    const theme = CONFIG.themes[themeId]
    const root = document.documentElement

    // Update CSS custom properties
    root.style.setProperty("--theme-primary", theme.obstacles.primary)
    root.style.setProperty("--theme-secondary", theme.obstacles.secondary)
    root.style.setProperty("--theme-sky-top", theme.sky.top)
    root.style.setProperty("--theme-sky-bottom", theme.sky.bottom)
  }

  showNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => notification.classList.add("show"), 100)

    // Remove after duration
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }, duration)
  }

  showScreen(screenId, hideCurrentScreen = true) {
    if (hideCurrentScreen) {
      // Hide current screen
      document.querySelectorAll(".screen:not(.hidden)").forEach((screen) => {
        screen.classList.add("screen-transition-exit")
        setTimeout(() => {
          screen.classList.add("hidden")
          screen.classList.remove("screen-transition-exit")
        }, 300)
      })
    }

    // Show new screen
    setTimeout(
      () => {
        const screen = document.getElementById(screenId)
        if (screen) {
          screen.classList.remove("hidden")
          screen.classList.add("screen-transition-enter")
          setTimeout(() => {
            screen.classList.remove("screen-transition-enter")
          }, 500)
        }
      },
      hideCurrentScreen ? 300 : 0,
    )
  }

  showOverlay(overlayId) {
    const overlay = document.getElementById(overlayId)
    if (overlay) {
      overlay.classList.remove("hidden")
      overlay.classList.add("overlay-transition-enter")
      setTimeout(() => {
        overlay.classList.remove("overlay-transition-enter")
      }, 400)
    }
  }

  hideOverlay(overlayId) {
    const overlay = document.getElementById(overlayId)
    if (overlay) {
      overlay.classList.add("overlay-transition-exit")
      setTimeout(() => {
        overlay.classList.add("hidden")
        overlay.classList.remove("overlay-transition-exit")
      }, 200)
    }
  }

  setupAudioControls() {
    // Music volume control
    const musicVolumeSlider = document.getElementById("music-volume")
    if (musicVolumeSlider) {
      musicVolumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value / 100
        this.audioManager.setMusicVolume(volume)
        this.settings.musicVolume = volume
      })
    }

    // SFX volume control
    const sfxVolumeSlider = document.getElementById("sfx-volume")
    if (sfxVolumeSlider) {
      sfxVolumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value / 100
        this.audioManager.setSFXVolume(volume)
        this.settings.sfxVolume = volume
        // Play test sound
        this.audioManager.playUIClick()
      })
    }

    // Music toggle
    const musicToggle = document.getElementById("music-toggle")
    if (musicToggle) {
      musicToggle.addEventListener("click", () => {
        const enabled = this.audioManager.toggleMusic()
        musicToggle.textContent = enabled ? "🔊" : "🔇"
        musicToggle.classList.toggle("muted", !enabled)
        this.settings.musicEnabled = enabled
      })
    }

    // SFX toggle
    const sfxToggle = document.getElementById("sfx-toggle")
    if (sfxToggle) {
      sfxToggle.addEventListener("click", () => {
        const enabled = this.audioManager.toggleSFX()
        sfxToggle.textContent = enabled ? "🔊" : "🔇"
        sfxToggle.classList.toggle("muted", !enabled)
        this.settings.sfxEnabled = enabled
        if (enabled) this.audioManager.playUIClick()
      })
    }
  }

  addButtonHoverEffects() {
    const buttons = document.querySelectorAll(".menu-btn, .ui-btn, .shop-item-btn, .category-btn")
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        this.audioManager.playUIHover()
      })
    })
  }

  async loadAssets() {
    console.log("[v0] Loading game assets...")

    // Define assets to load
    const imagesToLoad = [
      "butterfly-default",
      "butterfly-monarch",
      "butterfly-blue-morpho",
      "butterfly-rainbow",
      "butterfly-crystal",
      "butterfly-fire",
      "butterfly-ice",
      "butterfly-golden",
      "butterfly-shadow",
      "butterfly-cosmic",
      "pipe-pastel",
      "pipe-neon",
      "pipe-egyptian",
      "pipe-forest",
      "coin",
      "shield",
      "slow-time",
      "double-score",
      "magnet",
      "bg-pastel-1",
      "bg-pastel-2",
      "bg-pastel-3",
      "bg-neon-1",
      "bg-neon-2",
      "bg-neon-3",
      "bg-egyptian-1",
      "bg-egyptian-2",
      "bg-egyptian-3",
      "bg-forest-1",
      "bg-forest-2",
      "bg-forest-3",
    ]

    const soundsToLoad = [
      { name: "flap", options: { duration: 0.2, pooled: true } },
      { name: "coin", options: { duration: 0.4, pooled: true } },
      { name: "powerup", options: { duration: 0.8 } },
      { name: "collision", options: { duration: 0.6 } },
      { name: "theme-change", options: { duration: 1.0 } },
      { name: "ui-click", options: { duration: 0.1, category: "ui", pooled: true } },
      { name: "ui-hover", options: { duration: 0.1, category: "ui", pooled: true } },
      { name: "achievement", options: { duration: 1.5 } },
    ]

    const musicToLoad = [
      { name: "pastel-clouds", options: { duration: 30, volume: 0.4 } },
      { name: "neon-cyberpunk", options: { duration: 30, volume: 0.5 } },
      { name: "egyptian-dusk", options: { duration: 30, volume: 0.45 } },
      { name: "watercolor-forest", options: { duration: 30, volume: 0.4 } },
    ]

    this.assets.total = imagesToLoad.length + soundsToLoad.length + musicToLoad.length

    // Load placeholder images (in a real game, these would be actual image files)
    for (const imageName of imagesToLoad) {
      await this.loadPlaceholderImage(imageName)
    }

    for (const soundConfig of soundsToLoad) {
      await this.audioManager.loadSound(soundConfig.name, null, soundConfig.options)
      this.assets.loaded++
      this.updateLoadingProgress()
    }

    for (const musicConfig of musicToLoad) {
      await this.audioManager.loadMusic(musicConfig.name, musicConfig.options)
      this.assets.loaded++
      this.updateLoadingProgress()
    }

    console.log("[v0] All assets loaded successfully")
    this.gameState = "menu"
    this.showMainMenu()
  }

  async loadPlaceholderImage(name) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (name.includes("butterfly")) {
        canvas.width = CONFIG.playerSize
        canvas.height = CONFIG.playerSize
        this.createButterflySprite(ctx, canvas, name)
      } else if (name.includes("pipe")) {
        canvas.width = CONFIG.pipeWidth
        canvas.height = 200
        this.createPipeSprite(ctx, canvas, name)
      } else if (name === "coin") {
        canvas.width = CONFIG.coinSystem.collectRange
        canvas.height = CONFIG.coinSystem.collectRange
        this.createCoinSprite(ctx, canvas)
      } else if (name.includes("bg-")) {
        canvas.width = this.width || 800
        canvas.height = this.height || 600
        this.createBackgroundSprite(ctx, canvas, name)
      } else {
        // Enhanced power-up sprites
        canvas.width = 30
        canvas.height = 30
        this.createPowerUpSprite(ctx, canvas, name)
      }

      this.assets.images[name] = canvas
      this.assets.loaded++
      this.updateLoadingProgress()
      resolve()
    })
  }

  createButterflySprite(ctx, canvas, name) {
    const colors = this.getButterflyColor(name)
    const isArray = Array.isArray(colors)

    // Create butterfly body
    ctx.fillStyle = isArray ? colors[2] || "#333" : "#333"
    ctx.fillRect(canvas.width / 2 - 2, canvas.height / 4, 4, canvas.height / 2)

    // Create wings with gradients
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    )

    if (isArray) {
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(0.7, colors[1])
      gradient.addColorStop(1, colors[2] || colors[0])
    } else {
      gradient.addColorStop(0, colors)
      gradient.addColorStop(1, this.darkenColor(colors, 0.3))
    }

    ctx.fillStyle = gradient

    // Draw wing shapes
    ctx.beginPath()
    // Upper wings
    ctx.ellipse(canvas.width / 2 - 8, canvas.height / 2 - 5, 12, 8, -0.3, 0, Math.PI * 2)
    ctx.ellipse(canvas.width / 2 + 8, canvas.height / 2 - 5, 12, 8, 0.3, 0, Math.PI * 2)
    // Lower wings
    ctx.ellipse(canvas.width / 2 - 6, canvas.height / 2 + 8, 8, 6, -0.2, 0, Math.PI * 2)
    ctx.ellipse(canvas.width / 2 + 6, canvas.height / 2 + 8, 8, 6, 0.2, 0, Math.PI * 2)
    ctx.fill()

    // Add wing patterns based on butterfly type
    this.addButterflyPattern(ctx, canvas, name)
  }

  addButterflyPattern(ctx, canvas, name) {
    ctx.save()

    switch (name) {
      case "butterfly-monarch":
        // Orange with black veins
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, canvas.height / 4)
        ctx.lineTo(canvas.width / 2 - 10, canvas.height / 2)
        ctx.moveTo(canvas.width / 2, canvas.height / 4)
        ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2)
        ctx.stroke()
        break

      case "butterfly-blue-morpho":
        // Iridescent blue effect
        const blueGradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 3,
        )
        blueGradient.addColorStop(0, "#87CEEB")
        blueGradient.addColorStop(1, "#4169E1")
        ctx.fillStyle = blueGradient
        ctx.beginPath()
        ctx.arc(canvas.width / 2 - 6, canvas.height / 2 - 3, 4, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2 + 6, canvas.height / 2 - 3, 4, 0, Math.PI * 2)
        ctx.fill()
        break

      case "butterfly-rainbow":
        // Rainbow spots
        const rainbowColors = ["#FF0000", "#FF8C00", "#FFD700", "#32CD32", "#4169E1", "#9370DB"]
        rainbowColors.forEach((color, i) => {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(canvas.width / 2 + (i - 2.5) * 3, canvas.height / 2 - 2, 2, 0, Math.PI * 2)
          ctx.fill()
        })
        break

      case "butterfly-crystal":
        // Crystal-like facets
        ctx.strokeStyle = "#FFF"
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2 - 8, canvas.height / 2 - 8)
        ctx.lineTo(canvas.width / 2 + 8, canvas.height / 2 + 8)
        ctx.moveTo(canvas.width / 2 + 8, canvas.height / 2 - 8)
        ctx.lineTo(canvas.width / 2 - 8, canvas.height / 2 + 8)
        ctx.stroke()
        ctx.setLineDash([])
        break

      case "butterfly-cosmic":
        // Star pattern
        ctx.fillStyle = "#FFF"
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5
          const x = canvas.width / 2 + Math.cos(angle) * 8
          const y = canvas.height / 2 + Math.sin(angle) * 6
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
        break
    }

    ctx.restore()
  }

  createPipeSprite(ctx, canvas, name) {
    const baseColor = this.getPipeColor(name)
    const theme = name.split("-")[1]

    // Create gradient based on theme
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, this.lightenColor(baseColor, 0.2))
    gradient.addColorStop(0.5, baseColor)
    gradient.addColorStop(1, this.darkenColor(baseColor, 0.2))

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add theme-specific details
    switch (theme) {
      case "pastel":
        // Soft cloud-like texture
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        for (let i = 0; i < 10; i++) {
          ctx.beginPath()
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 8 + 2, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "neon":
        // Glowing edges
        ctx.strokeStyle = "#00FFFF"
        ctx.lineWidth = 2
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

        // Circuit pattern
        ctx.strokeStyle = "#FFFF00"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(10, 20)
        ctx.lineTo(canvas.width - 10, 20)
        ctx.moveTo(10, canvas.height - 20)
        ctx.lineTo(canvas.width - 10, canvas.height - 20)
        ctx.stroke()
        break

      case "egyptian":
        // Hieroglyph-like patterns
        ctx.fillStyle = "#8B4513"
        ctx.fillRect(5, 30, canvas.width - 10, 10)
        ctx.fillRect(5, 60, canvas.width - 10, 10)
        ctx.fillRect(5, 90, canvas.width - 10, 10)

        // Sand texture
        ctx.fillStyle = "rgba(139, 69, 19, 0.3)"
        for (let i = 0; i < 20; i++) {
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
        }
        break

      case "forest":
        // Wood grain effect
        ctx.strokeStyle = this.darkenColor(baseColor, 0.4)
        ctx.lineWidth = 1
        for (let i = 0; i < canvas.height; i += 8) {
          ctx.beginPath()
          ctx.moveTo(0, i)
          ctx.quadraticCurveTo(canvas.width / 2, i + 4, canvas.width, i)
          ctx.stroke()
        }

        // Moss spots
        ctx.fillStyle = "#90EE90"
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 4 + 1, 0, Math.PI * 2)
          ctx.fill()
        }
        break
    }
  }

  createCoinSprite(ctx, canvas) {
    // Golden gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    )
    gradient.addColorStop(0, "#FFFF99")
    gradient.addColorStop(0.7, "#FFD700")
    gradient.addColorStop(1, "#B8860B")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Inner ring
    ctx.strokeStyle = "#B8860B"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 5, 0, Math.PI * 2)
    ctx.stroke()

    // Center symbol
    ctx.fillStyle = "#B8860B"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("$", canvas.width / 2, canvas.height / 2)
  }

  createBackgroundSprite(ctx, canvas, name) {
    const theme = name.split("-")[1]
    const layer = Number.parseInt(name.split("-")[2])

    switch (theme) {
      case "pastel":
        this.createPastelBackground(ctx, canvas, layer)
        break
      case "neon":
        this.createNeonBackground(ctx, canvas, layer)
        break
      case "egyptian":
        this.createEgyptianBackground(ctx, canvas, layer)
        break
      case "forest":
        this.createForestBackground(ctx, canvas, layer)
        break
    }
  }

  createPastelBackground(ctx, canvas, layer) {
    const colors = this.getBackgroundColors(`bg-pastel-${layer}`)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add clouds based on layer
    if (layer === 1) {
      // Background clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      for (let i = 0; i < 8; i++) {
        this.drawCloud(ctx, Math.random() * canvas.width, (Math.random() * canvas.height) / 2, 40 + Math.random() * 20)
      }
    } else if (layer === 2) {
      // Mid-ground clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      for (let i = 0; i < 5; i++) {
        this.drawCloud(ctx, Math.random() * canvas.width, (Math.random() * canvas.height) / 2, 60 + Math.random() * 30)
      }
    } else {
      // Foreground elements
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      for (let i = 0; i < 3; i++) {
        this.drawCloud(ctx, Math.random() * canvas.width, (Math.random() * canvas.height) / 3, 80 + Math.random() * 40)
      }
    }
  }

  createNeonBackground(ctx, canvas, layer) {
    const colors = this.getBackgroundColors(`bg-neon-${layer}`)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add cyberpunk elements
    if (layer === 1) {
      // Grid pattern
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    } else if (layer === 2) {
      // Neon lines
      ctx.strokeStyle = "#FF1493"
      ctx.lineWidth = 2
      ctx.shadowColor = "#FF1493"
      ctx.shadowBlur = 10
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.stroke()
      }
      ctx.shadowBlur = 0
    }
  }

  createEgyptianBackground(ctx, canvas, layer) {
    const colors = this.getBackgroundColors(`bg-egyptian-${layer}`)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (layer === 1) {
      // Distant pyramids
      ctx.fillStyle = "rgba(139, 69, 19, 0.3)"
      this.drawPyramid(ctx, canvas.width * 0.2, canvas.height * 0.6, 100, 60)
      this.drawPyramid(ctx, canvas.width * 0.7, canvas.height * 0.7, 80, 50)
    } else if (layer === 2) {
      // Sand dunes
      ctx.fillStyle = "rgba(218, 165, 32, 0.4)"
      ctx.beginPath()
      ctx.moveTo(0, canvas.height * 0.8)
      ctx.quadraticCurveTo(canvas.width * 0.3, canvas.height * 0.6, canvas.width * 0.6, canvas.height * 0.8)
      ctx.quadraticCurveTo(canvas.width * 0.8, canvas.height * 0.9, canvas.width, canvas.height * 0.8)
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.fill()
    }
  }

  createForestBackground(ctx, canvas, layer) {
    const colors = this.getBackgroundColors(`bg-forest-${layer}`)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (layer === 1) {
      // Distant trees
      ctx.fillStyle = "rgba(34, 139, 34, 0.3)"
      for (let i = 0; i < 10; i++) {
        this.drawTree(ctx, Math.random() * canvas.width, canvas.height * 0.7, 20 + Math.random() * 30)
      }
    } else if (layer === 2) {
      // Mid-ground trees
      ctx.fillStyle = "rgba(34, 139, 34, 0.5)"
      for (let i = 0; i < 6; i++) {
        this.drawTree(ctx, Math.random() * canvas.width, canvas.height * 0.6, 40 + Math.random() * 40)
      }
    } else {
      // Foreground elements
      ctx.fillStyle = "rgba(34, 139, 34, 0.7)"
      for (let i = 0; i < 3; i++) {
        this.drawTree(ctx, Math.random() * canvas.width, canvas.height * 0.5, 60 + Math.random() * 50)
      }
    }
  }

  createPowerUpSprite(ctx, canvas, name) {
    const baseColor = this.getPowerUpColor(name)

    // Create glowing effect
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    )
    gradient.addColorStop(0, this.lightenColor(baseColor, 0.4))
    gradient.addColorStop(0.7, baseColor)
    gradient.addColorStop(1, this.darkenColor(baseColor, 0.3))

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add glow border
    ctx.strokeStyle = this.lightenColor(baseColor, 0.6)
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)

    // Add icon
    ctx.fillStyle = "white"
    ctx.font = "18px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(this.getPowerUpIcon(name), canvas.width / 2, canvas.height / 2)
  }

  drawCloud(ctx, x, y, size) {
    ctx.beginPath()
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
    ctx.arc(x + size * 0.3, y, size * 0.4, 0, Math.PI * 2)
    ctx.arc(x - size * 0.3, y, size * 0.4, 0, Math.PI * 2)
    ctx.arc(x, y - size * 0.3, size * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  drawPyramid(ctx, x, y, width, height) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width / 2, y - height)
    ctx.lineTo(x + width, y)
    ctx.closePath()
    ctx.fill()
  }

  drawTree(ctx, x, y, height) {
    // Trunk
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x - 5, y, 10, height * 0.3)

    // Leaves
    ctx.fillStyle = "#228B22"
    ctx.beginPath()
    ctx.arc(x, y - height * 0.2, height * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  lightenColor(color, amount) {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(255 * amount)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  darkenColor(color, amount) {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(255 * amount)
    const R = (num >> 16) - amt
    const G = ((num >> 8) & 0x00ff) - amt
    const B = (num & 0x0000ff) - amt
    return (
      "#" + (0x1000000 + (R > 0 ? R : 0) * 0x10000 + (G > 0 ? G : 0) * 0x100 + (B > 0 ? B : 0)).toString(16).slice(1)
    )
  }

  getButterflyColor(name) {
    const colors = {
      "butterfly-default": ["#FF69B4", "#FF1493", "#8B008B"],
      "butterfly-monarch": ["#FF8C00", "#FF4500", "#8B0000"],
      "butterfly-blue-morpho": ["#87CEEB", "#4169E1", "#191970"],
      "butterfly-rainbow": ["#FF0000", "#FF8C00", "#FFD700"],
      "butterfly-crystal": ["#F0F8FF", "#E0E0E0", "#C0C0C0"],
      "butterfly-fire": ["#FF4500", "#DC143C", "#8B0000"],
      "butterfly-ice": ["#E0FFFF", "#87CEEB", "#4682B4"],
      "butterfly-golden": ["#FFFF99", "#FFD700", "#B8860B"],
      "butterfly-shadow": ["#696969", "#2F2F2F", "#000000"],
      "butterfly-cosmic": ["#DDA0DD", "#9370DB", "#4B0082"],
    }
    return colors[name] || ["#FF69B4", "#FF1493", "#8B008B"]
  }

  switchTheme(newTheme) {
    if (this.currentTheme === newTheme) return

    console.log(`[v0] Switching theme from ${this.currentTheme} to ${newTheme}`)

    // Stop current theme music
    this.audioManager.stopMusic(1.0)

    // Update theme
    this.currentTheme = newTheme

    // Apply new theme
    this.applyTheme()

    this.audioManager.playSound("theme-change")

    // Start new theme music if playing
    if (this.gameState === "playing") {
      setTimeout(() => {
        this.audioManager.playMusic(newTheme, { fadeInDuration: 2.0 })
      }, 1000)
    }

    // Save theme preference
    this.saveGameData()

    // Create theme transition particles
    this.createParticles(this.width / 2, this.height / 2, "theme-change", 20)
  }

  applyTheme() {
    document.body.className = `theme-${this.currentTheme}`

    // Update CSS custom properties for dynamic theming
    const themeColors = CONFIG.themes[this.currentTheme]?.colors
    if (themeColors) {
      const root = document.documentElement
      root.style.setProperty("--theme-primary", themeColors.primary)
      root.style.setProperty("--theme-secondary", themeColors.secondary)
      root.style.setProperty("--theme-accent", themeColors.accent)
      root.style.setProperty("--theme-background", themeColors.background)
      root.style.setProperty("--theme-text", themeColors.text)
    }
  }

  spawnCoin(x, y) {
    const coin = {
      x: x + (Math.random() - 0.5) * 60, // Random horizontal offset
      y: y + (Math.random() - 0.5) * 80, // Random vertical offset
      size: CONFIG.coinSystem.collectRange,
      rotation: 0,
      bobOffset: Math.random() * Math.PI * 2, // Random starting bob phase
      collected: false,
      value: CONFIG.coinSystem.baseValue,
      glowIntensity: 0,
      sparkleTimer: 0,
    }

    this.coins.push(coin)
  }

  spawnPowerUp(x, y) {
    const types = ["shield", "slowTime", "doubleScore", "magnet"]
    const type = types[Math.floor(Math.random() * types.length)]

    const powerUp = {
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 100,
      size: 35,
      type: type,
      bobOffset: Math.random() * Math.PI * 2,
      collected: false,
      glowIntensity: 0,
      pulseTimer: 0,
      rotationSpeed: 1 + Math.random() * 2,
    }

    this.powerUps.push(powerUp)
  }

  updateCoins() {
    const speed =
      CONFIG.pipeSpeed * (this.powerUpEffects.slowTime ? CONFIG.powerUpEffects.slowTime.gameSpeedMultiplier : 1)

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i]
      coin.x -= speed * this.deltaTime
      coin.rotation += CONFIG.coinSystem.animationSpeed * this.deltaTime
      coin.bobOffset += CONFIG.coinSystem.bobSpeed * this.deltaTime
      coin.sparkleTimer += this.deltaTime

      // Enhanced magnet effect
      if (this.powerUpEffects.magnet) {
        const dx = this.player.x - coin.x
        const dy = this.player.y - coin.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < CONFIG.powerUpEffects.magnet.range) {
          const force = CONFIG.powerUpEffects.magnet.strength / Math.max(distance, 1)
          coin.x += (dx / distance) * force * this.deltaTime
          coin.y += (dy / distance) * force * this.deltaTime

          // Create magnet particles
          if (Math.random() < 0.3) {
            this.createParticles(coin.x, coin.y, "magnet", 2)
          }
        }
      }

      // Update glow effect
      coin.glowIntensity = 0.5 + Math.sin(coin.sparkleTimer * 4) * 0.3

      // Remove coins that are off-screen
      if (coin.x + coin.size < 0) {
        this.coins.splice(i, 1)
      }
    }
  }

  updatePowerUps() {
    const speed =
      CONFIG.pipeSpeed * (this.powerUpEffects.slowTime ? CONFIG.powerUpEffects.slowTime.gameSpeedMultiplier : 1)

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      powerUp.x -= speed * this.deltaTime
      powerUp.bobOffset += 3 * this.deltaTime
      powerUp.pulseTimer += powerUp.rotationSpeed * this.deltaTime

      // Enhanced floating animation
      powerUp.y += Math.sin(powerUp.bobOffset) * 0.5

      // Pulsing glow effect
      powerUp.glowIntensity = 0.7 + Math.sin(powerUp.pulseTimer * 3) * 0.3

      // Remove power-ups that are off-screen
      if (powerUp.x + powerUp.size < 0) {
        this.powerUps.splice(i, 1)
      }
    }
  }

  checkCollisions() {
    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      if (this.checkRectCollision(this.player, obstacle)) {
        if (!this.powerUpEffects.shield) {
          this.endGame()
          return
        } else {
          // Use shield with enhanced feedback
          delete this.powerUpEffects.shield
          this.createParticles(this.player.x, this.player.y, "shield", CONFIG.particles.collisionParticles)
          this.assets.sounds.powerup?.play()
          console.log("[v0] Shield protected from collision!")

          // Screen shake effect (visual feedback)
          this.createScreenShake()
        }
      }
    }

    // Enhanced coin collision detection
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i]
      if (this.checkCircleCollision(this.player, coin)) {
        this.collectCoin(coin, i)
      }
    }

    // Enhanced power-up collision detection
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      if (this.checkCircleCollision(this.player, powerUp)) {
        this.collectPowerUp(powerUp, i)
      }
    }
  }

  collectCoin(coin, index) {
    this.coins.splice(index, 1)

    // Calculate coin value with streak bonus
    const currentTime = Date.now()
    if (currentTime - this.lastCoinTime < 2000) {
      // 2 second window for streak
      this.coinStreak++
    } else {
      this.coinStreak = 1
    }
    this.lastCoinTime = currentTime

    // Apply streak multiplier
    const streakBonus = Math.min(this.coinStreak * 0.1, 1.0) // Max 100% bonus at 10 streak
    const finalValue = Math.ceil(coin.value * (1 + streakBonus) * this.coinMultiplier)

    this.coinsCollected += finalValue
    this.updateCoinsDisplay()

    this.audioManager.playCoin({
      position: { x: coin.x, y: coin.y },
      listenerPosition: { x: this.player.x, y: this.player.y },
      pitchVariation: 0.1 + this.coinStreak * 0.02, // Higher pitch for streaks
    })

    // Create enhanced particle effects
    this.createParticles(coin.x, coin.y, "coin", CONFIG.particles.coinParticles)

    // Create floating text showing coin value
    this.createFloatingText(coin.x, coin.y, `+${finalValue}`, "#FFD700")

    // Show streak bonus
    if (this.coinStreak > 1) {
      this.createFloatingText(coin.x, coin.y - 20, `${this.coinStreak}x Streak!`, "#FF6347")
    }

    console.log(`[v0] Collected coin worth ${finalValue} (streak: ${this.coinStreak})`)
  }

  collectPowerUp(powerUp, index) {
    this.powerUps.splice(index, 1)
    this.powerUpsCollected++

    this.activatePowerUp(powerUp.type)

    this.audioManager.playPowerUp({
      position: { x: powerUp.x, y: powerUp.y },
      listenerPosition: { x: this.player.x, y: this.player.y },
    })

    // Enhanced particle effects
    this.createParticles(powerUp.x, powerUp.y, "powerup", CONFIG.particles.powerUpParticles)
    x: this.player.x, y
    : this.player.y
    ,
  }
  )

    // Enhanced particle effects\
    this.
  createParticles(powerUp.x, powerUp.y, \"powerup\", CONFIG.particles.powerUpParticles)

  // Create floating text\
  const
  powerUpName = this.getPowerUpName(powerUp.type);
  \
    this.
  createFloatingText(powerUp.x, powerUp.y, powerUpName, CONFIG.powerUpEffects[powerUp.type].glowColor)

  console;
  .
  log(\`[v0] Collected power-up: ${powerUp.type}`)
}
\
  activatePowerUp(
type
)
{
  \
  const currentTime = Date.now()
  \
  switch (type) {
  \
    case "shield":
      \
        this.powerUpEffects.shield = CONFIG.powerUpDurations.shield
        this.createShieldEffect()
  break
  case "slowTime":
      this.powerUpEffects.slowTime = currentTime + CONFIG.powerUpDurations.slowTime
      this.createSlowTimeEffect()
  break
  case "doubleScore":
      this.powerUpEffects.doubleScore = currentTime + CONFIG.powerUpDurations.doubleScore
      this.coinMultiplier = CONFIG.powerUpEffects.doubleScore.scoreMultiplier
      this.createDoubleScoreEffect()
  break
  case "magnet":
      this.powerUpEffects.magnet = currentTime + CONFIG.powerUpDurations.magnet
      this.createMagnetEffect()
  break
}

console.log(`[v0] Activated power-up: ${type}`)
}

createShieldEffect()
{
  // Create shield particles around player
  for (let i = 0; i < 16; i++) {
    \
    const angle = (i / 16) * Math.PI * 2
    const x = this.player.x + Math.cos(angle) * (this.player.size / 2 + 10)
    const y = this.player.y + Math.sin(angle) * (this.player.size / 2 + 10)
    this.createParticles(x, y, "shield", 2)
  }
}

createSlowTimeEffect()
{
  // Create time distortion effect\
  this.createParticles(this.width / 2, this.height / 2, \"slowTime", 30)
}

createDoubleScoreEffect()
{
  // Create golden sparkles\
  this.createParticles(this.player.x, this.player.y, \"doubleScore", 20)
}

createMagnetEffect()
{
  // Create magnetic field visualization\
  this.createParticles(this.player.x, this.player.y, "magnet", 25)
}

updatePowerUpEffects()
{
  const currentTime = Date.now()

  // Check expired power-ups\
  for (const [effect, endTime] of Object.entries(this.powerUpEffects)) {
    if (effect !== "shield" && currentTime > endTime) {
      this.deactivatePowerUp(effect)
      delete this.powerUpEffects[effect]
    }
  }
}

deactivatePowerUp(type)
{
  switch (type) {
    case "doubleScore":
      this.coinMultiplier = 1
      break
      \
      case "slowTime":
        // Create particles to show effect ending
        this.createParticles(this.player.x, this.player.y, "slowTime", 10)
      break
  }

  console.log(`[v0] Power-up effect expired: ${type}`)
}

createParticles(x, y, type, count)
{
  for (let i = 0; i < count; i++) {
    this.particles.push(new Particle(x, y, type))
    \
  }
  \
}

createFloatingText(x, y, text, (type = "score"))
{
  const floatingText = document.createElement("div")
  floatingText.className = \`floating-text ${type}`
  floatingText.textContent = text

  // Adjust position for RTL languages
  const isRTL = this.translationManager.isRTL()
  if (isRTL) {
    floatingText.style.right = `${window.innerWidth - x}px`
  } else {
    floatingText.style.left = `${x}px`
  }
  floatingText.style.top = `${y}px`

  document.body.appendChild(floatingText)

  // Remove after animation
  setTimeout(() => {
    if (floatingText.parentNode) {
      floatingText.parentNode.removeChild(floatingText)
    }
  }, 2000)
}

createScreenShake()
{
  // Simple screen shake implementation
  const shakeIntensity = 5
  \
  const shakeDuration = 200

  // This would be implemented with canvas transform in a real game
  console.log("[v0] Screen shake effect triggered")
}

renderCoins()
{
  const coinImage = this.assets.images.coin

  for (const coin of this.coins) {
    \
    const bobY = coin.y + Math.sin(coin.bobOffset) * 3

    this.ctx.save()
    this.ctx.translate(coin.x, bobY)
    this.ctx.rotate(coin.rotation)

    // Render glow effect
    if (coin.glowIntensity > 0) {
      this.ctx.shadowColor = "#FFD700"
      this.ctx.shadowBlur = 10 * coin.glowIntensity
    }

    if (coinImage) {
      this.ctx.drawImage(coinImage, -coin.size / 2, -coin.size / 2, coin.size, coin.size)
    } else {
      this.ctx.fillStyle = "#FFD700"
      this.ctx.beginPath()
      this.ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // Render sparkle effects
    if (coin.sparkleTimer % 1 < 0.1) {
      this.ctx.fillStyle = "white"
      this.ctx.beginPath()
      this.ctx.arc(coin.size / 4, -coin.size / 4, 2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.restore()
  }
}

renderPowerUps()
{
  for (const powerUp of this.powerUps) {
    \
    const bobY = powerUp.y + Math.sin(powerUp.bobOffset) * 8
    const powerUpImage = this.assets.images[powerUp.type]

    this.ctx.save()
    this.ctx.translate(powerUp.x, bobY)
    this.ctx.rotate(powerUp.pulseTimer * 0.5)

    // Enhanced glow effect
    const glowColor = CONFIG.powerUpEffects[powerUp.type].glowColor
    this.ctx.shadowColor = glowColor
    this.ctx.shadowBlur = 15 * powerUp.glowIntensity

    if (powerUpImage) {
      this.ctx.drawImage(powerUpImage, -powerUp.size / 2, -powerUp.size / 2, powerUp.size, powerUp.size)
    } else {
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type)
      this.ctx.fillRect(-powerUp.size / 2, -powerUp.size / 2, powerUp.size, powerUp.size)
      this.ctx.fillStyle = "white"
      this.ctx.font = "20px Arial"
      this.ctx.fillText(this.getPowerUpIcon(powerUp.type), 0, 0)
    }

    // Render power-up aura
    this.ctx.strokeStyle = glowColor
    this.ctx.lineWidth = 2
    this.ctx.globalAlpha = 0.5 * powerUp.glowIntensity
    this.ctx.beginPath()
    this.ctx.arc(0, 0, powerUp.size / 2 + 5, 0, Math.PI * 2)
    this.ctx.stroke()

    this.ctx.restore()
  }
}

renderPlayer()
{
  if (!this.player) return

  const playerImage = this.assets.images[\`butterfly-${this.currentSkin}`]

  this.ctx.save()
  this.ctx.translate(this.player.x, this.player.y)

  // Rotate based on velocity
  const rotation = Math.max(-0.5, Math.min(0.5, this.player.velocity / 300))
  this.ctx.rotate(rotation)

  // Enhanced shield effect with pulsing
  if (this.powerUpEffects.shield) {
    const pulseIntensity = 0.7 + Math.sin(Date.now() * 0.01) * 0.3
    this.ctx.strokeStyle = CONFIG.powerUpEffects.shield.glowColor
    this.ctx.lineWidth = 3
    this.ctx.globalAlpha = pulseIntensity
    this.ctx.beginPath()
    this.ctx.arc(0, 0, this.player.size / 2 + 8, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.globalAlpha = 1
  }

  // Double score glow effect
  if (this.powerUpEffects.doubleScore) {
    this.ctx.shadowColor = CONFIG.powerUpEffects.doubleScore.glowColor
    this.ctx.shadowBlur = 10
  }

  // Magnet field visualization
  if (this.powerUpEffects.magnet) {
    this.ctx.strokeStyle = CONFIG.powerUpEffects.magnet.glowColor
    this.ctx.lineWidth = 1
    this.ctx.globalAlpha = 0.3
    this.ctx.beginPath()
    this.ctx.arc(0, 0, CONFIG.powerUpEffects.magnet.range, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.globalAlpha = 1
  }

  if (playerImage) {
    this.ctx.drawImage(playerImage, -this.player.size / 2, -this.player.size / 2, this.player.size, this.player.size)
  } else {
    this.ctx.fillStyle = this.getButterflyColor(`butterfly-${this.currentSkin}`)
    this.ctx.fillRect(-this.player.size / 2, -this.player.size / 2, this.player.size, this.player.size)
  }

  this.ctx.restore()
}

getPowerUpName(type)
{
  const names = {
      shield: "Shield",
      slowTime: "Slow Time",
      doubleScore: \"Double Score",
      magnet: "Magnet",
    }
  return names[type] || type
}
\
  getPowerUpColor(name)
{
  \
  const colors = {
    shield: "#4169E1",
    "slow-time": "#9370DB",
    "double-score": "#FFD700",
    magnet: "#FF4500",
  }
  return colors[name] || "#32CD32"
}

getPowerUpIcon(name)
{
  const icons = {
      shield: "🛡",
      "slow-time": "⏰",
      "double-score": "⭐",\
      magnet: "🧲",
    }
  return icons[name] || "?"
}

updateUILanguage()
{
  // Update all translatable elements
  translationManager.updateTranslatableElements()

  // Update dynamic content with proper formatting
  this.updateScoreDisplay()
  this.updateCoinsDisplay()

  // Update shop items if shop is open
  if (this.gameState === "shop") {
    this.updateShopItems("skins") // Refresh current category
  }

  // Apply RTL/LTR specific styling
  this.applyLanguageSpecificStyling()

  this.updateCanvasTextAlignment()
}

applyLanguageSpecificStyling()
{
  const isRTL = translationManager.isRTL()
  const langConfig = translationManager.getCurrentLanguageConfig()

  // Apply RTL class to body
  if (isRTL) {
    document.body.classList.add("rtl")
  } else {
    document.body.classList.remove("rtl")
  }

  // Set document direction and language
  document.documentElement.dir = langConfig.dir
  document.documentElement.lang = translationManager.getCurrentLanguage()

  if (this.ctx) {
    this.ctx.textAlign = isRTL ? "right" : "left"
  }
}

updateCanvasTextAlignment()
{
  if (!this.ctx) return

  const isRTL = translationManager.isRTL()

  // Set default text alignment for game rendering
  this.ctx.textAlign = isRTL ? "right" : "left"
  this.ctx.direction = isRTL ? "rtl" : "ltr"
}

updateScoreDisplay()
{
  const scoreElement = document.getElementById("current-score")
  const finalScoreElement = document.getElementById("final-score")
  const highScoreElement = document.getElementById("high-score-display")

  if (scoreElement) {
    scoreElement.textContent = translationManager.formatNumber(this.score)
    scoreElement.classList.add("number-display")
  }
  if (finalScoreElement) {
    finalScoreElement.textContent = translationManager.formatNumber(this.score)
    finalScoreElement.classList.add("number-display")
  }
  if (highScoreElement) {
    const highScore = Number.parseInt(localStorage.getItem("butterfly-flight-high-score") || "0")
    highScoreElement.textContent = translationManager.formatNumber(highScore)
    highScoreElement.classList.add("number-display")
  }
}

updateCoinsDisplay()
{
  const coinsElement = document.getElementById("current-coins")
  const totalCoinsElement = document.getElementById("total-coins-display")
  const shopCoinsElement = document.getElementById("shop-coins")
  const coinsEarnedElement = document.getElementById("coins-earned")

  const totalCoins = Number.parseInt(localStorage.getItem("butterfly-flight-coins") || "0")

  if (coinsElement) {
    coinsElement.textContent = translationManager.formatNumber(this.coinsCollected)
    coinsElement.classList.add("number-display")
  }
  if (totalCoinsElement) {
    totalCoinsElement.textContent = translationManager.formatNumber(totalCoins)
    totalCoinsElement.classList.add("number-display")
  }
  if (shopCoinsElement) {
    shopCoinsElement.textContent = translationManager.formatNumber(totalCoins)
    shopCoinsElement.classList.add("number-display")
  }
  if (coinsEarnedElement) {
    coinsEarnedElement.textContent = translationManager.formatNumber(this.coinsCollected)
    coinsEarnedElement.classList.add("number-display")
  }
}

showNotification(message, (type = "info"), (duration = 3000))
{
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  // Animate in with RTL consideration
  setTimeout(() => notification.classList.add("show"), 100)

  // Remove after duration
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, duration)
}

createFloatingText(x, y, text, (type = "score"))
{
  const floatingText = document.createElement("div")
  floatingText.className = `floating-text ${type}`
  floatingText.textContent = text

  // Adjust position for RTL languages
  const isRTL = this.translationManager.isRTL()
  if (isRTL) {
    floatingText.style.right = `${window.innerWidth - x}px`
  } else {
    floatingText.style.left = `${x}px`
  }
  floatingText.style.top = `${y}px`

  document.body.appendChild(floatingText)

  // Remove after animation
  setTimeout(() => {
    if (floatingText.parentNode) {
      floatingText.parentNode.removeChild(floatingText)
    }
  }, 2000)
}

loadGameData()
{
  // Load saved language and apply it first
  const savedLanguage = localStorage.getItem("butterfly-flight-language")
  if (savedLanguage && translationManager.setLanguage(savedLanguage)) {
    this.currentLanguage = savedLanguage
  }

  // Load other game data
  this.currentTheme = localStorage.getItem("butterfly-flight-currentTheme") || "pastel-clouds"
  this.currentSkin = localStorage.getItem("butterfly-flight-currentSkin") || "default"

  const savedSettings = localStorage.getItem("butterfly-flight-settings")
  if (savedSettings) {
    this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
  }

  this.audioManager.setMusicVolume(this.settings.musicVolume)
  this.audioManager.setSFXVolume(this.settings.sfxVolume)
  if (!this.settings.musicEnabled) this.audioManager.toggleMusic()
  if (!this.settings.sfxEnabled) this.audioManager.toggleSFX()
}

saveGameData()
{
  const gameData = {
    highScore: Number.parseInt(localStorage.getItem("butterfly-flight-high-score") || "0"),
    totalCoins: Number.parseInt(localStorage.getItem("butterfly-flight-coins") || "0"),
    currentTheme: this.currentTheme,
    currentSkin: this.currentSkin,
    currentLanguage: this.currentLanguage,
    settings: this.settings,
    ownedSkins: JSON.parse(localStorage.getItem("butterfly-flight-owned-skins") || '["default"]'),
    ownedThemes: JSON.parse(localStorage.getItem("butterfly-flight-owned-themes") || '["pastel-clouds"]'),
  }

  // Save individual items
  Object.keys(gameData).forEach((key) => {
    if (typeof gameData[key] === "object") {
      localStorage.setItem(`butterfly-flight-${key}`, JSON.stringify(gameData[key]))
    } else {
      localStorage.setItem(`butterfly-flight-${key}`, gameData[key])
    }
  })

  // Save current language
  localStorage.setItem("butterfly-flight-language", translationManager.getCurrentLanguage())

  this.audioManager.saveSettings()
}
}

class Particle {
  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 200
    this.vy = (Math.random() - 0.5) * 200
    this.life = 1.0
    this.maxLife = 1.0
    this.size = Math.random() * 6 + 2
    this.type = type
    this.color = this.getColor(type)
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 10

    // Type-specific properties
    this.setupTypeProperties(type)
  }

  setupTypeProperties(type) {
    switch (type) {
      case "coin":
        this.color = "#FFD700"
        this.size = Math.random() * 4 + 3
        this.life = 1.5
        this.maxLife = 1.5
        break
      case "powerup":
        this.size = Math.random() * 8 + 4
        this.life = 2.0
        this.maxLife = 2.0
        break
      case "shield":
        this.color = "#87CEEB"
        this.size = Math.random() * 6 + 4
        this.vx *= 0.5
        this.vy *= 0.5
        break
      case "magnet":
        this.color = "#FF6347"
        this.size = Math.random() * 5 + 3
        break
      case "slowTime":
        this.color = "#DDA0DD"
        this.vx *= 0.3
        this.vy *= 0.3
        this.life = 3.0
        this.maxLife = 3.0
        break
      case "doubleScore":
        this.color = "#FFFF99"
        this.size = Math.random() * 7 + 3
        break
    }
  }

  getColor(type) {
    const colors = {
      flap: "#87CEEB",
      coin: "#FFD700",
      powerup: "#FF69B4",
      collision: "#FF4500",
      shield: "#4169E1",
      magnet: "#FF4500",
      slowTime: "#9370DB",
      doubleScore: "#FFD700",
    }
    return colors[type] || "#FFFFFF"
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime
    this.vy += 300 * deltaTime // Gravity on particles
    this.life -= deltaTime * (2 / this.maxLife)
    this.rotation += this.rotationSpeed * deltaTime

    // Fade velocity over time
    this.vx *= 0.98
    this.vy *= 0.98
  }

  render(ctx) {
    const alpha = this.life / this.maxLife
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)

    // Enhanced rendering based on type
    if (this.type === "coin") {
      // Sparkly coin particles
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.size * alpha, 0, Math.PI * 2)
      ctx.fill()

      // Inner sparkle
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(0, 0, (this.size * alpha) / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.type === "shield") {
      // Shield particles with glow
      ctx.shadowColor = this.color
      ctx.shadowBlur = 5
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.size * alpha, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Standard particles
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.size * alpha, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

class FloatingText {
  constructor(config) {
    this.x = config.x
    this.y = config.y
    this.text = config.text
    this.color = config.color
    this.life = config.life
    this.maxLife = config.maxLife
    this.velocity = config.velocity
  }

  update(deltaTime) {
    this.y += this.velocity * deltaTime
    this.life -= deltaTime * 2
  }

  render(ctx) {
    const alpha = this.life / this.maxLife
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = this.color
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.strokeText(this.text, this.x, this.y)
    ctx.fillText(this.text, this.x, this.y)
    ctx.restore()
  }
}

class UIManager {
  constructor(game) {
    this.game = game
    this.setupEventListeners()
  }

  setupLanguageSelector() {
    const languageSelect = document.getElementById("language-select")
    if (languageSelect) {
      // Populate language options
      const languages = this.game.translationManager.getAvailableLanguages()
      languageSelect.innerHTML = ""

      languages.forEach((lang) => {
        const option = document.createElement("option")
        option.value = lang.code
        option.textContent = `${lang.flag} ${lang.name}`
        if (lang.code === this.game.currentLanguage) {
          option.selected = true
        }
        languageSelect.appendChild(option)
      })

      // Handle language change
      languageSelect.addEventListener("change", (e) => {
        this.game.translationManager.setLanguage(e.target.value)
      })
    }
  }
}

class AudioManager {
  constructor() {
    this.audioContext = null
    this.musicGainNode = null
    this.sfxGainNode = null
    this.currentMusic = null
    this.musicVolume = 0.7
    this.sfxVolume = 0.8
    this.musicEnabled = true
    this.sfxEnabled = true
    this.soundBuffers = {}
    this.musicBuffers = {}
    this.soundPools = {}
    this.proceduralSounds = {} // Added procedural sound cache
  }

  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create gain nodes for music and SFX
      this.musicGainNode = this.audioContext.createGain()
      this.sfxGainNode = this.audioContext.createGain()

      // Connect gain nodes to destination
      this.musicGainNode.connect(this.audioContext.destination)
      this.sfxGainNode.connect(this.audioContext.destination)

      // Set initial volumes
      this.setMusicVolume(this.musicVolume)
      this.setSFXVolume(this.sfxVolume)

      console.log("[v0] Audio system initialized successfully")
    } catch (e) {
      console.error("[v0] Web Audio API is not supported in this browser", e)
    }
  }

  async loadSound(name, url = null, options = {}) {
    return new Promise((resolve) => {
      // Try to load from URL first, fallback to procedural generation
      if (url) {
        const fullUrl = `${url}${name}.mp3`
        fetch(fullUrl)
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            this.audioContext.decodeAudioData(
              buffer,
              (decodedBuffer) => {
                this.soundBuffers[name] = decodedBuffer
                if (options.pooled) {
                  this.createSoundPool(name, decodedBuffer, options.poolSize || 5)
                }
                console.log(`[v0] Sound loaded from file: ${name}`)
                resolve()
              },
              (error) => {
                console.warn(`[v0] Failed to decode ${name}, using procedural sound`)
                this.createProceduralSound(name, options)
                resolve()
              },
            )
          })
          .catch(() => {
            console.warn(`[v0] Failed to load ${name}, using procedural sound`)
            this.createProceduralSound(name, options)
            resolve()
          })
      } else {
        // Generate procedural sound directly
        this.createProceduralSound(name, options)
        resolve()
      }
    })
  }

  createProceduralSound(name, options = {}) {
    const duration = options.duration || 0.5
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    switch (name) {
      case "flap":
        // Quick chirp sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 800 - t * 600 // Descending frequency
          const envelope = Math.exp(-t * 8) // Quick decay
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3
        }
        break

      case "coin":
        // Bright ding sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq1 = 1000
          const freq2 = 1500
          const envelope = Math.exp(-t * 3)
          data[i] = (Math.sin(2 * Math.PI * freq1 * t) + Math.sin(2 * Math.PI * freq2 * t)) * envelope * 0.2
        }
        break

      case "powerup":
        // Rising magical sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 400 + t * 800 // Rising frequency
          const envelope = Math.sin((Math.PI * t) / duration) // Bell curve envelope
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25
        }
        break

      case "collision":
        // Harsh crash sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const envelope = Math.exp(-t * 5)
          data[i] = (Math.random() * 2 - 1) * envelope * 0.4 // White noise with decay
        }
        break

      case "ui-click":
        // Short click
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 1200
          const envelope = Math.exp(-t * 20)
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
        }
        break

      case "ui-hover":
        // Soft hover sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 800
          const envelope = Math.exp(-t * 15)
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.1
        }
        break

      case "achievement":
        // Triumphant fanfare
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq1 = 523 // C5
          const freq2 = 659 // E5
          const freq3 = 784 // G5
          const envelope = Math.sin((Math.PI * t) / duration)
          data[i] =
            (Math.sin(2 * Math.PI * freq1 * t) +
              Math.sin(2 * Math.PI * freq2 * t) +
              Math.sin(2 * Math.PI * freq3 * t)) *
            envelope *
            0.15
        }
        break

      case "theme-change":
        // Magical transformation sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 440 + Math.sin(t * 10) * 200 // Wobbling frequency
          const envelope = Math.sin((Math.PI * t) / duration)
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
        }
        break

      default:
        // Generic beep
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 440
          const envelope = Math.exp(-t * 3)
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
        }
    }

    this.soundBuffers[name] = buffer
    this.proceduralSounds[name] = true

    if (options.pooled) {
      this.createSoundPool(name, buffer, options.poolSize || 5)
    }

    console.log(`[v0] Procedural sound generated: ${name}`)
  }

  async loadMusic(name, options = {}) {
    return new Promise((resolve) => {
      const baseUrl = "music/"
      const fullUrl = `${baseUrl}${name}.mp3`

      fetch(fullUrl)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          this.audioContext.decodeAudioData(
            buffer,
            (decodedBuffer) => {
              this.musicBuffers[name] = decodedBuffer
              console.log(`[v0] Music loaded from file: ${name}`)
              resolve()
            },
            (error) => {
              console.warn(`[v0] Failed to decode music ${name}, using procedural music`)
              this.createProceduralMusic(name, options)
              resolve()
            },
          )
        })
        .catch(() => {
          console.warn(`[v0] Failed to load music ${name}, using procedural music`)
          this.createProceduralMusic(name, options)
          resolve()
        })
    })
  }

  createProceduralMusic(name, options = {}) {
    const duration = options.duration || 30
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, length, sampleRate) // Stereo
    const leftData = buffer.getChannelData(0)
    const rightData = buffer.getChannelData(1)

    // Generate ambient music based on theme
    const themes = {
      "pastel-clouds": { baseFreq: 220, harmony: [1, 1.25, 1.5], tempo: 0.5 },
      "neon-cyberpunk": { baseFreq: 110, harmony: [1, 1.33, 1.67], tempo: 0.8 },
      "egyptian-dusk": { baseFreq: 165, harmony: [1, 1.2, 1.4], tempo: 0.6 },
      "watercolor-forest": { baseFreq: 196, harmony: [1, 1.26, 1.58], tempo: 0.4 },
    }

    const theme = themes[name] || themes["pastel-clouds"]

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const phase = t * theme.tempo

      let leftSample = 0
      let rightSample = 0

      // Generate harmonic layers
      theme.harmony.forEach((ratio, index) => {
        const freq = theme.baseFreq * ratio
        const amplitude = 0.1 / (index + 1) // Decreasing amplitude for harmonics
        const wave = Math.sin(2 * Math.PI * freq * t + Math.sin(phase) * 0.5)

        if (index % 2 === 0) {
          leftSample += wave * amplitude
        } else {
          rightSample += wave * amplitude
        }
      })

      // Add subtle ambient noise
      const noise = (Math.random() * 2 - 1) * 0.02
      leftSample += noise
      rightSample += noise

      // Apply gentle envelope
      const envelope = 0.5 + 0.5 * Math.sin(phase * 0.1)
      leftData[i] = leftSample * envelope
      rightData[i] = rightSample * envelope
    }

    this.musicBuffers[name] = buffer
    console.log(`[v0] Procedural music generated: ${name}`)
  }

  playSound(name, options = {}) {
    if (!this.sfxEnabled || !this.soundBuffers[name]) return

    const buffer = this.soundBuffers[name]
    const sourceNode = this.audioContext.createBufferSource()
    sourceNode.buffer = buffer

    // Create audio processing chain
    const gainNode = this.audioContext.createGain()
    const finalNode = gainNode

    // Spatial positioning with enhanced 3D audio
    if (options.position && options.listenerPosition) {
      const pannerNode = this.audioContext.createPanner()
      pannerNode.panningModel = "HRTF"
      pannerNode.distanceModel = "inverse"
      pannerNode.refDistance = 100
      pannerNode.maxDistance = 1000
      pannerNode.rolloffFactor = 1

      const x = (options.position.x - options.listenerPosition.x) / 100
      const y = (options.position.y - options.listenerPosition.y) / 100
      const z = 0

      pannerNode.positionX.setValueAtTime(x, this.audioContext.currentTime)
      pannerNode.positionY.setValueAtTime(y, this.audioContext.currentTime)
      pannerNode.positionZ.setValueAtTime(z, this.audioContext.currentTime)

      sourceNode.connect(pannerNode)
      pannerNode.connect(gainNode)
    } else {
      sourceNode.connect(gainNode)
    }

    // Connect to output
    gainNode.connect(this.sfxGainNode)

    // Set pitch variation
    if (options.pitchVariation) {
      sourceNode.playbackRate.value = 1 + options.pitchVariation
    }

    // Set volume
    const volume = options.volume || 1
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)

    // Start sound
    sourceNode.start(0)

    return sourceNode
  }
}
