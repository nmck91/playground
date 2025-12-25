/**
 * Football Director Engine - Player Stats Tracker Tests
 */

import { PlayerStatsTracker } from './player-stats-tracker';
import { Player, MatchEvent, MatchResult } from './types';
import { createMockPlayer, createMockTeam } from '../__tests__';

describe('PlayerStatsTracker', () => {
  let tracker: PlayerStatsTracker;

  beforeEach(() => {
    tracker = new PlayerStatsTracker();
  });

  describe('initializePlayerStats', () => {
    it('should initialize all stats to zero', () => {
      const stats = tracker.initializePlayerStats();

      expect(stats.appearances).toBe(0);
      expect(stats.goals).toBe(0);
      expect(stats.assists).toBe(0);
      expect(stats.cleanSheets).toBe(0);
      expect(stats.yellowCards).toBe(0);
      expect(stats.redCards).toBe(0);
      expect(stats.careerAppearances).toBe(0);
      expect(stats.careerGoals).toBe(0);
      expect(stats.careerAssists).toBe(0);
      expect(stats.careerCleanSheets).toBe(0);
    });
  });

  describe('updateStatsFromMatch', () => {
    it('should increment appearances and career appearances', () => {
      const player = createMockPlayer({
        id: 'p1',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [];
      const result: MatchResult = { homeScore: 1, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(player, events, result, 'Team A', true);

      expect(updated.stats.appearances).toBe(1);
      expect(updated.stats.careerAppearances).toBe(1);
    });

    it('should track goals from match events', () => {
      const player = createMockPlayer({
        id: 'p1',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [
        {
          type: 'goal',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player 1',
          minute: 15,
          description: 'Goal!',
        },
        {
          type: 'goal',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player 1',
          minute: 45,
          description: 'Goal!',
        },
      ];

      const result: MatchResult = { homeScore: 2, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(player, events, result, 'Team A', true);

      expect(updated.stats.goals).toBe(2);
      expect(updated.stats.careerGoals).toBe(2);
    });

    it('should track assists from match events', () => {
      const player = createMockPlayer({
        id: 'p1',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [
        {
          type: 'goal',
          team: 'home',
          playerId: 'p2',
          playerName: 'Player 2',
          minute: 15,
          description: 'Goal!',
          assistPlayerId: 'p1',
          assistPlayerName: 'Player 1',
        },
      ];

      const result: MatchResult = { homeScore: 1, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(player, events, result, 'Team A', true);

      expect(updated.stats.assists).toBe(1);
      expect(updated.stats.careerAssists).toBe(1);
    });

    it('should track yellow cards', () => {
      const player = createMockPlayer({
        id: 'p1',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [
        {
          type: 'yellow-card',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player 1',
          minute: 30,
          description: 'Booked!',
        },
      ];

      const result: MatchResult = { homeScore: 0, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(player, events, result, 'Team A', true);

      expect(updated.stats.yellowCards).toBe(1);
    });

    it('should track red cards', () => {
      const player = createMockPlayer({
        id: 'p1',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [
        {
          type: 'red-card',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player 1',
          minute: 60,
          description: 'Sent off!',
        },
      ];

      const result: MatchResult = { homeScore: 0, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(player, events, result, 'Team A', true);

      expect(updated.stats.redCards).toBe(1);
    });

    it('should track clean sheets for goalkeepers (home team)', () => {
      const goalkeeper = createMockPlayer({
        id: 'gk1',
        position: 'GK',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [];
      const result: MatchResult = { homeScore: 2, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(goalkeeper, events, result, 'Team A', true);

      expect(updated.stats.cleanSheets).toBe(1);
      expect(updated.stats.careerCleanSheets).toBe(1);
    });

    it('should track clean sheets for goalkeepers (away team)', () => {
      const goalkeeper = createMockPlayer({
        id: 'gk1',
        position: 'GK',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [];
      const result: MatchResult = { homeScore: 0, awayScore: 1, events };

      const updated = tracker.updateStatsFromMatch(goalkeeper, events, result, 'Team A', false);

      expect(updated.stats.cleanSheets).toBe(1);
      expect(updated.stats.careerCleanSheets).toBe(1);
    });

    it('should not track clean sheets when goalkeeper concedes', () => {
      const goalkeeper = createMockPlayer({
        id: 'gk1',
        position: 'GK',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [];
      const result: MatchResult = { homeScore: 2, awayScore: 1, events };

      const updated = tracker.updateStatsFromMatch(goalkeeper, events, result, 'Team A', true);

      expect(updated.stats.cleanSheets).toBe(0);
      expect(updated.stats.careerCleanSheets).toBe(0);
    });

    it('should not track clean sheets for non-goalkeepers', () => {
      const defender = createMockPlayer({
        id: 'def1',
        position: 'DEF',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [];
      const result: MatchResult = { homeScore: 1, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(defender, events, result, 'Team A', true);

      expect(updated.stats.cleanSheets).toBe(0);
    });

    it('should not mutate original player', () => {
      const player = createMockPlayer({
        id: 'p1',
        stats: tracker.initializePlayerStats(),
      });

      const events: MatchEvent[] = [
        {
          type: 'goal',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player 1',
          minute: 15,
          description: 'Goal!',
        },
      ];

      const result: MatchResult = { homeScore: 1, awayScore: 0, events };

      const updated = tracker.updateStatsFromMatch(player, events, result, 'Team A', true);

      expect(player.stats.goals).toBe(0);
      expect(updated.stats.goals).toBe(1);
    });
  });

  describe('processTeamMatchStats', () => {
    it('should update stats for all team players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'p1', stats: tracker.initializePlayerStats() }),
          createMockPlayer({ id: 'p2', stats: tracker.initializePlayerStats() }),
        ],
      });

      const events: MatchEvent[] = [
        {
          type: 'goal',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player 1',
          minute: 15,
          description: 'Goal!',
        },
      ];

      const result: MatchResult = { homeScore: 1, awayScore: 0, events };

      const updated = tracker.processTeamMatchStats(team, result, events, true);

      expect(updated.players[0].stats.appearances).toBe(1);
      expect(updated.players[0].stats.goals).toBe(1);
      expect(updated.players[1].stats.appearances).toBe(1);
      expect(updated.players[1].stats.goals).toBe(0);
    });
  });

  describe('archiveSeasonStats', () => {
    it('should add season stats to player history', () => {
      const player = createMockPlayer({
        stats: {
          ...tracker.initializePlayerStats(),
          appearances: 38,
          goals: 15,
          assists: 8,
          cleanSheets: 0,
        },
        history: [],
      });

      const updated = tracker.archiveSeasonStats(player, 1, 'Team A');

      expect(updated.history).toHaveLength(1);
      expect(updated.history[0]).toEqual({
        season: 1,
        teamName: 'Team A',
        appearances: 38,
        goals: 15,
        assists: 8,
        cleanSheets: undefined,
      });
    });

    it('should include clean sheets for goalkeepers', () => {
      const goalkeeper = createMockPlayer({
        position: 'GK',
        stats: {
          ...tracker.initializePlayerStats(),
          appearances: 38,
          goals: 0,
          assists: 0,
          cleanSheets: 15,
        },
        history: [],
      });

      const updated = tracker.archiveSeasonStats(goalkeeper, 1, 'Team A');

      expect(updated.history[0].cleanSheets).toBe(15);
    });

    it('should not mutate original player', () => {
      const player = createMockPlayer({
        stats: {
          ...tracker.initializePlayerStats(),
          appearances: 38,
          goals: 15,
        },
        history: [],
      });

      const updated = tracker.archiveSeasonStats(player, 1, 'Team A');

      expect(player.history).toHaveLength(0);
      expect(updated.history).toHaveLength(1);
    });
  });

  describe('getTopPerformers', () => {
    it('should identify top scorer', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Top Scorer',
            stats: { ...tracker.initializePlayerStats(), goals: 20 },
          }),
          createMockPlayer({
            id: 'p2',
            stats: { ...tracker.initializePlayerStats(), goals: 10 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.topScorer).toBeDefined();
      expect(performers.topScorer?.player.id).toBe('p1');
      expect(performers.topScorer?.goals).toBe(20);
    });

    it('should identify top assists', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            stats: { ...tracker.initializePlayerStats(), assists: 5 },
          }),
          createMockPlayer({
            id: 'p2',
            name: 'Top Assister',
            stats: { ...tracker.initializePlayerStats(), assists: 15 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.topAssists).toBeDefined();
      expect(performers.topAssists?.player.id).toBe('p2');
      expect(performers.topAssists?.assists).toBe(15);
    });

    it('should identify most appearances', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Ever Present',
            stats: { ...tracker.initializePlayerStats(), appearances: 38 },
          }),
          createMockPlayer({
            id: 'p2',
            stats: { ...tracker.initializePlayerStats(), appearances: 20 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.mostAppearances).toBeDefined();
      expect(performers.mostAppearances?.player.id).toBe('p1');
      expect(performers.mostAppearances?.appearances).toBe(38);
    });

    it('should identify clean sheet king (goalkeepers only)', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'gk1',
            name: 'Top GK',
            position: 'GK',
            stats: { ...tracker.initializePlayerStats(), cleanSheets: 20 },
          }),
          createMockPlayer({
            id: 'gk2',
            position: 'GK',
            stats: { ...tracker.initializePlayerStats(), cleanSheets: 10 },
          }),
          createMockPlayer({
            id: 'def1',
            position: 'DEF',
            stats: { ...tracker.initializePlayerStats(), cleanSheets: 0 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.cleanSheetKing).toBeDefined();
      expect(performers.cleanSheetKing?.player.id).toBe('gk1');
      expect(performers.cleanSheetKing?.cleanSheets).toBe(20);
    });

    it('should return null if no goals scored', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            stats: { ...tracker.initializePlayerStats(), goals: 0 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.topScorer).toBeNull();
    });

    it('should return null if no assists', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            stats: { ...tracker.initializePlayerStats(), assists: 0 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.topAssists).toBeNull();
    });

    it('should return null if no clean sheets', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'gk1',
            position: 'GK',
            stats: { ...tracker.initializePlayerStats(), cleanSheets: 0 },
          }),
        ],
      });

      const performers = tracker.getTopPerformers(team);

      expect(performers.cleanSheetKing).toBeNull();
    });
  });

  describe('resetSeasonStats', () => {
    it('should reset season stats to zero', () => {
      const player = createMockPlayer({
        stats: {
          appearances: 38,
          goals: 20,
          assists: 10,
          cleanSheets: 15,
          yellowCards: 5,
          redCards: 1,
          careerAppearances: 100,
          careerGoals: 50,
          careerAssists: 30,
          careerCleanSheets: 40,
        },
      });

      const reset = tracker.resetSeasonStats(player);

      expect(reset.stats.appearances).toBe(0);
      expect(reset.stats.goals).toBe(0);
      expect(reset.stats.assists).toBe(0);
      expect(reset.stats.cleanSheets).toBe(0);
      expect(reset.stats.yellowCards).toBe(0);
      expect(reset.stats.redCards).toBe(0);
    });

    it('should preserve career stats', () => {
      const player = createMockPlayer({
        stats: {
          appearances: 38,
          goals: 20,
          assists: 10,
          cleanSheets: 15,
          yellowCards: 5,
          redCards: 1,
          careerAppearances: 100,
          careerGoals: 50,
          careerAssists: 30,
          careerCleanSheets: 40,
        },
      });

      const reset = tracker.resetSeasonStats(player);

      expect(reset.stats.careerAppearances).toBe(100);
      expect(reset.stats.careerGoals).toBe(50);
      expect(reset.stats.careerAssists).toBe(30);
      expect(reset.stats.careerCleanSheets).toBe(40);
    });
  });

  describe('archiveAndResetTeamStats', () => {
    it('should archive and reset stats for all players', () => {
      const team = createMockTeam({
        name: 'Team A',
        players: [
          createMockPlayer({
            id: 'p1',
            stats: {
              ...tracker.initializePlayerStats(),
              appearances: 38,
              goals: 20,
            },
            history: [],
          }),
          createMockPlayer({
            id: 'p2',
            stats: {
              ...tracker.initializePlayerStats(),
              appearances: 30,
              goals: 10,
            },
            history: [],
          }),
        ],
      });

      const updated = tracker.archiveAndResetTeamStats(team, 1);

      // Check history was added
      expect(updated.players[0].history).toHaveLength(1);
      expect(updated.players[1].history).toHaveLength(1);

      // Check stats were reset
      expect(updated.players[0].stats.appearances).toBe(0);
      expect(updated.players[0].stats.goals).toBe(0);
      expect(updated.players[1].stats.appearances).toBe(0);
      expect(updated.players[1].stats.goals).toBe(0);
    });

    it('should preserve existing history', () => {
      const team = createMockTeam({
        name: 'Team A',
        players: [
          createMockPlayer({
            id: 'p1',
            stats: {
              ...tracker.initializePlayerStats(),
              appearances: 38,
            },
            history: [
              {
                season: 0,
                teamName: 'Old Team',
                appearances: 20,
                goals: 5,
                assists: 3,
              },
            ],
          }),
        ],
      });

      const updated = tracker.archiveAndResetTeamStats(team, 1);

      expect(updated.players[0].history).toHaveLength(2);
      expect(updated.players[0].history[0].season).toBe(0);
      expect(updated.players[0].history[1].season).toBe(1);
    });
  });
});
