/**
 * Cup Manager Interface
 *
 * Defines the contract for cup competition management.
 */

import { Team, CupCompetition, CupFixture } from '../types';

export interface ICupManager {
  generateCupCompetition(teams: Team[], season: number, cupName?: string): CupCompetition;
  advanceTournament(cup: CupCompetition, teams: Team[]): CupCompetition | null;
  isCupComplete(cup: CupCompetition): boolean;
  getPrizeMoney(round: string, isWinner?: boolean): number;
  hasCupFixturesThisWeek(cup: CupCompetition, currentWeek: number): boolean;
  getCupFixturesForWeek(cup: CupCompetition, currentWeek: number): CupFixture[];
  updateCupProgress(cup: CupCompetition): CupCompetition;
}
