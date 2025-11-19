import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Player,
  createDefaultPlayer,
  createPet,
  StorageService,
  STORAGE_KEYS,
  StampTier,
} from '@playground/game-engine';

@Injectable({
  providedIn: 'root',
})
export class PlayerProfileService {
  private storage = inject(StorageService);

  // State signals
  private playersSignal = signal<Player[]>([]);
  private activePlayerIdSignal = signal<string | null>(null);

  // Computed values
  readonly players = this.playersSignal.asReadonly();
  readonly activePlayerId = this.activePlayerIdSignal.asReadonly();

  readonly activePlayer = computed(() => {
    const id = this.activePlayerIdSignal();
    if (!id) return null;
    return this.playersSignal().find((p) => p.id === id) || null;
  });

  readonly hasPlayers = computed(() => this.playersSignal().length > 0);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load players from storage
   */
  private loadFromStorage(): void {
    const players = this.storage.get<Player[]>(STORAGE_KEYS.PLAYERS);
    const activeId = this.storage.get<string>(STORAGE_KEYS.ACTIVE_PLAYER);

    if (players) {
      this.playersSignal.set(players);
    }
    if (activeId) {
      this.activePlayerIdSignal.set(activeId);
    }
  }

  /**
   * Save players to storage
   */
  private saveToStorage(): void {
    this.storage.set(STORAGE_KEYS.PLAYERS, this.playersSignal());
    if (this.activePlayerIdSignal()) {
      this.storage.set(STORAGE_KEYS.ACTIVE_PLAYER, this.activePlayerIdSignal());
    }
  }

  /**
   * Create a new player profile
   */
  createPlayer(name: string): Player {
    const id = `player-${Date.now()}`;
    const player = createDefaultPlayer(name, id);

    // Give starter pet (dog)
    const starterPet = createPet('dog');
    player.pets.push(starterPet);
    player.activePetId = starterPet.id;

    this.playersSignal.update((players) => [...players, player]);
    this.saveToStorage();

    return player;
  }

  /**
   * Select active player
   */
  selectPlayer(playerId: string): void {
    const player = this.playersSignal().find((p) => p.id === playerId);
    if (player) {
      this.activePlayerIdSignal.set(playerId);
      this.saveToStorage();
    }
  }

  /**
   * Update player data
   */
  updatePlayer(playerId: string, updates: Partial<Player>): void {
    this.playersSignal.update((players) =>
      players.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
    );
    this.saveToStorage();
  }

  /**
   * Add XP to player
   */
  addXp(playerId: string, xp: number): void {
    this.playersSignal.update((players) =>
      players.map((p) => {
        if (p.id !== playerId) return p;

        const newTotalXp = p.totalXp + xp;
        const newLevel = this.calculateLevel(newTotalXp);

        return {
          ...p,
          totalXp: newTotalXp,
          currentLevel: newLevel,
        };
      })
    );
    this.saveToStorage();
  }

  /**
   * Add stamp to player's passport with tier
   */
  addStamp(playerId: string, stampId: string, tier: StampTier = 'bronze'): void {
    this.playersSignal.update((players) =>
      players.map((p) => {
        if (p.id !== playerId) return p;

        // Ensure stampTiers exists (for backwards compatibility)
        const stampTiers = p.stampTiers || {};
        const currentTier = stampTiers[stampId];

        // Only update if new tier is better
        const tierRank: Record<StampTier, number> = {
          'gold': 3,
          'silver': 2,
          'bronze': 1,
          'none': 0
        };

        const newTierRank = tierRank[tier];
        const currentTierRank = currentTier ? tierRank[currentTier] : -1;

        if (newTierRank <= currentTierRank) return p;

        return {
          ...p,
          stamps: p.stamps.includes(stampId) ? p.stamps : [...p.stamps, stampId],
          stampTiers: {
            ...stampTiers,
            [stampId]: tier
          }
        };
      })
    );
    this.saveToStorage();
  }

  /**
   * Get stamp tier for a location
   */
  getStampTier(playerId: string, stampId: string): StampTier | null {
    const player = this.playersSignal().find(p => p.id === playerId);
    if (!player) return null;
    return player.stampTiers?.[stampId] || null;
  }

  /**
   * Add artifact to player's collection
   */
  addArtifact(playerId: string, artifactId: string): void {
    this.playersSignal.update((players) =>
      players.map((p) => {
        if (p.id !== playerId) return p;
        if (p.artifacts.includes(artifactId)) return p;

        return {
          ...p,
          artifacts: [...p.artifacts, artifactId],
        };
      })
    );
    this.saveToStorage();
  }

  /**
   * Unlock a new pet for the player
   */
  unlockPet(playerId: string, petSpecies: 'dog' | 'cheetah' | 'eagle' | 'shark'): void {
    this.playersSignal.update((players) =>
      players.map((p) => {
        if (p.id !== playerId) return p;
        if (p.pets.some((pet) => pet.species === petSpecies)) return p;

        const newPet = createPet(petSpecies);
        return {
          ...p,
          pets: [...p.pets, newPet],
        };
      })
    );
    this.saveToStorage();
  }

  /**
   * Update player stats after a challenge
   */
  updateStats(
    playerId: string,
    correct: number,
    total: number,
    timeMs: number
  ): void {
    this.playersSignal.update((players) =>
      players.map((p) => {
        if (p.id !== playerId) return p;

        const newStats = { ...p.stats };
        newStats.totalProblemsAttempted += total;
        newStats.totalProblemsCorrect += correct;
        newStats.totalTimePlayedMs += timeMs;
        newStats.sessionsCompleted += 1;
        newStats.lastPlayedAt = new Date();

        // Update streak
        if (correct === total) {
          newStats.currentStreak += 1;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        } else {
          newStats.currentStreak = 0;
        }

        // Update average response time
        const totalAttempts = newStats.totalProblemsAttempted;
        const avgTime = newStats.averageResponseTimeMs;
        newStats.averageResponseTimeMs =
          (avgTime * (totalAttempts - total) + timeMs) / totalAttempts;

        return {
          ...p,
          stats: newStats,
        };
      })
    );
    this.saveToStorage();
  }

  /**
   * Delete a player profile
   */
  deletePlayer(playerId: string): void {
    this.playersSignal.update((players) => players.filter((p) => p.id !== playerId));

    if (this.activePlayerIdSignal() === playerId) {
      const remaining = this.playersSignal();
      this.activePlayerIdSignal.set(remaining.length > 0 ? remaining[0].id : null);
    }

    this.saveToStorage();
  }

  /**
   * Calculate player level from XP
   */
  private calculateLevel(xp: number): number {
    // Simple level formula: level = sqrt(xp / 100)
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Clear active player selection
   */
  clearActivePlayer(): void {
    this.activePlayerIdSignal.set(null);
    this.storage.remove(STORAGE_KEYS.ACTIVE_PLAYER);
  }
}
