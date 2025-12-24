/**
 * Football Director Engine - Tactics Manager Tests
 */

import { TacticsManager } from './tactics-manager';
import { FormationType, Tactics, Team } from './types';
import { createMockPlayer, createMockTeam } from '../__tests__';

describe('TacticsManager', () => {
  let manager: TacticsManager;

  beforeEach(() => {
    manager = new TacticsManager();
  });

  describe('getFormationRequirements', () => {
    it('should return correct requirements for 4-4-2', () => {
      const req = manager.getFormationRequirements('4-4-2');

      expect(req).toEqual({ GK: 1, DEF: 4, MID: 4, FWD: 2 });
    });

    it('should return correct requirements for 4-3-3', () => {
      const req = manager.getFormationRequirements('4-3-3');

      expect(req).toEqual({ GK: 1, DEF: 4, MID: 3, FWD: 3 });
    });

    it('should return correct requirements for 3-5-2', () => {
      const req = manager.getFormationRequirements('3-5-2');

      expect(req).toEqual({ GK: 1, DEF: 3, MID: 5, FWD: 2 });
    });

    it('should return correct requirements for all formations', () => {
      const formations: FormationType[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];

      formations.forEach((formation) => {
        const req = manager.getFormationRequirements(formation);
        // All formations need exactly 11 players
        expect(req.GK + req.DEF + req.MID + req.FWD).toBe(11);
      });
    });
  });

  describe('getDefaultTactics', () => {
    it('should return 4-4-2 balanced as default', () => {
      const tactics = manager.getDefaultTactics();

      expect(tactics.formation).toBe('4-4-2');
      expect(tactics.mentality).toBe('balanced');
    });
  });

  describe('canPlayFormation', () => {
    it('should return true when team has enough players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ position: 'GK' }),
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'DEF' })),
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'MID' })),
          ...Array(2).fill(null).map(() => createMockPlayer({ position: 'FWD' })),
        ],
      });

      const canPlay = manager.canPlayFormation(team, '4-4-2');

      expect(canPlay).toBe(true);
    });

    it('should return false when missing goalkeeper', () => {
      const team = createMockTeam({
        players: [
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'DEF' })),
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'MID' })),
          ...Array(2).fill(null).map(() => createMockPlayer({ position: 'FWD' })),
        ],
      });

      const canPlay = manager.canPlayFormation(team, '4-4-2');

      expect(canPlay).toBe(false);
    });

    it('should not count injured players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ position: 'GK' }),
          ...Array(3).fill(null).map(() => createMockPlayer({ position: 'DEF' })),
          createMockPlayer({ position: 'DEF', injury: { type: 'minor', description: 'Knock', weeksRemaining: 2, sustainedInWeek: 8 } }),
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'MID' })),
          ...Array(2).fill(null).map(() => createMockPlayer({ position: 'FWD' })),
        ],
      });

      const canPlay = manager.canPlayFormation(team, '4-4-2');

      expect(canPlay).toBe(false); // Missing 1 DEF due to injury
    });

    it('should not count suspended players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ position: 'GK' }),
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'DEF' })),
          ...Array(3).fill(null).map(() => createMockPlayer({ position: 'MID' })),
          createMockPlayer({ position: 'MID', suspendedUntil: 15 }),
          ...Array(2).fill(null).map(() => createMockPlayer({ position: 'FWD' })),
        ],
      });

      const canPlay = manager.canPlayFormation(team, '4-4-2');

      expect(canPlay).toBe(false); // Missing 1 MID due to suspension
    });

    it('should return true for different formation with same players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ position: 'GK' }),
          ...Array(4).fill(null).map(() => createMockPlayer({ position: 'DEF' })),
          ...Array(3).fill(null).map(() => createMockPlayer({ position: 'MID' })),
          ...Array(3).fill(null).map(() => createMockPlayer({ position: 'FWD' })),
        ],
      });

      const canPlay442 = manager.canPlayFormation(team, '4-4-2');
      const canPlay433 = manager.canPlayFormation(team, '4-3-3');

      expect(canPlay442).toBe(false); // Need 4 MID
      expect(canPlay433).toBe(true); // Need 3 MID, 3 FWD
    });
  });

  describe('calculateTacticalModifier', () => {
    it('should return 1.0 for same tactics', () => {
      const tactics: Tactics = { formation: '4-4-2', mentality: 'balanced' };

      const modifier = manager.calculateTacticalModifier(tactics, tactics);

      expect(modifier).toBe(1.0);
    });

    it('should give bonus when formation counters opponent', () => {
      const ownTactics: Tactics = { formation: '4-4-2', mentality: 'balanced' };
      const opponentTactics: Tactics = { formation: '3-5-2', mentality: 'balanced' };

      const modifier = manager.calculateTacticalModifier(ownTactics, opponentTactics);

      expect(modifier).toBeGreaterThan(1.0);
    });

    it('should give bonus for attacking vs defensive', () => {
      const attacking: Tactics = { formation: '4-4-2', mentality: 'attacking' };
      const defensive: Tactics = { formation: '4-4-2', mentality: 'defensive' };

      const modifier = manager.calculateTacticalModifier(attacking, defensive);

      expect(modifier).toBeGreaterThan(1.0);
    });

    it('should give penalty for defensive vs attacking', () => {
      const defensive: Tactics = { formation: '4-4-2', mentality: 'defensive' };
      const attacking: Tactics = { formation: '4-4-2', mentality: 'attacking' };

      const modifier = manager.calculateTacticalModifier(defensive, attacking);

      expect(modifier).toBeLessThan(1.0);
    });

    it('should give bonus for attacking mentality', () => {
      const attacking: Tactics = { formation: '4-4-2', mentality: 'attacking' };
      const balanced: Tactics = { formation: '4-4-2', mentality: 'balanced' };

      const modifier = manager.calculateTacticalModifier(attacking, balanced);

      expect(modifier).toBeGreaterThan(1.0);
    });

    it('should clamp modifier between 0.8 and 1.2', () => {
      const formations: FormationType[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];
      const mentalities = ['defensive', 'balanced', 'attacking'] as const;

      formations.forEach((form1) => {
        formations.forEach((form2) => {
          mentalities.forEach((ment1) => {
            mentalities.forEach((ment2) => {
              const modifier = manager.calculateTacticalModifier(
                { formation: form1, mentality: ment1 },
                { formation: form2, mentality: ment2 }
              );

              expect(modifier).toBeGreaterThanOrEqual(0.8);
              expect(modifier).toBeLessThanOrEqual(1.2);
            });
          });
        });
      });
    });
  });

  describe('getFormationDescription', () => {
    it('should return description for 4-4-2', () => {
      const desc = manager.getFormationDescription('4-4-2');

      expect(desc).toContain('Balanced');
      expect(desc).toBeDefined();
    });

    it('should return description for all formations', () => {
      const formations: FormationType[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];

      formations.forEach((formation) => {
        const desc = manager.getFormationDescription(formation);
        expect(desc.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getMentalityDescription', () => {
    it('should return description for defensive', () => {
      const desc = manager.getMentalityDescription('defensive');

      expect(desc).toContain('defend');
    });

    it('should return description for balanced', () => {
      const desc = manager.getMentalityDescription('balanced');

      expect(desc).toContain('Equal');
    });

    it('should return description for attacking', () => {
      const desc = manager.getMentalityDescription('attacking');

      expect(desc).toContain('aggressive');
    });
  });

  describe('setTeamTactics', () => {
    it('should update team tactics', () => {
      const team = createMockTeam({
        tactics: { formation: '4-4-2', mentality: 'balanced' },
      });

      const newTactics: Tactics = { formation: '4-3-3', mentality: 'attacking' };
      const updated = manager.setTeamTactics(team, newTactics);

      expect(updated.tactics?.formation).toBe('4-3-3');
      expect(updated.tactics?.mentality).toBe('attacking');
    });

    it('should not mutate original team', () => {
      const originalTactics: Tactics = { formation: '4-4-2', mentality: 'balanced' };
      const team = createMockTeam({ tactics: originalTactics });

      const newTactics: Tactics = { formation: '3-5-2', mentality: 'defensive' };
      const updated = manager.setTeamTactics(team, newTactics);

      expect(team.tactics?.formation).toBe('4-4-2'); // Original unchanged
      expect(updated.tactics?.formation).toBe('3-5-2');
    });
  });
});
