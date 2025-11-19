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
  private audioContext: AudioContext | null = null;
  private soundBuffers: Map<string, AudioBuffer> = new Map();

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
   * Initialize audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new AudioContext();
      await this.preloadSounds();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  /**
   * Preload all sound effects
   */
  private async preloadSounds(): Promise<void> {
    if (!this.audioContext) return;

    const loadPromises = Object.entries(this.soundFiles).map(
      async ([name, path]) => {
        try {
          const response = await fetch(path);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext?.decodeAudioData(arrayBuffer);
          if (!audioBuffer) return;
          this.soundBuffers.set(name, audioBuffer);
        } catch (error) {
          console.warn(`Failed to load sound: ${name}`, error);
        }
      }
    );

    await Promise.all(loadPromises);
  }

  /**
   * Play a sound effect
   */
  play(effect: SoundEffect): void {
    if (!this.sfxEnabledSignal() || !this.audioContext) return;

    const buffer = this.soundBuffers.get(effect);
    if (!buffer) {
      console.warn(`Sound not loaded: ${effect}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.volumeSignal();

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
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

  /**
   * Resume audio context (needed after user interaction)
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}
