/**
 * Football Director - Player Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerStore, playerSelectors } from './playerStore';
import { useGameStore } from './gameStore';
import type { Player, GameState } from '@playground/football-director-engine';

// Mock player
const mockPlayer: Player = {
  id: 'player-1',
  name: 'Test Player',
  age: 25,
  position: 'midfielder',
  skill: 70,
  potential: 85,
  morale: 75,
  nationality: 'England',
  contract: {
    wage: 2,
    weeksRemaining: 52,
    bonuses: 0,
  },
  stats: {
    goals: 5,
    assists: 3,
    appearances: 20,
    yellowCards: 2,
    redCards: 0,
    averageRating: 7.2,
  },
  injury: null,
} as Player;

const mockGameState: Partial<GameState> = {
  id: 'game-123',
  playerTeam: {
    id: 'team-1',
    name: 'Test FC',
    budget: 50,
    players: [mockPlayer],
    staff: [],
    tactics: {} as any,
  },
  teams: [],
  freeAgents: [],
} as GameState;

describe('PlayerStore', () => {
  beforeEach(() => {
    // Reset stores before each test
    usePlayerStore.getState().syncFromGameState();
    useGameStore.setState({ gameState: null, gameId: null, currentSaveSlot: null, lastSaved: null });
  });

  describe('Sync from GameStore', () => {
    it('should sync players from game state', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
        result.current.syncFromGameState();
      });

      expect(result.current.squadPlayers).toHaveLength(1);
      expect(result.current.squadPlayers[0].name).toBe('Test Player');
    });

    it('should clear state when no game', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.syncFromGameState();
      });

      expect(result.current.squadPlayers).toHaveLength(0);
      expect(result.current.allPlayers).toHaveLength(0);
    });
  });

  describe('Player CRUD Operations', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should add player to squad', () => {
      const { result } = renderHook(() => usePlayerStore());

      const newPlayer: Player = {
        ...mockPlayer,
        id: 'player-2',
        name: 'New Player',
      };

      act(() => {
        result.current.addPlayer(newPlayer);
      });

      expect(result.current.squadPlayers).toHaveLength(2);
      expect(result.current.squadPlayers[1].name).toBe('New Player');
    });

    it('should remove player from squad', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.removePlayer('player-1');
      });

      expect(result.current.squadPlayers).toHaveLength(0);
    });

    it('should update player', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayer('player-1', { age: 26, skill: 75 });
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.age).toBe(26);
      expect(player?.skill).toBe(75);
    });
  });

  describe('Stats Operations', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should update player stats', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayerStats('player-1', { goals: 10, assists: 5 });
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.stats.goals).toBe(10);
      expect(player?.stats.assists).toBe(5);
    });

    it('should reset season stats', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.resetSeasonStats();
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.stats.goals).toBe(0);
      expect(player?.stats.assists).toBe(0);
      expect(player?.stats.appearances).toBe(0);
    });
  });

  describe('Morale Operations', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should update player morale', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayerMorale('player-1', 10);
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.morale).toBe(85);
    });

    it('should cap morale at 100', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayerMorale('player-1', 50);
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.morale).toBe(100);
    });

    it('should cap morale at 0', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayerMorale('player-1', -100);
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.morale).toBe(0);
    });

    it('should set player morale directly', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setPlayerMorale('player-1', 90);
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.morale).toBe(90);
    });
  });

  describe('Injury Operations', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should injure player', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.injurePlayer('player-1', {
          type: 'muscle',
          weeksRemaining: 4,
          severity: 'minor',
        });
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.injury).not.toBeNull();
      expect(player?.injury?.weeksRemaining).toBe(4);
    });

    it('should heal player', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.injurePlayer('player-1', {
          type: 'muscle',
          weeksRemaining: 4,
          severity: 'minor',
        });
        result.current.healPlayer('player-1');
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.injury).toBeNull();
    });

    it('should process injury recovery', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.injurePlayer('player-1', {
          type: 'muscle',
          weeksRemaining: 2,
          severity: 'minor',
        });
        result.current.processInjuryRecovery();
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.injury?.weeksRemaining).toBe(1);
    });

    it('should heal when injury recovery reaches 0', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.injurePlayer('player-1', {
          type: 'muscle',
          weeksRemaining: 1,
          severity: 'minor',
        });
        result.current.processInjuryRecovery();
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.injury).toBeNull();
    });
  });

  describe('Contract Operations', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should update player contract', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayerContract('player-1', {
          wage: 3,
          weeksRemaining: 104,
        });
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.contract?.wage).toBe(3);
      expect(player?.contract?.weeksRemaining).toBe(104);
    });

    it('should process contract expiries', () => {
      const { result } = renderHook(() => usePlayerStore());

      // Set contract to expire
      act(() => {
        result.current.updatePlayerContract('player-1', { weeksRemaining: 1 });
        result.current.processContractExpiries();
      });

      expect(result.current.squadPlayers).toHaveLength(0);
      expect(result.current.freeAgents).toHaveLength(1);
    });

    it('should decrement contract weeks', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.processContractExpiries();
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.contract?.weeksRemaining).toBe(51);
    });

    it('should offer contract to player', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        const accepted = result.current.offerContract('player-1', {
          wage: 4,
          weeksRemaining: 156,
          bonuses: 0,
        });
        expect(accepted).toBe(true);
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.contract?.wage).toBe(4);
      expect(player?.contract?.weeksRemaining).toBe(156);
    });
  });

  describe('Development Operations', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should develop players', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        const reports = result.current.developPlayers(result.current.squadPlayers);
        expect(reports).toBeDefined();
      });
    });

    it('should age all players', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.ageAllPlayers();
      });

      const player = result.current.getPlayerById('player-1');
      expect(player?.age).toBe(26);
    });
  });

  describe('Queries', () => {
    beforeEach(() => {
      const multiPlayerGameState = {
        ...mockGameState,
        playerTeam: {
          ...mockGameState.playerTeam!,
          players: [
            mockPlayer,
            { ...mockPlayer, id: 'player-2', stats: { ...mockPlayer.stats, goals: 15 } },
            { ...mockPlayer, id: 'player-3', stats: { ...mockPlayer.stats, assists: 10 } },
            {
              ...mockPlayer,
              id: 'player-4',
              injury: { type: 'muscle', weeksRemaining: 3, severity: 'minor' },
            },
            { ...mockPlayer, id: 'player-5', morale: 30 },
          ],
        },
      };
      useGameStore.getState().setGameState(multiPlayerGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should get player by id', () => {
      const { result } = renderHook(() => usePlayerStore());
      const player = result.current.getPlayerById('player-1');
      expect(player?.name).toBe('Test Player');
    });

    it('should get top performers by goals', () => {
      const { result } = renderHook(() => usePlayerStore());
      const topScorers = result.current.topPerformers('goals', 3);
      expect(topScorers[0].id).toBe('player-2');
      expect(topScorers[0].stats.goals).toBe(15);
    });

    it('should get top performers by assists', () => {
      const { result } = renderHook(() => usePlayerStore());
      const topAssisters = result.current.topPerformers('assists', 3);
      expect(topAssisters[0].id).toBe('player-3');
      expect(topAssisters[0].stats.assists).toBe(10);
    });

    it('should get injured players', () => {
      const { result } = renderHook(() => usePlayerStore());
      const injured = result.current.injuredPlayers();
      expect(injured).toHaveLength(1);
      expect(injured[0].id).toBe('player-4');
    });

    it('should get players with low morale', () => {
      const { result } = renderHook(() => usePlayerStore());
      const lowMorale = result.current.playersWithLowMorale(40);
      expect(lowMorale).toHaveLength(1);
      expect(lowMorale[0].id).toBe('player-5');
    });

    it('should get expiring contracts', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.updatePlayerContract('player-1', { weeksRemaining: 3 });
      });

      const expiring = result.current.expiringContracts(4);
      expect(expiring).toHaveLength(1);
      expect(expiring[0].id).toBe('player-1');
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should select squad players', () => {
      const { result } = renderHook(() => usePlayerStore(playerSelectors.squadPlayers));
      expect(result.current).toHaveLength(1);
    });

    it('should select squad size', () => {
      const { result } = renderHook(() => usePlayerStore(playerSelectors.squadSize));
      expect(result.current).toBe(1);
    });

    it('should select injured players', () => {
      const { result } = renderHook(() => usePlayerStore());
      const injured = result.current.injuredPlayers();
      expect(injured).toHaveLength(0);
    });
  });

  describe('Youth Academy', () => {
    beforeEach(() => {
      const gameStateWithAcademy = {
        ...mockGameState,
        youthAcademy: {
          prospects: [],
          level: 1,
        },
      };
      useGameStore.getState().setGameState(gameStateWithAcademy as GameState);
      usePlayerStore.getState().syncFromGameState();
    });

    it('should add youth prospect', () => {
      const { result } = renderHook(() => usePlayerStore());

      const prospect: Player = {
        ...mockPlayer,
        id: 'prospect-1',
        name: 'Young Talent',
        age: 18,
        skill: 50,
        potential: 80,
      };

      act(() => {
        result.current.addYouthProspect(prospect);
      });

      expect(result.current.youthProspects).toHaveLength(1);
    });

    it('should select youth players to promote', () => {
      const { result } = renderHook(() => usePlayerStore());

      const prospect: Player = {
        ...mockPlayer,
        id: 'prospect-1',
        name: 'Young Talent',
        age: 18,
      };

      act(() => {
        result.current.addYouthProspect(prospect);
        result.current.selectYouthPlayers(['prospect-1']);
      });

      expect(result.current.youthProspects).toHaveLength(0);
      expect(result.current.squadPlayers.some((p) => p.id === 'prospect-1')).toBe(true);
    });
  });
});
