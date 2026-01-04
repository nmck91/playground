/**
 * Football Director Engine - Staff Manager
 * Manages hiring, firing, and effects of staff (managers, coaches, scouts)
 */

import { Staff, StaffRole, Team, ManagerStyle } from './types';
import { IStaffManager } from './interfaces/staff-manager.interface';

// Re-export interface for convenience
export { IStaffManager };

/**
 * Staff Manager Implementation
 */
export class StaffManager implements IStaffManager {
  /**
   * Name pools for generating staff
   */
  private readonly firstNames = [
    'Alex', 'Ben', 'Chris', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
    'Isabel', 'James', 'Kate', 'Louis', 'Maria', 'Nathan', 'Olivia', 'Peter',
    'Quinn', 'Rachel', 'Sam', 'Taylor', 'Uma', 'Victor', 'Wendy', 'Xavier',
    'Yara', 'Zack', 'Amy', 'Brian', 'Carol', 'Daniel', 'Eva', 'Felix',
  ];

  private readonly lastNames = [
    'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris',
    'Ivanov', 'Johnson', 'Kim', 'Lopez', 'Miller', 'Novak', "O'Brien", 'Patel',
    'Quinn', 'Rodriguez', 'Smith', 'Taylor', 'Ueda', 'Villa', 'Wang', 'Xavier',
    'Yamamoto', 'Zhang', 'Adams', 'Baker', 'Collins', 'Diaz', 'Edwards', 'Fisher',
  ];

  private readonly managerSpecialties = [
    'Tactics', 'Motivation', 'Youth Development', 'Attacking', 'Defensive',
    'Counter-Attack', 'Possession', 'Set Pieces', 'Man Management', 'Squad Rotation',
  ];

  private readonly coachSpecialties = [
    'Fitness', 'Technical Skills', 'Goalkeeping', 'Finishing', 'Defending',
    'Youth Development', 'Set Pieces', 'Speed Training', 'Tactical Awareness', 'Mental Strength',
  ];

  private readonly scoutSpecialties = [
    'South America', 'Europe', 'Africa', 'Asia', 'North America',
    'Youth Players', 'Bargain Deals', 'Hidden Gems', 'Elite Talent', 'Lower Leagues',
  ];

  private readonly managerStyles: ManagerStyle[] = [
    'attacking',
    'possession',
    'defensive',
    'balanced',
    'direct',
    'counter-attack',
  ];

  /**
   * Generate a random staff member
   */
  generateStaff(role: StaffRole, seed?: number): Staff {
    const random = seed ? this.seededRandom(seed) : Math.random;

    const firstName = this.firstNames[Math.floor(random() * this.firstNames.length)];
    const lastName = this.lastNames[Math.floor(random() * this.lastNames.length)];
    const name = `${firstName} ${lastName}`;

    // Skill range: 8-18 (no extremes in market)
    const skill = Math.floor(random() * 11) + 8;

    // Salary based on skill (more expensive than players)
    const salary = this.calculateStaffSalary(role, skill);

    // Get appropriate specialty
    let specialtyPool: string[];
    switch (role) {
      case 'manager':
        specialtyPool = this.managerSpecialties;
        break;
      case 'coach':
        specialtyPool = this.coachSpecialties;
        break;
      case 'scout':
        specialtyPool = this.scoutSpecialties;
        break;
    }
    const specialty = specialtyPool[Math.floor(random() * specialtyPool.length)];

    // Manager-specific properties
    let style: ManagerStyle | undefined;
    let happiness: number | undefined;

    if (role === 'manager') {
      style = this.managerStyles[Math.floor(random() * this.managerStyles.length)];
      happiness = 80; // New managers start with good happiness
    }

    return {
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      role,
      skill,
      salary,
      specialty,
      style,
      happiness,
    };
  }

  /**
   * Calculate staff salary based on role and skill
   */
  calculateStaffSalary(role: StaffRole, skill: number): number {
    let baseSalary: number;
    let skillMultiplier: number;

    switch (role) {
      case 'manager':
        baseSalary = 5000; // Managers base salary
        skillMultiplier = 500; // Extra per skill point
        break;
      case 'coach':
        baseSalary = 3000; // Coaches base salary
        skillMultiplier = 300; // Extra per skill point
        break;
      case 'scout':
        baseSalary = 2000; // Scouts base salary
        skillMultiplier = 250; // Extra per skill point
        break;
    }

    // Linear growth based on skill (much more reasonable than exponential)
    const salary = baseSalary + (skill * skillMultiplier);

    return Math.round(salary / 100) * 100; // Round to nearest 100
  }

