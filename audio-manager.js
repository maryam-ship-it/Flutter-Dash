// Advanced Audio Management System for Butterfly Flight
// Handles all sound effects, music, spatial audio, and audio optimization

class AudioManager {
  constructor() {
    this.audioContext = null
    this.masterGain = null
    this.musicGain = null
    this.sfxGain = null
    this.sounds = new Map()
    this.music = new Map()
    this.currentMusic = null
    this.isInitialized = false
    this.settings = {
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      musicEnabled: true,
      sfxEnabled: true,
    }
    this.fadeTimers = new Map()
    this.spatialSounds = new Map()
    this.compressionEnabled = true
    this.reverbEnabled = true

    // Audio pools for performance
    this.audioPool = new Map()
    this.maxPoolSize = 10

    // Load settings from localStorage
    this.loadSettings()
  }

  async initialize() {
    if (this.isInitialized) return true

    try {
      // Create audio context with optimal settings
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: "interactive",
        sampleRate: 44100,
      })

      // Create master gain node
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = this.settings.masterVolume

      // Create separate gain nodes for music and SFX
      this.musicGain = this.audioContext.createGain()
      this.musicGain.connect(this.masterGain)
      this.musicGain.gain.value = this.settings.musicEnabled ? this.settings.musicVolume : 0

      this.sfxGain = this.audioContext.createGain()
      this.sfxGain.connect(this.masterGain)
      this.sfxGain.gain.value = this.settings.sfxEnabled ? this.settings.sfxVolume : 0

      // Setup audio processing effects
      await this.setupAudioEffects()

