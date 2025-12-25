/**
 * Football Director Engine - Match Commentary Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MatchCommentary } from './match-commentary';
import { Team, MatchEvent, Player } from './types';
import { createMockTeam, createMockPlayer } from '../__tests__';

describe('MatchCommentary', () => {
  let commentary: MatchCommentary;

  beforeEach(() => {
    commentary = new MatchCommentary();
  });

  describe('selectGoalScorers', () => {
    it('should select correct number of goal scorers', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ position: 'FWD', skill: 15 }),
          createMockPlayer({ position: 'MID', skill: 12 }),
          createMockPlayer({ position: 'DEF', skill: 10 }),
        ],
      });

      const scorers = commentary.selectGoalScorers(team, 3, 12345);

      expect(scorers).toHaveLength(3);
    });

    it('should not select goalkeepers as scorers', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'gk', position: 'GK', skill: 15 }),
          createMockPlayer({ id: 'fwd', position: 'FWD', skill: 10 }),
        ],
      });

      const scorers = commentary.selectGoalScorers(team, 5, 12345);

      // All scorers should be the forward, not the goalkeeper
      scorers.forEach((scorer) => {
        expect(scorer.id).toBe('fwd');
      });
    });

    it('should weight forwards higher than defenders', () => {
      // With a seeded random, we can verify weighting is applied
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'fwd', position: 'FWD', skill: 15 }),
          createMockPlayer({ id: 'def', position: 'DEF', skill: 15 }),
        ],
      });

      const scorers = commentary.selectGoalScorers(team, 10, 12345);
      const fwdCount = scorers.filter((s) => s.id === 'fwd').length;
      const defCount = scorers.filter((s) => s.id === 'def').length;

      // Forwards should score more often (weight 5 vs 1)
      expect(fwdCount).toBeGreaterThan(defCount);
    });

    it('should handle team with no outfield players', () => {
      const team = createMockTeam({
        players: [createMockPlayer({ position: 'GK', skill: 15 })],
      });

      const scorers = commentary.selectGoalScorers(team, 2, 12345);

      expect(scorers).toHaveLength(0);
    });
  });

  describe('selectAssistProvider', () => {
    it('should return null approximately 50% of time', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'scorer', position: 'FWD', skill: 15 }),
          createMockPlayer({ id: 'mid', position: 'MID', skill: 12 }),
        ],
      });
      const scorer = team.players[0];

      let nullCount = 0;
      let assistCount = 0;

      for (let i = 0; i < 100; i++) {
        const assist = commentary.selectAssistProvider(team, scorer, i);
        if (assist === null) {
          nullCount++;
        } else {
          assistCount++;
        }
      }

      // Should be roughly 50/50
      expect(nullCount).toBeGreaterThan(30);
      expect(nullCount).toBeLessThan(70);
    });

    it('should not select scorer as assist provider', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'scorer', position: 'FWD', skill: 15 }),
          createMockPlayer({ id: 'mid', position: 'MID', skill: 12 }),
        ],
      });
      const scorer = team.players[0];

      for (let i = 0; i < 50; i++) {
        const assist = commentary.selectAssistProvider(team, scorer, i);
        if (assist) {
          expect(assist.id).not.toBe('scorer');
        }
      }
    });

    it('should weight midfielders higher for assists', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'scorer', position: 'FWD', skill: 15 }),
          createMockPlayer({ id: 'mid', position: 'MID', skill: 15 }),
          createMockPlayer({ id: 'def', position: 'DEF', skill: 15 }),
        ],
      });
      const scorer = team.players[0];

      let midCount = 0;
      let defCount = 0;

      for (let i = 0; i < 100; i++) {
        const assist = commentary.selectAssistProvider(team, scorer, i);
        if (assist?.id === 'mid') midCount++;
        if (assist?.id === 'def') defCount++;
      }

      // Midfielders should assist more often (weight 5 vs 1)
      expect(midCount).toBeGreaterThan(defCount);
    });
  });

  describe('generateMatchEvents', () => {
    it('should generate goal events for both teams', () => {
      const homeTeam = createMockTeam({
        name: 'Home FC',
        players: [createMockPlayer({ name: 'Home Striker', position: 'FWD' })],
      });
      const awayTeam = createMockTeam({
        name: 'Away FC',
        players: [createMockPlayer({ name: 'Away Striker', position: 'FWD' })],
      });

      const homeScorers = [homeTeam.players[0], homeTeam.players[0]];
      const awayScorers = [awayTeam.players[0]];

      const events = commentary.generateMatchEvents(
        homeTeam,
        awayTeam,
        2,
        1,
        homeScorers,
        awayScorers,
        12345
      );

      const goalEvents = events.filter((e) => e.type === 'goal' || e.type === 'penalty');
      expect(goalEvents.length).toBeGreaterThanOrEqual(3); // At least 3 goals
    });

    it('should sort events by minute', () => {
      const homeTeam = createMockTeam({
        players: [createMockPlayer({ position: 'FWD' })],
      });
      const awayTeam = createMockTeam({
        players: [createMockPlayer({ position: 'FWD' })],
      });

      const events = commentary.generateMatchEvents(
        homeTeam,
        awayTeam,
        2,
        2,
        [homeTeam.players[0], homeTeam.players[0]],
        [awayTeam.players[0], awayTeam.players[0]],
        12345
      );

      // Check events are sorted by minute
      for (let i = 1; i < events.length; i++) {
        expect(events[i].minute).toBeGreaterThanOrEqual(events[i - 1].minute);
      }
    });

    it('should generate detailed match events', () => {
      const homeTeam = createMockTeam({
        players: [
          createMockPlayer({ position: 'GK' }),
          createMockPlayer({ position: 'DEF' }),
          createMockPlayer({ position: 'MID' }),
          createMockPlayer({ position: 'FWD' }),
        ],
      });
      const awayTeam = createMockTeam({
        players: [
          createMockPlayer({ position: 'GK' }),
          createMockPlayer({ position: 'DEF' }),
          createMockPlayer({ position: 'MID' }),
          createMockPlayer({ position: 'FWD' }),
        ],
      });

      const events = commentary.generateMatchEvents(
        homeTeam,
        awayTeam,
        3,
        2,
        [homeTeam.players[3], homeTeam.players[3], homeTeam.players[3]],
        [awayTeam.players[3], awayTeam.players[3]],
        12345
      );

      // Should have various event types
      const eventTypes = new Set(events.map((e) => e.type));
      expect(eventTypes.size).toBeGreaterThan(2); // More than just goals
    });

    it('should occasionally include yellow cards in high-scoring games', () => {
      const homeTeam = createMockTeam({
        players: [createMockPlayer({ position: 'FWD' })],
      });
      const awayTeam = createMockTeam({
        players: [createMockPlayer({ position: 'FWD' })],
      });

      // Try multiple seeds to verify yellow cards can be generated
      let hasYellowCard = false;
      for (let seed = 0; seed < 50; seed++) {
        const events = commentary.generateMatchEvents(
          homeTeam,
          awayTeam,
          3,
          2,
          [homeTeam.players[0], homeTeam.players[0], homeTeam.players[0]],
          [awayTeam.players[0], awayTeam.players[0]],
          seed
        );

        if (events.some((e) => e.type === 'yellow-card')) {
          hasYellowCard = true;
          break;
        }
      }

      expect(hasYellowCard).toBe(true);
    });
  });

  describe('generateMatchSummary', () => {
    it('should generate summary for goalless draw', () => {
      const summary = commentary.generateMatchSummary('Team A', 'Team B', 0, 0, []);

      expect(summary).toContain('goalless draw');
      expect(summary).toContain('Team A');
      expect(summary).toContain('Team B');
    });

    it('should generate summary for dominant home win', () => {
      const summary = commentary.generateMatchSummary('Team A', 'Team B', 5, 1, []);

      expect(summary).toContain('Team A');
      expect(summary).toContain('5-1');
    });

    it('should generate summary for dominant away win', () => {
      const summary = commentary.generateMatchSummary('Team A', 'Team B', 1, 5, []);

      expect(summary).toContain('Team B');
      expect(summary).toContain('away');
    });

    it('should generate summary for close home win', () => {
      const summary = commentary.generateMatchSummary('Team A', 'Team B', 2, 1, []);

      expect(summary).toContain('Team A');
      expect(summary).toContain('2-1');
    });

    it('should generate summary for draw', () => {
      const summary = commentary.generateMatchSummary('Team A', 'Team B', 2, 2, []);

      expect(summary).toContain('2-2');
      expect(summary).toContain('draw');
    });
  });

  describe('generateAttendance', () => {
    it('should generate attendance based on team budget', () => {
      const poorTeam = createMockTeam({ budget: 100000 });
      const richTeam = createMockTeam({ budget: 5000000 });

      const poorAttendance = commentary.generateAttendance(poorTeam, 12345);
      const richAttendance = commentary.generateAttendance(richTeam, 12345);

      expect(richAttendance).toBeGreaterThan(poorAttendance);
    });

    it('should boost attendance for derby matches', () => {
      const team = createMockTeam({ budget: 1000000 });

      const normalAttendance = commentary.generateAttendance(team, 12345, {
        isDerby: false,
      });
      const derbyAttendance = commentary.generateAttendance(team, 12345, {
        isDerby: true,
      });

      expect(derbyAttendance).toBeGreaterThan(normalAttendance);
    });

    it('should boost attendance when home team in top 4', () => {
      const team = createMockTeam({ budget: 1000000 });

      const normalAttendance = commentary.generateAttendance(team, 12345, {
        homePosition: 10,
      });
      const topFourAttendance = commentary.generateAttendance(team, 12345, {
        homePosition: 3,
      });

      expect(topFourAttendance).toBeGreaterThan(normalAttendance);
    });

    it('should reduce attendance in bad weather', () => {
      const team = createMockTeam({ budget: 1000000 });

      const goodWeatherAttendance = commentary.generateAttendance(team, 12345, {
        weatherCondition: 'sunny',
      });
      const badWeatherAttendance = commentary.generateAttendance(team, 12345, {
        weatherCondition: 'rainy',
      });

      expect(badWeatherAttendance).toBeLessThan(goodWeatherAttendance);
    });

    it('should round attendance to nearest 100', () => {
      const team = createMockTeam({ budget: 1000000 });

      const attendance = commentary.generateAttendance(team, 12345);

      expect(attendance % 100).toBe(0);
    });

    it('should have minimum attendance of 5000', () => {
      const team = createMockTeam({ budget: 0 });

      const attendance = commentary.generateAttendance(team, 12345);

      expect(attendance).toBeGreaterThanOrEqual(5000);
    });
  });
});