  /**
   * Generate staff market (available for hire)
   */
  generateStaffMarket(currentWeek: number, count = 15): Staff[] {
    const market: Staff[] = [];
    const seed = currentWeek * 1000;

    // Generate mix of roles
    const rolesDistribution: StaffRole[] = [
      'manager', 'manager', 'manager', 'manager', 'manager', // 5 managers
      'coach', 'coach', 'coach', 'coach', 'coach', // 5 coaches
      'scout', 'scout', 'scout', 'scout', 'scout', // 5 scouts
    ];

    for (let i = 0; i < Math.min(count, rolesDistribution.length); i++) {
      const staff = this.generateStaff(rolesDistribution[i], seed + i);
      market.push(staff);
    }

    return market;
  }

  /**
   * Hire a staff member
   */
  hireStaff(
    staff: Staff,
    team: Team,
    currentMarket: Staff[]
  ): {
    success: boolean;
    message: string;
    updatedTeam?: Team;
    updatedMarket?: Staff[];
  } {
    // Validate budget
    if (team.budget < staff.salary * 4) {
      // Need at least 4 weeks salary as buffer
      return {
        success: false,
        message: 'Insufficient budget (need at least 4 weeks salary as buffer)',
      };
    }

    // Check if already have staff in this role
    const existingStaff = team.staff.filter((s) => s.role === staff.role);

    // Limit: 1 manager, 3 coaches, 1 scout
    let maxCount: number;
    switch (staff.role) {
      case 'manager':
        maxCount = 1;
        break;
      case 'coach':
        maxCount = 3;
        break;
      case 'scout':
        maxCount = 1;
        break;
    }

    if (existingStaff.length >= maxCount) {
      return {
        success: false,
        message: `Already have maximum ${staff.role}s (${maxCount})`,
      };
    }

    // Add staff to team
    const updatedTeam: Team = {
      ...team,
      staff: [...team.staff, staff],
    };

    // Remove from market
    const updatedMarket = currentMarket.filter((s) => s.id !== staff.id);

    return {
      success: true,
      message: `Hired ${staff.name} as ${staff.role}`,
      updatedTeam,
      updatedMarket,
    };
  }

  /**
   * Fire a staff member
   */
  fireStaff(
    staff: Staff,
    team: Team
  ): {
    success: boolean;
    message: string;
    updatedTeam?: Team;
    severancePay?: number;
  } {
    // Check if staff exists in team
    const staffExists = team.staff.find((s) => s.id === staff.id);
    if (!staffExists) {
      return {
        success: false,
        message: 'Staff member not found in team',
      };
    }

    // Calculate severance pay (2 weeks salary)
    const severancePay = staff.salary * 2;

    // Remove staff from team
    const updatedTeam: Team = {
      ...team,
      staff: team.staff.filter((s) => s.id !== staff.id),
      budget: team.budget - severancePay,
    };

    return {
      success: true,
      message: `Fired ${staff.name} (severance: £${severancePay.toLocaleString()})`,
      updatedTeam,
      severancePay,
    };
  }

  /**
   * Get manager bonus (affects match results)
   * Returns multiplier: 1.0 = no effect, 1.1 = 10% boost, 0.9 = 10% penalty
   */
  getManagerBonus(team: Team): number {
    const manager = team.staff.find((s) => s.role === 'manager');

    if (!manager) {
      // No manager = 10% penalty
      return 0.9;
    }

    // Manager skill affects team performance
    // Skill 8 = 0.95x (5% penalty)
    // Skill 13 = 1.0x (neutral)
    // Skill 18 = 1.05x (5% boost)
    const baseBonus = 0.95 + (manager.skill - 8) * 0.01;

    return Math.max(0.9, Math.min(1.1, baseBonus));
  }

  /**
   * Get coach bonus (affects player development)
   * Returns additional skill growth per season
   */
  getCoachBonus(team: Team): number {
    const coaches = team.staff.filter((s) => s.role === 'coach');

    if (coaches.length === 0) {
      return 0; // No bonus
    }

    // Average coach skill
    const avgSkill = coaches.reduce((sum, c) => sum + c.skill, 0) / coaches.length;

    // Each point of skill above 10 = 0.1 extra skill growth
    const bonus = (avgSkill - 10) * 0.1;

    return Math.max(0, Math.min(1.0, bonus)); // Cap at +1.0 skill per season
  }