      this.isInitialized = true
      console.log("[v0] Audio system initialized successfully")
      return true
    } catch (error) {
      console.error("[v0] Failed to initialize audio system:", error)
      return false
    }
  }

  async setupAudioEffects() {
    // Create reverb effect for ambient sounds
    if (this.reverbEnabled) {
      this.reverbNode = await this.createReverbNode()
    }

    // Create compressor for dynamic range control
    if (this.compressionEnabled) {
      this.compressor = this.audioContext.createDynamicsCompressor()
      this.compressor.threshold.value = -24
      this.compressor.knee.value = 30
      this.compressor.ratio.value = 12
      this.compressor.attack.value = 0.003
      this.compressor.release.value = 0.25

      this.masterGain.disconnect()
      this.masterGain.connect(this.compressor)
      this.compressor.connect(this.audioContext.destination)
    }
  }

  async createReverbNode() {
    const convolver = this.audioContext.createConvolver()

    // Create impulse response for reverb
    const length = this.audioContext.sampleRate * 2 // 2 seconds
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2)
        channelData[i] = (Math.random() * 2 - 1) * decay * 0.1
      }
    }

    convolver.buffer = impulse
    return convolver
  }

  async loadSound(name, url, options = {}) {
    if (this.sounds.has(name)) return this.sounds.get(name)

    try {
      // For demo purposes, create procedural audio
      const audioBuffer = await this.createProceduralSound(name, options)

      const soundData = {
        buffer: audioBuffer,
        volume: options.volume || 1.0,
        loop: options.loop || false,
        spatial: options.spatial || false,
        category: options.category || "sfx",
        variations: options.variations || 1,
      }

      this.sounds.set(name, soundData)

      // Create audio pool for frequently used sounds
      if (options.pooled) {
        this.createAudioPool(name, soundData)
      }

      console.log(`[v0] Loaded sound: ${name}`)
      return soundData
    } catch (error) {
      console.error(`[v0] Failed to load sound ${name}:`, error)
      return null
    }
  }

  async createProceduralSound(name, options) {
    const duration = options.duration || 0.5
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    switch (name) {
      case "flap":
        this.generateFlapSound(data, sampleRate, duration)
        break
      case "coin":
        this.generateCoinSound(data, sampleRate, duration)
        break
      case "powerup":
        this.generatePowerUpSound(data, sampleRate, duration)
        break
      case "collision":
        this.generateCollisionSound(data, sampleRate, duration)
        break
      case "theme-change":
        this.generateThemeChangeSound(data, sampleRate, duration)
        break
      case "ui-click":
        this.generateUIClickSound(data, sampleRate, duration)
        break
      case "ui-hover":
        this.generateUIHoverSound(data, sampleRate, duration)
        break
      case "achievement":
        this.generateAchievementSound(data, sampleRate, duration)
        break
      default:
        this.generateDefaultSound(data, sampleRate, duration)
    }

    return buffer
  }

  generateFlapSound(data, sampleRate, duration) {
    // Wing flap sound with frequency sweep
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 8) * (1 - t / duration)
      const frequency = 200 + 100 * Math.exp(-t * 10)
      const noise = (Math.random() - 0.5) * 0.3
      data[i] = (Math.sin(2 * Math.PI * frequency * t) * 0.7 + noise) * envelope * 0.3
    }
  }

  generateCoinSound(data, sampleRate, duration) {
    // Bright, sparkly coin collection sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 3) * Math.sin((Math.PI * t) / duration)
      const freq1 = 800 * (1 + 0.1 * Math.sin(2 * Math.PI * 5 * t))
      const freq2 = 1200 * (1 + 0.1 * Math.sin(2 * Math.PI * 7 * t))
      const harmonics = Math.sin(2 * Math.PI * freq1 * t) + 0.5 * Math.sin(2 * Math.PI * freq2 * t)
      data[i] = harmonics * envelope * 0.4
    }
  }

  generatePowerUpSound(data, sampleRate, duration) {
    // Magical power-up sound with ascending tones
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.sin((Math.PI * t) / duration) * Math.exp(-t * 2)
      const frequency = 400 + 600 * (t / duration)
      const harmonics =
        Math.sin(2 * Math.PI * frequency * t) +
        0.5 * Math.sin(2 * Math.PI * frequency * 2 * t) +
        0.25 * Math.sin(2 * Math.PI * frequency * 3 * t)
      data[i] = harmonics * envelope * 0.35
    }
  }

  generateCollisionSound(data, sampleRate, duration) {
    // Impact sound with noise burst
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 15) * (1 - Math.pow(t / duration, 2))
      const noise = (Math.random() - 0.5) * 2
      const lowFreq = Math.sin(2 * Math.PI * 80 * t) * 0.5
      data[i] = (noise * 0.7 + lowFreq) * envelope * 0.6
    }
  }

  generateThemeChangeSound(data, sampleRate, duration) {
    // Whoosh sound for theme transitions
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.sin((Math.PI * t) / duration) * Math.exp(-t * 1)
      const frequency = 200 + 400 * Math.sin((Math.PI * t) / duration)
      const noise = (Math.random() - 0.5) * 0.4
      data[i] = (Math.sin(2 * Math.PI * frequency * t) * 0.6 + noise) * envelope * 0.4
    }
  }

  generateUIClickSound(data, sampleRate, duration) {
    // Short, crisp UI click
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 20)
      const frequency = 1000
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2
    }
  }

  generateUIHoverSound(data, sampleRate, duration) {
    // Subtle UI hover sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 10) * Math.sin((Math.PI * t) / duration)
      const frequency = 600
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1
    }
  }

  generateAchievementSound(data, sampleRate, duration) {
    // Triumphant achievement sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.sin((Math.PI * t) / duration) * Math.exp(-t * 1.5)
      const freq1 = 523.25 // C5
      const freq2 = 659.25 // E5
      const freq3 = 783.99 // G5
      const chord =
        Math.sin(2 * Math.PI * freq1 * t) + Math.sin(2 * Math.PI * freq2 * t) + Math.sin(2 * Math.PI * freq3 * t)
      data[i] = chord * envelope * 0.25
    }
  }

  generateDefaultSound(data, sampleRate, duration) {
    // Generic beep sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 5) * Math.sin((Math.PI * t) / duration)
      data[i] = Math.sin(2 * Math.PI * 440 * t) * envelope * 0.3
    }
  }

  async loadMusic(name, options = {}) {
    if (this.music.has(name)) return this.music.get(name)

    try {
      // Create procedural background music
      const musicBuffer = await this.createProceduralMusic(name, options)

      const musicData = {
        buffer: musicBuffer,
        volume: options.volume || 0.5,
        loop: true,
        fadeInDuration: options.fadeInDuration || 2.0,
        fadeOutDuration: options.fadeOutDuration || 1.5,
      }

      this.music.set(name, musicData)
      console.log(`[v0] Loaded music: ${name}`)
      return musicData
    } catch (error) {
      console.error(`[v0] Failed to load music ${name}:`, error)
      return null
    }
  }

  async createProceduralMusic(name, options) {
    const duration = options.duration || 30 // 30 seconds loop
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, length, sampleRate) // Stereo

    const leftChannel = buffer.getChannelData(0)
    const rightChannel = buffer.getChannelData(1)

    switch (name) {
      case "pastel-clouds":
        this.generatePastelCloudsMusic(leftChannel, rightChannel, sampleRate, duration)
        break
      case "neon-cyberpunk":
        this.generateNeonCyberpunkMusic(leftChannel, rightChannel, sampleRate, duration)
        break
      case "egyptian-dusk":
        this.generateEgyptianDuskMusic(leftChannel, rightChannel, sampleRate, duration)
        break
      case "watercolor-forest":
        this.generateWatercolorForestMusic(leftChannel, rightChannel, sampleRate, duration)
        break
      default:
        this.generateDefaultMusic(leftChannel, rightChannel, sampleRate, duration)
    }

    return buffer
  }

  generatePastelCloudsMusic(left, right, sampleRate, duration) {
    // Dreamy, ambient music with soft pads
    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate
      const progress = (t % duration) / duration

      // Soft pad chords
      const chord1 = Math.sin(2 * Math.PI * 261.63 * t) * 0.3 // C4
      const chord2 = Math.sin(2 * Math.PI * 329.63 * t) * 0.25 // E4
      const chord3 = Math.sin(2 * Math.PI * 392.0 * t) * 0.2 // G4

      // Gentle melody
      const melodyFreq = 523.25 + 100 * Math.sin(2 * Math.PI * progress * 0.5)
      const melody = Math.sin(2 * Math.PI * melodyFreq * t) * 0.15

      // Ambient texture
      const ambient = (Math.random() - 0.5) * 0.05

      const signal = (chord1 + chord2 + chord3 + melody + ambient) * 0.4

      left[i] = signal
      right[i] = signal * 0.9 // Slight stereo separation
    }
  }

  generateNeonCyberpunkMusic(left, right, sampleRate, duration) {
    // Electronic, pulsing cyberpunk music
    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate
      const progress = (t % duration) / duration

      // Bass line
      const bassFreq = 65.41 // C2
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.4

      // Synth lead
      const leadFreq = 523.25 + 200 * Math.sin(2 * Math.PI * progress * 2)
      const lead = Math.sin(2 * Math.PI * leadFreq * t) * 0.3

      // Pulse rhythm
      const pulse = Math.sin(2 * Math.PI * 4 * t) > 0 ? 0.2 : 0

      // Noise texture
      const noise = (Math.random() - 0.5) * 0.1

      const signal = bass + lead + pulse + noise

      left[i] = signal * 0.5
      right[i] = signal * 0.5
    }
  }

  generateEgyptianDuskMusic(left, right, sampleRate, duration) {
    // Mysterious, middle-eastern inspired music
    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate
      const progress = (t % duration) / duration

      // Pentatonic scale melody
      const scale = [220, 246.94, 277.18, 329.63, 369.99] // A3 pentatonic
      const noteIndex = Math.floor(progress * scale.length * 4) % scale.length
      const melodyFreq = scale[noteIndex]
      const melody = Math.sin(2 * Math.PI * melodyFreq * t) * 0.3

      // Drone bass
      const drone = Math.sin(2 * Math.PI * 110 * t) * 0.2

      // Percussion-like rhythm
      const rhythm = Math.sin(2 * Math.PI * 2 * t) > 0.8 ? 0.1 : 0

      const signal = melody + drone + rhythm

      left[i] = signal * 0.6
      right[i] = signal * 0.55
    }
  }

  generateWatercolorForestMusic(left, right, sampleRate, duration) {
    // Natural, organic forest sounds with gentle melodies
    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate
      const progress = (t % duration) / duration

      // Nature-inspired harmonics
      const freq1 = 174.61 + 50 * Math.sin(2 * Math.PI * progress * 0.3) // F3
      const freq2 = 220 + 30 * Math.sin(2 * Math.PI * progress * 0.5) // A3
      const harmony = Math.sin(2 * Math.PI * freq1 * t) * 0.25 + Math.sin(2 * Math.PI * freq2 * t) * 0.2

      // Wind-like texture
      const wind = (Math.random() - 0.5) * 0.1 * Math.sin(2 * Math.PI * 0.1 * t)

      // Bird-like chirps
      const chirp = Math.random() < 0.001 ? Math.sin(2 * Math.PI * 1000 * t) * 0.1 : 0

      const signal = harmony + wind + chirp

      left[i] = signal * 0.5
      right[i] = signal * 0.45
    }
  }

  generateDefaultMusic(left, right, sampleRate, duration) {
    // Simple ambient music
    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate
      const signal = Math.sin(2 * Math.PI * 440 * t) * 0.1 + Math.sin(2 * Math.PI * 554.37 * t) * 0.08
      left[i] = signal
      right[i] = signal
    }
  }

  createAudioPool(soundName, soundData) {
    const pool = []
    for (let i = 0; i < this.maxPoolSize; i++) {
      pool.push({
        source: null,
        inUse: false,
      })
    }
    this.audioPool.set(soundName, pool)
  }

  getPooledAudioSource(soundName) {
    const pool = this.audioPool.get(soundName)
    if (!pool) return null

    // Find available source
    for (const item of pool) {
      if (!item.inUse) {
        item.inUse = true
        return item
      }
    }

    // All sources in use, return first one (will interrupt)
    return pool[0]
  }

  releasePooledAudioSource(soundName, poolItem) {
    poolItem.inUse = false
    if (poolItem.source) {
      poolItem.source.disconnect()
      poolItem.source = null
    }
  }

  playSound(name, options = {}) {
    if (!this.isInitialized || !this.settings.sfxEnabled) return null

    const soundData = this.sounds.get(name)
    if (!soundData) {
      console.warn(`[v0] Sound not found: ${name}`)
      return null
    }

    try {
      let source, gainNode

      // Use pooled audio if available
      if (this.audioPool.has(name)) {
        const poolItem = this.getPooledAudioSource(name)
        if (poolItem.source) {
          poolItem.source.stop()
        }

        source = this.audioContext.createBufferSource()
        poolItem.source = source

        // Auto-release when finished
        source.onended = () => {
          this.releasePooledAudioSource(name, poolItem)
        }
      } else {
        source = this.audioContext.createBufferSource()
      }

      source.buffer = soundData.buffer
      source.loop = soundData.loop

      // Create gain node for volume control
      gainNode = this.audioContext.createGain()
      const volume = (options.volume || soundData.volume) * this.settings.sfxVolume
      gainNode.gain.value = volume

      // Spatial audio setup
      if (soundData.spatial && options.position) {
        const panner = this.createSpatialAudio(options.position, options.listenerPosition)
        source.connect(panner)
        panner.connect(gainNode)
      } else {
        source.connect(gainNode)
      }

      // Connect to appropriate output
      if (soundData.category === "ui") {
        gainNode.connect(this.masterGain)
      } else {
        gainNode.connect(this.sfxGain)
      }

      // Playback rate variation for variety
      if (options.pitchVariation) {
        source.playbackRate.value = 1 + (Math.random() - 0.5) * options.pitchVariation
      }

      source.start(0)

      console.log(`[v0] Playing sound: ${name}`)
      return { source, gainNode }
    } catch (error) {
      console.error(`[v0] Error playing sound ${name}:`, error)
      return null
    }
  }

  createSpatialAudio(soundPosition, listenerPosition = { x: 0, y: 0 }) {
    const panner = this.audioContext.createPanner()

    // Configure 3D audio
    panner.panningModel = "HRTF"
    panner.distanceModel = "inverse"
    panner.refDistance = 100
    panner.maxDistance = 1000
    panner.rolloffFactor = 1
    panner.coneInnerAngle = 360
    panner.coneOuterAngle = 0
    panner.coneOuterGain = 0

    // Set positions (convert 2D to 3D)
    panner.setPosition(soundPosition.x, soundPosition.y, 0)

    // Update listener position
    if (this.audioContext.listener.setPosition) {
      this.audioContext.listener.setPosition(listenerPosition.x, listenerPosition.y, 0)
    }

    return panner
  }

  async playMusic(name, options = {}) {
    if (!this.isInitialized || !this.settings.musicEnabled) return null

    // Stop current music
    if (this.currentMusic) {
      await this.stopMusic(options.fadeOutDuration || 1.0)
    }

    const musicData = this.music.get(name)
    if (!musicData) {
      console.warn(`[v0] Music not found: ${name}`)
      return null
    }

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = musicData.buffer
      source.loop = musicData.loop

      // Start with zero volume for fade-in
      gainNode.gain.value = 0

      source.connect(gainNode)
      gainNode.connect(this.musicGain)

      // Add reverb if enabled
      if (this.reverbNode && options.reverb !== false) {
        const reverbGain = this.audioContext.createGain()
        reverbGain.gain.value = 0.2
        gainNode.connect(this.reverbNode)
        this.reverbNode.connect(reverbGain)
        reverbGain.connect(this.musicGain)
      }

      source.start(0)

      // Fade in
      const fadeInDuration = options.fadeInDuration || musicData.fadeInDuration
      gainNode.gain.linearRampToValueAtTime(
        musicData.volume * this.settings.musicVolume,
        this.audioContext.currentTime + fadeInDuration,
      )

      this.currentMusic = { source, gainNode, name, musicData }

      console.log(`[v0] Playing music: ${name}`)
      return this.currentMusic
    } catch (error) {
      console.error(`[v0] Error playing music ${name}:`, error)
      return null
    }
  }

  async stopMusic(fadeOutDuration = 1.0) {
    if (!this.currentMusic) return

    try {
      const { source, gainNode } = this.currentMusic

      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOutDuration)

      // Stop after fade
      setTimeout(() => {
        source.stop()
        source.disconnect()
        gainNode.disconnect()
      }, fadeOutDuration * 1000)

      console.log(`[v0] Stopping music: ${this.currentMusic.name}`)
      this.currentMusic = null
    } catch (error) {
      console.error("[v0] Error stopping music:", error)
    }
  }

  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume
    }
    this.saveSettings()
  }

  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicEnabled ? this.settings.musicVolume : 0
    }
    this.saveSettings()
  }

  setSFXVolume(volume) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume))
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.sfxEnabled ? this.settings.sfxVolume : 0
    }
    this.saveSettings()
  }

  toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicEnabled ? this.settings.musicVolume : 0
    }
    this.saveSettings()
    return this.settings.musicEnabled
  }

  toggleSFX() {
    this.settings.sfxEnabled = !this.settings.sfxEnabled
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.sfxEnabled ? this.settings.sfxVolume : 0
    }
    this.saveSettings()
    return this.settings.sfxEnabled
  }

  // Convenience methods for common game sounds
  playFlap(options = {}) {
    return this.playSound("flap", { ...options, pitchVariation: 0.1 })
  }

  playCoin(options = {}) {
    return this.playSound("coin", { ...options, pitchVariation: 0.05 })
  }

  playPowerUp(options = {}) {
    return this.playSound("powerup", options)
  }

  playCollision(options = {}) {
    return this.playSound("collision", options)
  }

  playUIClick() {
    return this.playSound("ui-click", { category: "ui" })
  }

  playUIHover() {
    return this.playSound("ui-hover", { category: "ui" })
  }

  playAchievement() {
    return this.playSound("achievement", { volume: 0.8 })
  }

  // Audio context management for mobile browsers
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume()
      console.log("[v0] Audio context resumed")
    }
  }

  // Settings persistence
  saveSettings() {
    localStorage.setItem("butterfly-flight-audio-settings", JSON.stringify(this.settings))
  }

  loadSettings() {
    const saved = localStorage.getItem("butterfly-flight-audio-settings")
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) }
    }
  }

  // Cleanup
  destroy() {
    if (this.currentMusic) {
      this.stopMusic(0)
    }

    // Clear all timers
    this.fadeTimers.forEach((timer) => clearTimeout(timer))
    this.fadeTimers.clear()

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close()
    }

    console.log("[v0] Audio manager destroyed")
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AudioManager
}
