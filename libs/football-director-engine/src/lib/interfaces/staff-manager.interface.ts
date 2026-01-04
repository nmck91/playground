/**
 * Staff Manager Interface
 *
 * Defines the contract for staff hiring, firing, and management.
 */

import { Team, Staff, StaffRole, ManagerStyle } from '../types';

export interface IStaffManager {
  generateStaff(role: StaffRole, seed?: number): Staff;
  calculateStaffSalary(role: StaffRole, skill: number): number;
  generateStaffMarket(currentWeek: number, count?: number): Staff[];
  hireStaff(
    staff: Staff,
    team: Team,
    currentMarket: Staff[]
  ): {
    success: boolean;
    message: string;
    updatedTeam?: Team;
    updatedMarket?: Staff[];
  };
  fireStaff(
    staff: Staff,
    team: Team
  ): {
    success: boolean;
    message: string;
    updatedTeam?: Team;
    severancePay?: number;
  };
  getManagerBonus(team: Team): number;
  getCoachBonus(team: Team): number;
  getScoutBonus(team: Team): number;
  getTotalStaffWages(team: Team): number;
  calculateStyleCompatibility(
    managerStyle: ManagerStyle | undefined,
    clubPhilosophy: string | undefined
  ): number;
  updateManagerHappiness(
    manager: Staff,
    team: Team,
    recentResults: ('W' | 'D' | 'L')[],
    boardSatisfaction: number
  ): Staff;
  getManagerHappinessEffect(manager: Staff): number;
}