  /**
   * Get scout bonus (affects transfer market quality)
   * Returns number of extra high-quality players in transfer market
   */
  getScoutBonus(team: Team): number {
    const scout = team.staff.find((s) => s.role === 'scout');

    if (!scout) {
      return 0; // No bonus
    }

    // Scout skill affects quality of transfer targets
    // Skill 8-10 = 0 bonus
    // Skill 11-13 = 1 extra high-quality player
    // Skill 14-16 = 2 extra high-quality players
    // Skill 17+ = 3 extra high-quality players
    if (scout.skill >= 17) return 3;
    if (scout.skill >= 14) return 2;
    if (scout.skill >= 11) return 1;
    return 0;
  }

  /**
   * Get total staff wages
   */
  getTotalStaffWages(team: Team): number {
    return team.staff.reduce((total, staff) => total + staff.salary, 0);
  }

  /**
   * Calculate style compatibility between club philosophy and manager style
   * Returns 0-100 score (100 = perfect match)
   */
  calculateStyleCompatibility(
    managerStyle: ManagerStyle | undefined,
    clubPhilosophy: string | undefined
  ): number {
    if (!managerStyle || !clubPhilosophy) {
      return 50; // Neutral if either is undefined
    }

    // Perfect match = 100
    if (managerStyle === clubPhilosophy) {
      return 100;
    }

    // Compatible styles = 75
    const compatiblePairs: Record<string, string[]> = {
      attacking: ['balanced', 'direct'],
      possession: ['balanced', 'attacking'],
      defensive: ['counter-attack', 'balanced'],
      balanced: ['attacking', 'possession', 'defensive'],
      direct: ['attacking', 'counter-attack'],
      'counter-attack': ['defensive', 'direct'],
    };

    if (compatiblePairs[managerStyle]?.includes(clubPhilosophy)) {
      return 75;
    }

    // Incompatible styles = 40
    return 40;
  }

  /**
   * Update manager happiness based on various factors
   */
  updateManagerHappiness(
    manager: Staff,
    team: Team,
    recentResults: ('W' | 'D' | 'L')[], // Last 5 matches
    boardSatisfaction: number // 0-100
  ): Staff {
    if (manager.role !== 'manager' || manager.happiness === undefined) {
      return manager;
    }

    let happiness = manager.happiness;

    // Factor 1: Recent Results (±20 points)
    const wins = recentResults.filter(r => r === 'W').length;
    const losses = recentResults.filter(r => r === 'L').length;
    const resultsFactor = (wins * 4) - (losses * 4); // -20 to +20
    happiness += resultsFactor;

    // Factor 2: Board Satisfaction (±15 points)
    // If board is happy (>60), manager is relieved (+5 to +15)
    // If board is unhappy (<40), manager is stressed (-15 to -5)
    const boardFactor = ((boardSatisfaction - 50) / 10) * 3;
    happiness += boardFactor;

    // Factor 3: Philosophy Match (±10 points)
    const compatibility = this.calculateStyleCompatibility(manager.style, team.philosophy);
    const philosophyFactor = ((compatibility - 50) / 10); // -5 to +5
    happiness += philosophyFactor;

    // Factor 4: Budget/Spending (±5 points)
    // Managers are happier if they can spend (budget > £1M)
    const budgetFactor = team.budget > 1000000 ? 3 : team.budget > 500000 ? 0 : -3;
    happiness += budgetFactor;

    // Clamp between 0-100
    happiness = Math.max(0, Math.min(100, happiness));

    return {
      ...manager,
      happiness: Math.round(happiness),
    };
  }

  /**
   * Get manager happiness effect on team performance
   * Returns multiplier: 1.0 = neutral, 1.05 = 5% boost, 0.95 = 5% penalty
   */
  getManagerHappinessEffect(manager: Staff): number {
    if (manager.role !== 'manager' || manager.happiness === undefined) {
      return 1.0;
    }

    // Happiness 80-100 = +5% boost
    // Happiness 40-60 = neutral
    // Happiness 0-20 = -5% penalty
    if (manager.happiness >= 80) {
      return 1.05;
    } else if (manager.happiness >= 60) {
      return 1.02;
    } else if (manager.happiness >= 40) {
      return 1.0;
    } else if (manager.happiness >= 20) {
      return 0.98;
    } else {
      return 0.95;
    }
  }

  /**
   * Seeded random number generator for deterministic generation
   */
  private seededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}
