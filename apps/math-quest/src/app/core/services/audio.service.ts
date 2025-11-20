import { Injectable, signal } from '@angular/core';

export type SoundEffect =
  | 'correct'
  | 'incorrect'
  | 'levelUp'
  | 'unlock'
  | 'click'
  | 'complete'
  | 'stamp';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private initialized = false;

  // Settings
  private sfxEnabledSignal = signal<boolean>(true);
  private musicEnabledSignal = signal<boolean>(true);
  private volumeSignal = signal<number>(0.7);

  readonly sfxEnabled = this.sfxEnabledSignal.asReadonly();
  readonly musicEnabled = this.musicEnabledSignal.asReadonly();
  readonly volume = this.volumeSignal.asReadonly();

  // Sound effect file mappings
  private readonly soundFiles: Record<SoundEffect, string> = {
    correct: 'assets/audio/sfx/correct.mp3',
    incorrect: 'assets/audio/sfx/incorrect.mp3',
    levelUp: 'assets/audio/sfx/level-up.mp3',
    unlock: 'assets/audio/sfx/unlock.mp3',
    click: 'assets/audio/sfx/click.mp3',
    complete: 'assets/audio/sfx/complete.mp3',
    stamp: 'assets/audio/sfx/stamp.mp3',
  };

  /**
   * Initialize audio (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Preload all sounds
      Object.entries(this.soundFiles).forEach(([name, path]) => {
        const audio = new Audio(path);
        audio.volume = this.volumeSignal();
        audio.preload = 'auto';
        this.sounds.set(name as SoundEffect, audio);
      });

      this.initialized = true;
      console.log('Audio initialized successfully');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  /**
   * Play a sound effect
   */
  play(effect: SoundEffect): void {
    if (!this.sfxEnabledSignal()) return;

    // Auto-initialize if not done yet
    if (!this.initialized) {
      this.initialize();
    }

    const audio = this.sounds.get(effect);
    if (!audio) {
      console.warn(`Sound not loaded: ${effect}`);
      return;
    }

    try {
      // Reset and play
      audio.currentTime = 0;
      audio.volume = this.volumeSignal();
      audio.play().catch(error => {
        console.warn(`Failed to play sound: ${effect}`, error);
      });
    } catch (error) {
      console.warn(`Failed to play sound: ${effect}`, error);
    }
  }

  /**
   * Toggle sound effects
   */
  toggleSfx(): void {
    this.sfxEnabledSignal.update((v) => !v);
  }

  /**
   * Toggle music
   */
  toggleMusic(): void {
    this.musicEnabledSignal.update((v) => !v);
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.volumeSignal.set(Math.max(0, Math.min(1, volume)));
  }

  /**
   * Enable/disable all sound
   */
  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabledSignal.set(enabled);
  }
}
