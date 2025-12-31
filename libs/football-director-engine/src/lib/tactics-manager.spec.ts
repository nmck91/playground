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

  // Advanced Tactics Tests (Story 1.5.2)

  describe('getDefaultInstructions', () => {
    it('should return balanced instructions', () => {
      const instructions = manager.getDefaultInstructions();

      expect(instructions.tempo).toBe('balanced');
      expect(instructions.width).toBe('balanced');
      expect(instructions.pressing).toBe('medium');
      expect(instructions.passingStyle).toBe('mixed');
    });
  });

  describe('getDefaultRoles', () => {
    it('should return standard player roles', () => {
      const roles = manager.getDefaultRoles();

      expect(roles.defenders).toBe('full-back');
      expect(roles.midfielders).toBe('box-to-box');
      expect(roles.forwards).toBe('poacher');
    });
  });

  describe('getDefenderRoles', () => {
    it('should return all defender roles', () => {
      const roles = manager.getDefenderRoles();

      expect(roles).toEqual(['full-back', 'wing-back', 'ball-playing-defender']);
      expect(roles.length).toBe(3);
    });
  });

  describe('getMidfielderRoles', () => {
    it('should return all midfielder roles', () => {
      const roles = manager.getMidfielderRoles();

      expect(roles).toEqual(['defensive-midfielder', 'box-to-box', 'attacking-midfielder']);
      expect(roles.length).toBe(3);
    });
  });

  describe('getForwardRoles', () => {
    it('should return all forward roles', () => {
      const roles = manager.getForwardRoles();

      expect(roles).toEqual(['target-man', 'poacher', 'false-nine']);
      expect(roles.length).toBe(3);
    });
  });

  describe('getRoleDescription', () => {
    it('should return description for defender roles', () => {
      expect(manager.getRoleDescription('full-back')).toContain('Balanced defender');
      expect(manager.getRoleDescription('wing-back')).toContain('Attacking full-back');
      expect(manager.getRoleDescription('ball-playing-defender')).toContain('Technical defender');
    });

    it('should return description for midfielder roles', () => {
      expect(manager.getRoleDescription('defensive-midfielder')).toContain('Sits deep');
      expect(manager.getRoleDescription('box-to-box')).toContain('All-action');
      expect(manager.getRoleDescription('attacking-midfielder')).toContain('Creative playmaker');
    });

    it('should return description for forward roles', () => {
      expect(manager.getRoleDescription('target-man')).toContain('Physical striker');
      expect(manager.getRoleDescription('poacher')).toContain('Goal-focused');
      expect(manager.getRoleDescription('false-nine')).toContain('Deep-lying');
    });

    it('should return empty string for unknown role', () => {
      expect(manager.getRoleDescription('unknown' as any)).toBe('');
    });
  });

  describe('getInstructionDescription', () => {
    it('should return descriptions for tempo instructions', () => {
      expect(manager.getInstructionDescription('tempo', 'slow')).toContain('Patient buildup');
      expect(manager.getInstructionDescription('tempo', 'balanced')).toContain('Moderate pace');
      expect(manager.getInstructionDescription('tempo', 'fast')).toContain('Quick transitions');
    });

    it('should return descriptions for width instructions', () => {
      expect(manager.getInstructionDescription('width', 'narrow')).toContain('through the middle');
      expect(manager.getInstructionDescription('width', 'balanced')).toContain('full width');
      expect(manager.getInstructionDescription('width', 'wide')).toContain('Stretch the pitch');
    });

    it('should return descriptions for pressing instructions', () => {
      expect(manager.getInstructionDescription('pressing', 'low')).toContain('Sit back');
      expect(manager.getInstructionDescription('pressing', 'medium')).toContain('Press in own half');
      expect(manager.getInstructionDescription('pressing', 'high')).toContain('Aggressive pressing');
    });

    it('should return descriptions for passing style instructions', () => {
      expect(manager.getInstructionDescription('passingStyle', 'short')).toContain('Keep it on the ground');
      expect(manager.getInstructionDescription('passingStyle', 'mixed')).toContain('Vary passing');
      expect(manager.getInstructionDescription('passingStyle', 'long')).toContain('Direct play');
    });

    it('should return empty string for unknown instruction', () => {
      expect(manager.getInstructionDescription('tempo', 'unknown')).toBe('');
      expect(manager.getInstructionDescription('unknown' as any, 'balanced')).toBe('');
    });
  });

  describe('calculateRoleModifier', () => {
    it('should return 0 for undefined roles', () => {
      expect(manager.calculateRoleModifier(undefined)).toBe(0);
    });

    it('should return 0 for baseline roles', () => {
      const roles = {
        defenders: 'full-back' as const,
        midfielders: 'box-to-box' as const,
        forwards: 'target-man' as const,
      };
      expect(manager.calculateRoleModifier(roles)).toBe(0);
    });

    it('should give bonus for attacking defender roles', () => {
      const wingBackRoles = {
        defenders: 'wing-back' as const,
        midfielders: 'box-to-box' as const,
        forwards: 'target-man' as const,
      };
      expect(manager.calculateRoleModifier(wingBackRoles)).toBe(0.05);

      const ballPlayingRoles = {
        defenders: 'ball-playing-defender' as const,
        midfielders: 'box-to-box' as const,
        forwards: 'target-man' as const,
      };
      expect(manager.calculateRoleModifier(ballPlayingRoles)).toBe(0.03);
    });

    it('should give bonus for attacking midfielder', () => {
      const roles = {
        defenders: 'full-back' as const,
        midfielders: 'attacking-midfielder' as const,
        forwards: 'target-man' as const,
      };
      expect(manager.calculateRoleModifier(roles)).toBe(0.05);
    });

    it('should give penalty for defensive midfielder', () => {
      const roles = {
        defenders: 'full-back' as const,
        midfielders: 'defensive-midfielder' as const,
        forwards: 'target-man' as const,
      };
      expect(manager.calculateRoleModifier(roles)).toBe(-0.03);
    });

    it('should give bonus for clinical forwards', () => {
      const poacherRoles = {
        defenders: 'full-back' as const,
        midfielders: 'box-to-box' as const,
        forwards: 'poacher' as const,
      };
      expect(manager.calculateRoleModifier(poacherRoles)).toBe(0.05);

      const falseNineRoles = {
        defenders: 'full-back' as const,
        midfielders: 'box-to-box' as const,
        forwards: 'false-nine' as const,
      };
      expect(manager.calculateRoleModifier(falseNineRoles)).toBe(0.03);
    });

    it('should combine modifiers from multiple attacking roles', () => {
      const roles = {
        defenders: 'wing-back' as const,
        midfielders: 'attacking-midfielder' as const,
        forwards: 'poacher' as const,
      };
      // 0.05 (wing-back) + 0.05 (attacking-midfielder) + 0.05 (poacher) = 0.15
      expect(manager.calculateRoleModifier(roles)).toBeCloseTo(0.15, 10);
    });
  });

  describe('calculateInstructionsModifier', () => {
    it('should return 0 for undefined instructions', () => {
      expect(manager.calculateInstructionsModifier(undefined)).toBe(0);
    });

    it('should return 0 for balanced instructions', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'balanced' as const,
        pressing: 'medium' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0);
    });

    it('should give bonus for fast tempo', () => {
      const instructions = {
        tempo: 'fast' as const,
        width: 'balanced' as const,
        pressing: 'medium' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.05);
    });

    it('should give penalty for slow tempo', () => {
      const instructions = {
        tempo: 'slow' as const,
        width: 'balanced' as const,
        pressing: 'medium' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(-0.03);
    });

    it('should give bonus for wide play', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'wide' as const,
        pressing: 'medium' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.03);
    });

    it('should give bonus for narrow play', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'narrow' as const,
        pressing: 'medium' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.02);
    });

    it('should give bonus for high pressing', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'balanced' as const,
        pressing: 'high' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.05);
    });

    it('should give penalty for low pressing', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'balanced' as const,
        pressing: 'low' as const,
        passingStyle: 'mixed' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(-0.05);
    });

    it('should give bonus for long passing', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'balanced' as const,
        pressing: 'medium' as const,
        passingStyle: 'long' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.02);
    });

    it('should give bonus for short passing', () => {
      const instructions = {
        tempo: 'balanced' as const,
        width: 'balanced' as const,
        pressing: 'medium' as const,
        passingStyle: 'short' as const,
      };
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.03);
    });

    it('should combine modifiers from multiple attacking instructions', () => {
      const instructions = {
        tempo: 'fast' as const,
        width: 'wide' as const,
        pressing: 'high' as const,
        passingStyle: 'short' as const,
      };
      // 0.05 (fast) + 0.03 (wide) + 0.05 (high) + 0.03 (short) = 0.16
      expect(manager.calculateInstructionsModifier(instructions)).toBe(0.16);
    });

    it('should handle mixed defensive/attacking instructions', () => {
      const instructions = {
        tempo: 'slow' as const,
        width: 'wide' as const,
        pressing: 'low' as const,
        passingStyle: 'long' as const,
      };
      // -0.03 (slow) + 0.03 (wide) - 0.05 (low) + 0.02 (long) = -0.03
      expect(manager.calculateInstructionsModifier(instructions)).toBeCloseTo(-0.03, 10);
    });
  });

  describe('calculateAdvancedTacticsModifier', () => {
    it('should return 0 for default tactics', () => {
      const tactics: Tactics = {
        formation: '4-4-2',
        mentality: 'balanced',
        roles: {
          defenders: 'full-back',
          midfielders: 'box-to-box',
          forwards: 'target-man',
        },
        instructions: {
          tempo: 'balanced',
          width: 'balanced',
          pressing: 'medium',
          passingStyle: 'mixed',
        },
      };
      expect(manager.calculateAdvancedTacticsModifier(tactics)).toBe(0);
    });

    it('should combine role and instruction modifiers', () => {
      const tactics: Tactics = {
        formation: '4-4-2',
        mentality: 'balanced',
        roles: {
          defenders: 'wing-back',
          midfielders: 'attacking-midfielder',
          forwards: 'poacher',
        },
        instructions: {
          tempo: 'fast',
          width: 'wide',
          pressing: 'high',
          passingStyle: 'short',
        },
      };
      // Role: 0.05 + 0.05 + 0.05 = 0.15
      // Instructions: 0.05 + 0.03 + 0.05 + 0.03 = 0.16
      // Total: 0.31
      expect(manager.calculateAdvancedTacticsModifier(tactics)).toBeCloseTo(0.31, 10);
    });

    it('should handle tactics without roles', () => {
      const tactics: Tactics = {
        formation: '4-4-2',
        mentality: 'balanced',
        instructions: {
          tempo: 'fast',
          width: 'balanced',
          pressing: 'medium',
          passingStyle: 'mixed',
        },
      };
      // Role: 0 (undefined)
      // Instructions: 0.05
      expect(manager.calculateAdvancedTacticsModifier(tactics)).toBe(0.05);
    });

    it('should handle tactics without instructions', () => {
      const tactics: Tactics = {
        formation: '4-4-2',
        mentality: 'balanced',
        roles: {
          defenders: 'wing-back',
          midfielders: 'box-to-box',
          forwards: 'target-man',
        },
      };
      // Role: 0.05
      // Instructions: 0 (undefined)
      expect(manager.calculateAdvancedTacticsModifier(tactics)).toBe(0.05);
    });

    it('should handle defensive tactics with negative modifiers', () => {
      const tactics: Tactics = {
        formation: '4-4-2',
        mentality: 'balanced',
        roles: {
          defenders: 'full-back',
          midfielders: 'defensive-midfielder',
          forwards: 'target-man',
        },
        instructions: {
          tempo: 'slow',
          width: 'balanced',
          pressing: 'low',
          passingStyle: 'mixed',
        },
      };
      // Role: -0.03 (defensive-midfielder)
      // Instructions: -0.03 (slow) - 0.05 (low) = -0.08
      // Total: -0.11
      expect(manager.calculateAdvancedTacticsModifier(tactics)).toBe(-0.11);
    });
  });
});
