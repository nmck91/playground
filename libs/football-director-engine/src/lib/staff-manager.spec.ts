/**
 * Football Director Engine - Staff Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StaffManager } from './staff-manager';
import { Staff, StaffRole, Team, ManagerStyle } from './types';
import { createMockTeam, createMockStaff } from '../__tests__';

describe('StaffManager', () => {
  let manager: StaffManager;

  beforeEach(() => {
    manager = new StaffManager();
  });

  describe('generateStaff', () => {
    it('should generate staff with all required fields', () => {
      const staff = manager.generateStaff('manager');

      expect(staff.id).toBeDefined();
      expect(staff.name).toBeDefined();
      expect(staff.role).toBe('manager');
      expect(staff.skill).toBeDefined();
      expect(staff.salary).toBeDefined();
      expect(staff.specialty).toBeDefined();
    });

    it('should generate managers with style and happiness', () => {
      const staff = manager.generateStaff('manager');

      expect(staff.style).toBeDefined();
      expect(staff.happiness).toBe(80);
    });

    it('should not add style/happiness to coaches', () => {
      const staff = manager.generateStaff('coach');

      expect(staff.style).toBeUndefined();
      expect(staff.happiness).toBeUndefined();
    });

    it('should not add style/happiness to scouts', () => {
      const staff = manager.generateStaff('scout');

      expect(staff.style).toBeUndefined();
      expect(staff.happiness).toBeUndefined();
    });

    it('should generate skill in range 8-18', () => {
      for (let i = 0; i < 50; i++) {
        const staff = manager.generateStaff('coach', 1000 + i);
        expect(staff.skill).toBeGreaterThanOrEqual(8);
        expect(staff.skill).toBeLessThanOrEqual(18);
      }
    });

    it('should generate valid manager specialty', () => {
      const validSpecialties = [
        'Tactics', 'Motivation', 'Youth Development', 'Attacking', 'Defensive',
        'Counter-Attack', 'Possession', 'Set Pieces', 'Man Management', 'Squad Rotation',
      ];

      const staff = manager.generateStaff('manager', 12345);
      expect(validSpecialties).toContain(staff.specialty);
    });

    it('should generate valid coach specialty', () => {
      const validSpecialties = [
        'Fitness', 'Technical Skills', 'Goalkeeping', 'Finishing', 'Defending',
        'Youth Development', 'Set Pieces', 'Speed Training', 'Tactical Awareness', 'Mental Strength',
      ];

      const staff = manager.generateStaff('coach', 12345);
      expect(validSpecialties).toContain(staff.specialty);
    });

    it('should generate valid scout specialty', () => {
      const validSpecialties = [
        'South America', 'Europe', 'Africa', 'Asia', 'North America',
        'Youth Players', 'Bargain Deals', 'Hidden Gems', 'Elite Talent', 'Lower Leagues',
      ];

      const staff = manager.generateStaff('scout', 12345);
      expect(validSpecialties).toContain(staff.specialty);
    });

    it('should generate valid manager style', () => {
      const validStyles: ManagerStyle[] = [
        'attacking', 'possession', 'defensive', 'balanced', 'direct', 'counter-attack',
      ];

      const staff = manager.generateStaff('manager', 12345);
      expect(validStyles).toContain(staff.style!);
    });

    it('should generate deterministic staff with seed', () => {
      const staff1 = manager.generateStaff('manager', 12345);
      const staff2 = manager.generateStaff('manager', 12345);

      expect(staff1.name).toBe(staff2.name);
      expect(staff1.skill).toBe(staff2.skill);
      expect(staff1.specialty).toBe(staff2.specialty);
      expect(staff1.style).toBe(staff2.style);
    });

    it('should generate different staff with different seeds', () => {
      const staff1 = manager.generateStaff('manager', 12345);
      const staff2 = manager.generateStaff('manager', 67890);

      const isDifferent =
        staff1.name !== staff2.name ||
        staff1.skill !== staff2.skill ||
        staff1.specialty !== staff2.specialty;

      expect(isDifferent).toBe(true);
    });
  });

  describe('calculateStaffSalary', () => {
    it('should calculate manager salary correctly', () => {
      // Manager: base 5000 + (skill * 500)
      const salary8 = manager.calculateStaffSalary('manager', 8);
      const salary13 = manager.calculateStaffSalary('manager', 13);
      const salary18 = manager.calculateStaffSalary('manager', 18);

      expect(salary8).toBe(9000); // 5000 + 4000
      expect(salary13).toBe(11500); // 5000 + 6500
      expect(salary18).toBe(14000); // 5000 + 9000
    });

    it('should calculate coach salary correctly', () => {
      // Coach: base 3000 + (skill * 300)
      const salary8 = manager.calculateStaffSalary('coach', 8);
      const salary13 = manager.calculateStaffSalary('coach', 13);
      const salary18 = manager.calculateStaffSalary('coach', 18);

      expect(salary8).toBe(5400); // 3000 + 2400
      expect(salary13).toBe(6900); // 3000 + 3900
      expect(salary18).toBe(8400); // 3000 + 5400
    });

    it('should calculate scout salary correctly', () => {
      // Scout: base 2000 + (skill * 250), rounded to nearest 100
      const salary8 = manager.calculateStaffSalary('scout', 8);
      const salary13 = manager.calculateStaffSalary('scout', 13);
      const salary18 = manager.calculateStaffSalary('scout', 18);

      expect(salary8).toBe(4000); // 2000 + 2000 = 4000
      expect(salary13).toBe(5300); // 2000 + 3250 = 5250, rounded to 5300
      expect(salary18).toBe(6500); // 2000 + 4500 = 6500
    });

    it('should round salaries to nearest 100', () => {
      const salary = manager.calculateStaffSalary('manager', 10);
      expect(salary % 100).toBe(0);
    });
  });

  describe('generateStaffMarket', () => {
    it('should generate 15 staff by default', () => {
      const market = manager.generateStaffMarket(1);
      expect(market).toHaveLength(15);
    });

    it('should generate balanced distribution of roles', () => {
      const market = manager.generateStaffMarket(1);

      const managers = market.filter(s => s.role === 'manager');
      const coaches = market.filter(s => s.role === 'coach');
      const scouts = market.filter(s => s.role === 'scout');

      expect(managers).toHaveLength(5);
      expect(coaches).toHaveLength(5);
      expect(scouts).toHaveLength(5);
    });

    it('should generate deterministic market for same week', () => {
      const market1 = manager.generateStaffMarket(10);
      const market2 = manager.generateStaffMarket(10);

      expect(market1.length).toBe(market2.length);

      market1.forEach((staff1, index) => {
        const staff2 = market2[index];
        expect(staff1.name).toBe(staff2.name);
        expect(staff1.role).toBe(staff2.role);
        expect(staff1.skill).toBe(staff2.skill);
      });
    });

    it('should generate different market for different weeks', () => {
      const market1 = manager.generateStaffMarket(1);
      const market2 = manager.generateStaffMarket(10);

      const names1 = market1.map(s => s.name).sort();
      const names2 = market2.map(s => s.name).sort();

      expect(names1).not.toEqual(names2);
    });

    it('should respect custom count parameter', () => {
      const market = manager.generateStaffMarket(1, 6);
      expect(market).toHaveLength(6);
    });
  });

  describe('hireStaff', () => {
    it('should hire staff successfully with sufficient budget', () => {
      const team = createMockTeam({
        budget: 100000,
        staff: [],
      });

      const staff = createMockStaff({
        role: 'manager',
        salary: 10000,
      });

      const market = [staff];

      const result = manager.hireStaff(staff, team, market);

      expect(result.success).toBe(true);
      expect(result.updatedTeam?.staff).toHaveLength(1);
      expect(result.updatedMarket).toHaveLength(0);
    });

    it('should fail hiring with insufficient budget', () => {
      const team = createMockTeam({
        budget: 20000, // Less than 4 weeks salary
        staff: [],
      });

      const staff = createMockStaff({
        role: 'manager',
        salary: 10000, // Need 40,000 budget
      });

      const market = [staff];

      const result = manager.hireStaff(staff, team, market);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient budget');
    });

    it('should enforce manager limit (max 1)', () => {
      const existingManager = createMockStaff({ role: 'manager', id: 'mgr-1' });
      const team = createMockTeam({
        budget: 500000,
        staff: [existingManager],
      });

      const newManager = createMockStaff({ role: 'manager', id: 'mgr-2', salary: 10000 });
      const market = [newManager];

      const result = manager.hireStaff(newManager, team, market);

      expect(result.success).toBe(false);
      expect(result.message).toContain('maximum manager');
    });

    it('should enforce coach limit (max 3)', () => {
      const coaches = [
        createMockStaff({ role: 'coach', id: 'c1' }),
        createMockStaff({ role: 'coach', id: 'c2' }),
        createMockStaff({ role: 'coach', id: 'c3' }),
      ];

      const team = createMockTeam({
        budget: 500000,
        staff: coaches,
      });

      const newCoach = createMockStaff({ role: 'coach', id: 'c4', salary: 5000 });
      const market = [newCoach];

      const result = manager.hireStaff(newCoach, team, market);

      expect(result.success).toBe(false);
      expect(result.message).toContain('maximum coach');
    });

    it('should allow hiring 3rd coach when 2 already hired', () => {
      const coaches = [
        createMockStaff({ role: 'coach', id: 'c1' }),
        createMockStaff({ role: 'coach', id: 'c2' }),
      ];

      const team = createMockTeam({
        budget: 500000,
        staff: coaches,
      });

      const newCoach = createMockStaff({ role: 'coach', id: 'c3', salary: 5000 });
      const market = [newCoach];

      const result = manager.hireStaff(newCoach, team, market);

      expect(result.success).toBe(true);
      expect(result.updatedTeam?.staff).toHaveLength(3);
    });

    it('should enforce scout limit (max 1)', () => {
      const existingScout = createMockStaff({ role: 'scout', id: 's1' });
      const team = createMockTeam({
        budget: 500000,
        staff: [existingScout],
      });

      const newScout = createMockStaff({ role: 'scout', id: 's2', salary: 4000 });
      const market = [newScout];

      const result = manager.hireStaff(newScout, team, market);

      expect(result.success).toBe(false);
      expect(result.message).toContain('maximum scout');
    });

    it('should remove hired staff from market', () => {
      const team = createMockTeam({
        budget: 100000,
        staff: [],
      });

      const staff1 = createMockStaff({ role: 'manager', id: 's1', salary: 10000 });
      const staff2 = createMockStaff({ role: 'coach', id: 's2', salary: 5000 });
      const market = [staff1, staff2];

      const result = manager.hireStaff(staff1, team, market);

      expect(result.updatedMarket).toHaveLength(1);
      expect(result.updatedMarket?.[0].id).toBe('s2');
    });

    it('should not mutate original team', () => {
      const originalTeam = createMockTeam({
        budget: 100000,
        staff: [],
      });

      const staff = createMockStaff({ role: 'manager', salary: 10000 });
      const market = [staff];

      const result = manager.hireStaff(staff, originalTeam, market);

      expect(originalTeam.staff).toHaveLength(0);
      expect(result.updatedTeam?.staff).toHaveLength(1);
    });
  });

  describe('fireStaff', () => {
    it('should fire staff successfully', () => {
      const staff = createMockStaff({
        id: 's1',
        role: 'manager',
        salary: 10000,
      });

      const team = createMockTeam({
        budget: 500000,
        staff: [staff],
      });

      const result = manager.fireStaff(staff, team);

      expect(result.success).toBe(true);
      expect(result.updatedTeam?.staff).toHaveLength(0);
    });

    it('should calculate severance pay (2 weeks salary)', () => {
      const staff = createMockStaff({
        id: 's1',
        role: 'manager',
        salary: 10000,
      });

      const team = createMockTeam({
        budget: 500000,
        staff: [staff],
      });

      const result = manager.fireStaff(staff, team);

      expect(result.severancePay).toBe(20000); // 2 weeks
    });

    it('should deduct severance pay from budget', () => {
      const staff = createMockStaff({
        id: 's1',
        role: 'manager',
        salary: 10000,
      });

      const team = createMockTeam({
        budget: 500000,
        staff: [staff],
      });

      const result = manager.fireStaff(staff, team);

      expect(result.updatedTeam?.budget).toBe(480000); // 500000 - 20000
    });

    it('should fail firing non-existent staff', () => {
      const staff = createMockStaff({
        id: 's1',
        role: 'manager',
      });

      const team = createMockTeam({
        budget: 500000,
        staff: [],
      });

      const result = manager.fireStaff(staff, team);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should not mutate original team', () => {
      const staff = createMockStaff({
        id: 's1',
        role: 'manager',
        salary: 10000,
      });

      const originalTeam = createMockTeam({
        budget: 500000,
        staff: [staff],
      });

      const result = manager.fireStaff(staff, originalTeam);

      expect(originalTeam.staff).toHaveLength(1);
      expect(result.updatedTeam?.staff).toHaveLength(0);
    });
  });

  describe('getManagerBonus', () => {
    it('should return 0.9 penalty with no manager', () => {
      const team = createMockTeam({
        staff: [],
      });

      expect(manager.getManagerBonus(team)).toBe(0.9);
    });

    it('should return 0.95 for skill 8 manager', () => {
      const mgr = createMockStaff({
        role: 'manager',
        skill: 8,
      });

      const team = createMockTeam({
        staff: [mgr],
      });

      expect(manager.getManagerBonus(team)).toBe(0.95);
    });

    it('should return 1.0 for skill 13 manager', () => {
      const mgr = createMockStaff({
        role: 'manager',
        skill: 13,
      });

      const team = createMockTeam({
        staff: [mgr],
      });

      expect(manager.getManagerBonus(team)).toBe(1.0);
    });

    it('should return 1.05 for skill 18 manager', () => {
      const mgr = createMockStaff({
        role: 'manager',
        skill: 18,
      });

      const team = createMockTeam({
        staff: [mgr],
      });

      expect(manager.getManagerBonus(team)).toBe(1.05);
    });

    it('should cap bonus between 0.9 and 1.1', () => {
      // Even if we somehow had a manager with extreme skill
      const lowSkillMgr = createMockStaff({
        role: 'manager',
        skill: 1,
      });

      const highSkillMgr = createMockStaff({
        role: 'manager',
        skill: 30,
      });

      const lowTeam = createMockTeam({ staff: [lowSkillMgr] });
      const highTeam = createMockTeam({ staff: [highSkillMgr] });

      expect(manager.getManagerBonus(lowTeam)).toBeGreaterThanOrEqual(0.9);
      expect(manager.getManagerBonus(highTeam)).toBeLessThanOrEqual(1.1);
    });
  });

  describe('getCoachBonus', () => {
    it('should return 0 with no coaches', () => {
      const team = createMockTeam({
        staff: [],
      });

      expect(manager.getCoachBonus(team)).toBe(0);
    });

    it('should return 0 for skill 10 coach', () => {
      const coach = createMockStaff({
        role: 'coach',
        skill: 10,
      });

      const team = createMockTeam({
        staff: [coach],
      });

      expect(manager.getCoachBonus(team)).toBe(0);
    });

    it('should return 0.8 for skill 18 coach', () => {
      const coach = createMockStaff({
        role: 'coach',
        skill: 18,
      });

      const team = createMockTeam({
        staff: [coach],
      });

      // (18 - 10) * 0.1 = 0.8
      expect(manager.getCoachBonus(team)).toBe(0.8);
    });

    it('should calculate average skill for multiple coaches', () => {
      const coaches = [
        createMockStaff({ role: 'coach', skill: 12 }),
        createMockStaff({ role: 'coach', skill: 14 }),
        createMockStaff({ role: 'coach', skill: 16 }),
      ];

      const team = createMockTeam({
        staff: coaches,
      });

      // Average skill = (12 + 14 + 16) / 3 = 14
      // Bonus = (14 - 10) * 0.1 = 0.4
      expect(manager.getCoachBonus(team)).toBe(0.4);
    });

    it('should cap bonus at 1.0', () => {
      const coach = createMockStaff({
        role: 'coach',
        skill: 30, // Extreme skill
      });

      const team = createMockTeam({
        staff: [coach],
      });

      expect(manager.getCoachBonus(team)).toBe(1.0);
    });

    it('should not return negative bonus', () => {
      const coach = createMockStaff({
        role: 'coach',
        skill: 5, // Below 10
      });

      const team = createMockTeam({
        staff: [coach],
      });

      expect(manager.getCoachBonus(team)).toBe(0);
    });
  });

  describe('getScoutBonus', () => {
    it('should return 0 with no scout', () => {
      const team = createMockTeam({
        staff: [],
      });

      expect(manager.getScoutBonus(team)).toBe(0);
    });

    it('should return 0 for skill 8-10', () => {
      const scout = createMockStaff({
        role: 'scout',
        skill: 10,
      });

      const team = createMockTeam({
        staff: [scout],
      });

      expect(manager.getScoutBonus(team)).toBe(0);
    });

    it('should return 1 for skill 11-13', () => {
      const scout = createMockStaff({
        role: 'scout',
        skill: 12,
      });

      const team = createMockTeam({
        staff: [scout],
      });

      expect(manager.getScoutBonus(team)).toBe(1);
    });

    it('should return 2 for skill 14-16', () => {
      const scout = createMockStaff({
        role: 'scout',
        skill: 15,
      });

      const team = createMockTeam({
        staff: [scout],
      });

      expect(manager.getScoutBonus(team)).toBe(2);
    });

    it('should return 3 for skill 17+', () => {
      const scout = createMockStaff({
        role: 'scout',
        skill: 18,
      });

      const team = createMockTeam({
        staff: [scout],
      });

      expect(manager.getScoutBonus(team)).toBe(3);
    });
  });

  describe('getTotalStaffWages', () => {
    it('should return 0 for no staff', () => {
      const team = createMockTeam({
        staff: [],
      });

      expect(manager.getTotalStaffWages(team)).toBe(0);
    });

    it('should calculate total for single staff', () => {
      const staff = createMockStaff({
        role: 'manager',
        salary: 10000,
      });

      const team = createMockTeam({
        staff: [staff],
      });

      expect(manager.getTotalStaffWages(team)).toBe(10000);
    });

    it('should calculate total for multiple staff', () => {
      const staff = [
        createMockStaff({ role: 'manager', salary: 10000 }),
        createMockStaff({ role: 'coach', salary: 5000 }),
        createMockStaff({ role: 'scout', salary: 4000 }),
      ];

      const team = createMockTeam({
        staff,
      });

      expect(manager.getTotalStaffWages(team)).toBe(19000);
    });
  });

  describe('calculateStyleCompatibility', () => {
    it('should return 50 for undefined manager style', () => {
      expect(manager.calculateStyleCompatibility(undefined, 'attacking')).toBe(50);
    });

    it('should return 50 for undefined club philosophy', () => {
      expect(manager.calculateStyleCompatibility('attacking', undefined)).toBe(50);
    });

    it('should return 100 for perfect match', () => {
      expect(manager.calculateStyleCompatibility('attacking', 'attacking')).toBe(100);
      expect(manager.calculateStyleCompatibility('possession', 'possession')).toBe(100);
      expect(manager.calculateStyleCompatibility('defensive', 'defensive')).toBe(100);
    });

    it('should return 75 for compatible styles', () => {
      // Attacking compatible with balanced, direct
      expect(manager.calculateStyleCompatibility('attacking', 'balanced')).toBe(75);
      expect(manager.calculateStyleCompatibility('attacking', 'direct')).toBe(75);

      // Possession compatible with balanced, attacking
      expect(manager.calculateStyleCompatibility('possession', 'balanced')).toBe(75);
      expect(manager.calculateStyleCompatibility('possession', 'attacking')).toBe(75);

      // Defensive compatible with counter-attack, balanced
      expect(manager.calculateStyleCompatibility('defensive', 'counter-attack')).toBe(75);
      expect(manager.calculateStyleCompatibility('defensive', 'balanced')).toBe(75);
    });

    it('should return 40 for incompatible styles', () => {
      // Attacking incompatible with defensive, possession
      expect(manager.calculateStyleCompatibility('attacking', 'defensive')).toBe(40);
      expect(manager.calculateStyleCompatibility('attacking', 'possession')).toBe(40);

      // Possession incompatible with defensive, direct
      expect(manager.calculateStyleCompatibility('possession', 'defensive')).toBe(40);
      expect(manager.calculateStyleCompatibility('possession', 'direct')).toBe(40);
    });
  });

  describe('updateManagerHappiness', () => {
    it('should not affect non-manager staff', () => {
      const coach = createMockStaff({
        role: 'coach',
      });

      const team = createMockTeam({});
      const result = manager.updateManagerHappiness(coach, team, [], 50);

      expect(result).toEqual(coach);
    });

    it('should increase happiness with good results', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
      });

      const team = createMockTeam({});
      const result = manager.updateManagerHappiness(mgr, team, ['W', 'W', 'W', 'W', 'W'], 50);

      // 5 wins * 4 = +20 points
      expect(result.happiness).toBeGreaterThan(50);
    });

    it('should decrease happiness with bad results', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
      });

      const team = createMockTeam({});
      const result = manager.updateManagerHappiness(mgr, team, ['L', 'L', 'L', 'L', 'L'], 50);

      // 5 losses * 4 = -20 points
      expect(result.happiness).toBeLessThan(50);
    });

    it('should increase happiness with happy board', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
      });

      const team = createMockTeam({});
      const result = manager.updateManagerHappiness(mgr, team, [], 80);

      // Board at 80 = positive factor
      expect(result.happiness).toBeGreaterThan(50);
    });

    it('should decrease happiness with unhappy board', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
      });

      const team = createMockTeam({});
      const result = manager.updateManagerHappiness(mgr, team, [], 20);

      // Board at 20 = negative factor
      expect(result.happiness).toBeLessThan(50);
    });

    it('should increase happiness with matching philosophy', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
        style: 'attacking',
      });

      const team = createMockTeam({
        philosophy: 'attacking',
      });

      const result = manager.updateManagerHappiness(mgr, team, [], 50);

      // Perfect match = +5 points
      expect(result.happiness).toBeGreaterThan(50);
    });

    it('should increase happiness with good budget', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
      });

      const team = createMockTeam({
        budget: 2000000, // >1M
      });

      const result = manager.updateManagerHappiness(mgr, team, [], 50);

      // Good budget = +3 points
      expect(result.happiness).toBeGreaterThan(50);
    });

    it('should clamp happiness between 0 and 100', () => {
      const lowMgr = createMockStaff({
        role: 'manager',
        happiness: 10,
      });

      const highMgr = createMockStaff({
        role: 'manager',
        happiness: 90,
      });

      const team = createMockTeam({});

      // Try to push below 0
      const lowResult = manager.updateManagerHappiness(lowMgr, team, ['L', 'L', 'L', 'L', 'L'], 0);
      expect(lowResult.happiness).toBeGreaterThanOrEqual(0);

      // Try to push above 100
      const highResult = manager.updateManagerHappiness(highMgr, team, ['W', 'W', 'W', 'W', 'W'], 100);
      expect(highResult.happiness).toBeLessThanOrEqual(100);
    });
  });

  describe('getManagerHappinessEffect', () => {
    it('should return 1.0 for non-manager staff', () => {
      const coach = createMockStaff({
        role: 'coach',
      });

      expect(manager.getManagerHappinessEffect(coach)).toBe(1.0);
    });

    it('should return 1.05 for happiness 80-100', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 90,
      });

      expect(manager.getManagerHappinessEffect(mgr)).toBe(1.05);
    });

    it('should return 1.02 for happiness 60-79', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 70,
      });

      expect(manager.getManagerHappinessEffect(mgr)).toBe(1.02);
    });

    it('should return 1.0 for happiness 40-59', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 50,
      });

      expect(manager.getManagerHappinessEffect(mgr)).toBe(1.0);
    });

    it('should return 0.98 for happiness 20-39', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 30,
      });

      expect(manager.getManagerHappinessEffect(mgr)).toBe(0.98);
    });

    it('should return 0.95 for happiness 0-19', () => {
      const mgr = createMockStaff({
        role: 'manager',
        happiness: 10,
      });

      expect(manager.getManagerHappinessEffect(mgr)).toBe(0.95);
    });
  });
});
