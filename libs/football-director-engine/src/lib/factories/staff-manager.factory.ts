/**
 * Staff Manager Factory
 *
 * Factory functions for creating StaffManager instances.
 * Provides both production and test/mock instances.
 */

import { IStaffManager } from '../interfaces/staff-manager.interface';
import { StaffManager } from '../staff-manager';
import { Staff, StaffRole, Team } from '../types';

/**
 * Create a production StaffManager instance
 */
export function createStaffManager(): IStaffManager {
  return new StaffManager();
}

/**
 * Create a mock StaffManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockStaffManager(
  overrides?: Partial<IStaffManager>
): IStaffManager {
  const mockStaff: Staff = {
    id: 'staff-1',
    name: 'Test Manager',
    role: 'manager',
    skill: 15,
    salary: 10000,
    specialty: 'Tactics',
    style: 'balanced',
    happiness: 80,
  };

  const mock: IStaffManager = {
    generateStaff: (_role: StaffRole, _seed?: number) => mockStaff,
    calculateStaffSalary: (_role: StaffRole, _skill: number) => 10000,
    generateStaffMarket: (_currentWeek: number, _count?: number) => [mockStaff],
    hireStaff: (_staff: Staff, team: Team, _currentMarket: Staff[]) => ({
      success: true,
      message: 'Hired successfully',
      updatedTeam: team,
      updatedMarket: [],
    }),
    fireStaff: (_staff: Staff, team: Team) => ({
      success: true,
      message: 'Fired successfully',
      updatedTeam: team,
      severancePay: 20000,
    }),
    getManagerBonus: (_team: Team) => 1.0,
    getCoachBonus: (_team: Team) => 0,
    getScoutBonus: (_team: Team) => 0,
    getTotalStaffWages: (_team: Team) => 0,
    calculateStyleCompatibility: (_managerStyle, _clubPhilosophy) => 75,
    updateManagerHappiness: (manager: Staff, _team: Team, _recentResults, _boardSatisfaction) => manager,
    getManagerHappinessEffect: (_manager: Staff) => 1.0,
    ...overrides,
  };
  return mock;
}
