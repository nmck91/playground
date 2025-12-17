/**
 * Football Director Engine - Board Manager Tests
 */

import { BoardManager } from './board-manager';
import { Team, LeagueTable, BoardStatus, BoardObjective } from './types';

describe('BoardManager', () => {
  let boardManager: BoardManager;

  beforeEach(() => {
    boardManager = new BoardManager();
  });

  const createTestTeam = (avgSkill: number): Team => ({
    id: 'team-1',
    name: 'Test FC',
    budget: 1000000,
    players: Array.from({ length: 11 }, (_, i) => ({
      id: `player-${i}`,
      name: `Player ${i}`,
      position: 'MID' as const,
      skill: avgSkill,
      age: 25,
      wages: 1000,
    })),
  });

  describe('generateObjective', () => {
    it('should set top 4 objective for elite team', () => {
      const eliteTeam = createTestTeam(16);
      const objective = boardManager.generateObjective(eliteTeam, 2025);

      expect(objective.type).toBe('league-position');
      expect(objective.target).toBe(4);
      expect(objective.season).toBe(2025);
      expect(objective.description).toContain('top 4');
    });

    it('should set top 8 objective for strong team', () => {
      const strongTeam = createTestTeam(13);
      const objective = boardManager.generateObjective(strongTeam, 2025);

      expect(objective.type).toBe('league-position');
      expect(objective.target).toBe(8);
    });

    it('should set mid-table objective for average team', () => {
      const avgTeam = createTestTeam(11);
      const objective = boardManager.generateObjective(avgTeam, 2025);

      expect(objective.type).toBe('league-position');
      expect(objective.target).toBe(12);
    });

    it('should set relegation avoidance for weak team', () => {
      const weakTeam = createTestTeam(8);
      const objective = boardManager.generateObjective(weakTeam, 2025);

      expect(objective.type).toBe('avoid-relegation');
      expect(objective.target).toBe(18);
      expect(objective.description).toContain('relegation');
    });

    it('should adjust expectations based on previous good performance', () => {
      const team = createTestTeam(12);
      const objective = boardManager.generateObjective(team, 2025, 5);

      expect(objective.target).toBeLessThanOrEqual(10);
    });

    it('should temper expectations after poor previous season', () => {
      const team = createTestTeam(12);
      const objective = boardManager.generateObjective(team, 2025, 16);

      expect(objective.target).toBeGreaterThanOrEqual(12);
    });
  });

  describe('initializeBoardStatus', () => {
    it('should initialize with moderate satisfaction', () => {
      const team = createTestTeam(12);
      const status = boardManager.initializeBoardStatus(team, 2025);

      expect(status.satisfaction).toBe(70);
      expect(status.jobSecurity).toBe('safe');
      expect(status.currentObjective).toBeDefined();
      expect(status.objectiveHistory).toEqual([]);
    });

    it('should generate appropriate objective', () => {
      const team = createTestTeam(15);
      const status = boardManager.initializeBoardStatus(team, 2025);

      expect(status.currentObjective?.season).toBe(2025);
      expect(status.currentObjective?.type).toBe('league-position');
    });
  });

  describe('updateObjectiveStatus', () => {
    it('should mark as on-track when meeting target', () => {
      const objective: BoardObjective = {
        id: 'obj-1',
        season: 2025,
        type: 'league-position',
        target: 10,
        description: 'Finish top 10',
        status: 'pending',
      };

      const updated = boardManager.updateObjectiveStatus(objective, 8, 10);

      expect(updated.status).toBe('on-track');
    });

    it('should mark as at-risk when slightly behind', () => {
      const objective: BoardObjective = {
        id: 'obj-1',
        season: 2025,
        type: 'league-position',
        target: 10,
        description: 'Finish top 10',
        status: 'pending',
      };

      const updated = boardManager.updateObjectiveStatus(objective, 14, 3);

      expect(updated.status).toBe('at-risk');
    });

    it('should mark as failed when far behind', () => {
      const objective: BoardObjective = {
        id: 'obj-1',
        season: 2025,
        type: 'league-position',
        target: 10,
        description: 'Finish top 10',
        status: 'pending',
      };

      const updated = boardManager.updateObjectiveStatus(objective, 17, 5);

      expect(updated.status).toBe('failed');
    });

    it('should handle relegation objective correctly', () => {
      const objective: BoardObjective = {
        id: 'obj-1',
        season: 2025,
        type: 'avoid-relegation',
        target: 18,
        description: 'Avoid relegation',
        status: 'pending',
      };

      const safe = boardManager.updateObjectiveStatus(objective, 15, 10);
      expect(safe.status).toBe('on-track');

      const danger = boardManager.updateObjectiveStatus(objective, 20, 2);
      expect(danger.status).toBe('failed');
    });
  });

  describe('calculateSatisfaction', () => {
    const objective: BoardObjective = {
      id: 'obj-1',
      season: 2025,
      type: 'league-position',
      target: 10,
      description: 'Finish top 10',
      status: 'on-track',
    };

    it('should increase satisfaction when on-track', () => {
      const newSat = boardManager.calculateSatisfaction(70, objective, 8, 10);

      expect(newSat).toBeGreaterThan(70);
    });

    it('should decrease satisfaction when at-risk', () => {
      const atRiskObj = { ...objective, status: 'at-risk' as const };
      const newSat = boardManager.calculateSatisfaction(70, atRiskObj, 13, 5);

      expect(newSat).toBeLessThan(70);
    });

    it('should significantly decrease when failed', () => {
      const failedObj = { ...objective, status: 'failed' as const };
      const newSat = boardManager.calculateSatisfaction(70, failedObj, 17, 3);

      expect(newSat).toBeLessThanOrEqual(65);
    });

    it('should not go below 0', () => {
      const failedObj = { ...objective, status: 'failed' as const };
      const newSat = boardManager.calculateSatisfaction(5, failedObj, 20, 1);

      expect(newSat).toBeGreaterThanOrEqual(0);
    });

    it('should not go above 100', () => {
      const achievedObj = { ...objective, status: 'achieved' as const };
      const newSat = boardManager.calculateSatisfaction(95, achievedObj, 3, 1);

      expect(newSat).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateJobSecurity', () => {
    it('should be safe with high satisfaction', () => {
      expect(boardManager.calculateJobSecurity(80)).toBe('safe');
      expect(boardManager.calculateJobSecurity(60)).toBe('safe');
    });

    it('should be under pressure with moderate satisfaction', () => {
      expect(boardManager.calculateJobSecurity(50)).toBe('under-pressure');
      expect(boardManager.calculateJobSecurity(35)).toBe('under-pressure');
    });

    it('should be critical with low satisfaction', () => {
      expect(boardManager.calculateJobSecurity(30)).toBe('critical');
      expect(boardManager.calculateJobSecurity(10)).toBe('critical');
    });
  });

  describe('updateBoardStatus', () => {
    const createLeagueTable = (playerPosition: number): LeagueTable[] => {
      return Array.from({ length: 20 }, (_, i) => ({
        teamId: i === playerPosition - 1 ? 'team-1' : `team-${i + 2}`,
        teamName: `Team ${i + 1}`,
        played: 20,
        won: 20 - i,
        drawn: 0,
        lost: i,
        goalsFor: 40 - i,
        goalsAgainst: 10 + i,
        goalDifference: 30 - 2 * i,
        points: 60 - 3 * i,
      }));
    };

    it('should update objective status based on position', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 70,
        jobSecurity: 'safe',
        currentObjective: {
          id: 'obj-1',
          season: 2025,
          type: 'league-position',
          target: 10,
          description: 'Finish top 10',
          status: 'pending',
        },
        objectiveHistory: [],
      };

      const table = createLeagueTable(8);
      const updated = boardManager.updateBoardStatus(boardStatus, table, 'team-1', 10);

      expect(updated.currentObjective?.status).toBe('on-track');
      expect(updated.satisfaction).toBeGreaterThanOrEqual(70);
    });

    it('should decrease satisfaction when performing poorly', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 62,
        jobSecurity: 'safe',
        currentObjective: {
          id: 'obj-1',
          season: 2025,
          type: 'league-position',
          target: 10,
          description: 'Finish top 10',
          status: 'pending',
        },
        objectiveHistory: [],
      };

      const table = createLeagueTable(16);
      const updated = boardManager.updateBoardStatus(boardStatus, table, 'team-1', 5);

      expect(updated.satisfaction).toBeLessThan(62);
      expect(updated.jobSecurity).not.toBe('safe');
    });
  });

  describe('evaluateSeason', () => {
    it('should mark as satisfied when objective achieved', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 75,
        jobSecurity: 'safe',
        currentObjective: {
          id: 'obj-1',
          season: 2025,
          type: 'league-position',
          target: 10,
          description: 'Finish top 10',
          status: 'on-track',
        },
        objectiveHistory: [],
      };

      const result = boardManager.evaluateSeason(boardStatus, 8);

      expect(result.satisfied).toBe(true);
      expect(result.sacked).toBe(false);
      expect(result.objective.status).toBe('achieved');
      expect(result.message).toContain('Excellent');
    });

    it('should give second chance if close to target with decent satisfaction', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 55,
        jobSecurity: 'under-pressure',
        currentObjective: {
          id: 'obj-1',
          season: 2025,
          type: 'league-position',
          target: 10,
          description: 'Finish top 10',
          status: 'at-risk',
        },
        objectiveHistory: [],
      };

      const result = boardManager.evaluateSeason(boardStatus, 12);

      expect(result.satisfied).toBe(true);
      expect(result.sacked).toBe(false);
      expect(result.message).toContain('another chance');
    });

    it('should sack manager for poor performance', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 30,
        jobSecurity: 'critical',
        currentObjective: {
          id: 'obj-1',
          season: 2025,
          type: 'league-position',
          target: 10,
          description: 'Finish top 10',
          status: 'failed',
        },
        objectiveHistory: [],
      };

      const result = boardManager.evaluateSeason(boardStatus, 17);

      expect(result.satisfied).toBe(false);
      expect(result.sacked).toBe(true);
      expect(result.message).toContain('Unacceptable');
    });

    it('should sack manager for relegation', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 40,
        jobSecurity: 'critical',
        currentObjective: {
          id: 'obj-1',
          season: 2025,
          type: 'avoid-relegation',
          target: 18,
          description: 'Avoid relegation',
          status: 'failed',
        },
        objectiveHistory: [],
      };

      const result = boardManager.evaluateSeason(boardStatus, 19);

      expect(result.satisfied).toBe(false);
      expect(result.sacked).toBe(true);
      expect(result.message).toContain('Relegated');
    });
  });
});
