/**
 * Football Director Engine - Records Manager
 * Tracks season records and club records
 */

import {
  SeasonRecords,
  ClubRecords,
  MatchResult,
  LeagueTable,
  Team,
  Fixture,
} from './types';
import { IRecordsManager } from './interfaces/records-manager.interface';

// Re-export interface for convenience
export type { IRecordsManager };

/**
 * Records Manager Implementation
 */
export class RecordsManager implements IRecordsManager {
  /**
   * Calculate season records from completed season data
   */
  calculateSeasonRecords(
    season: number,
    finalTable: LeagueTable,
    matchHistory: MatchResult[],
    fixtures: Fixture[],
    playerTeam: Team,
    teamId: string
  ): SeasonRecords {
    // Get all matches for this team this season
    const teamMatches = matchHistory.filter(
      (match) => match.homeTeam === playerTeam.name || match.awayTeam === playerTeam.name
    );

    // Find biggest win and loss
    const { biggestWin, biggestLoss } = this.findBiggestResults(teamMatches, playerTeam.name);

    // Calculate streaks
    const { longestWinStreak, longestUnbeatenStreak } = this.calculateStreaks(
      fixtures,
      teamId
    );

    // Get top scorers from team
    const topScorer = playerTeam.players
      .filter((p) => p.stats.goals > 0)
      .sort((a, b) => b.stats.goals - a.stats.goals)[0];

    const topAssists = playerTeam.players
      .filter((p) => p.stats.assists > 0)
      .sort((a, b) => b.stats.assists - a.stats.assists)[0];

    // Count clean sheets
    const cleanSheets = teamMatches.filter((match) => {
      const isHome = match.homeTeam === playerTeam.name;
      const opponentScore = isHome ? match.awayScore : match.homeScore;
      return opponentScore === 0 && match.result === (isHome ? 'home' : 'away');
    }).length;

    return {
      season,
      finalPosition: finalTable.teamId === teamId ? 1 : finalTable.played > 0 ? this.getPositionFromTable(finalTable) : 20,
      points: finalTable.points,
      won: finalTable.won,
      drawn: finalTable.drawn,
      lost: finalTable.lost,
      goalsFor: finalTable.goalsFor,
      goalsAgainst: finalTable.goalsAgainst,
      goalDifference: finalTable.goalDifference,
      biggestWin,
      biggestLoss,
      longestWinStreak,
      longestUnbeatenStreak,
      topScorer: topScorer
        ? {
            playerId: topScorer.id,
            playerName: topScorer.name,
            goals: topScorer.stats.goals,
          }
        : undefined,
      topAssists: topAssists
        ? {
            playerId: topAssists.id,
            playerName: topAssists.name,
            assists: topAssists.stats.assists,
          }
        : undefined,
      cleanSheets,
    };
  }

  /**
   * Helper to get position from league table
   */
  private getPositionFromTable(_entry: LeagueTable): number {
    // This would need the full sorted table to determine position
    // For now, we'll assume it's calculated elsewhere
    return 1;
  }

  /**
   * Find biggest win and loss from match history
   */
  findBiggestResults(
    matches: MatchResult[],
    teamName: string
  ): {
    biggestWin?: SeasonRecords['biggestWin'];
    biggestLoss?: SeasonRecords['biggestLoss'];
  } {
    let biggestWin: SeasonRecords['biggestWin'];
    let biggestLoss: SeasonRecords['biggestLoss'];
    let maxWinMargin = 0;
    let maxLossMargin = 0;

    matches.forEach((match) => {
      const isHome = match.homeTeam === teamName;
      const teamScore = isHome ? match.homeScore : match.awayScore;
      const opponentScore = isHome ? match.awayScore : match.homeScore;
      const opponent = isHome ? match.awayTeam : match.homeTeam;
      const margin = teamScore - opponentScore;

      // Check for biggest win
      if (margin > maxWinMargin) {
        maxWinMargin = margin;
        biggestWin = {
          opponent,
          score: isHome ? `${match.homeScore}-${match.awayScore}` : `${match.awayScore}-${match.homeScore}`,
          homeOrAway: isHome ? 'home' : 'away',
          week: 1, // We don't have week info in MatchResult, would need to get from fixtures
        };
      }

      // Check for biggest loss
      if (margin < 0 && Math.abs(margin) > maxLossMargin) {
        maxLossMargin = Math.abs(margin);
        biggestLoss = {
          opponent,
          score: isHome ? `${match.homeScore}-${match.awayScore}` : `${match.awayScore}-${match.homeScore}`,
          homeOrAway: isHome ? 'home' : 'away',
          week: 1,
        };
      }
    });

    return { biggestWin, biggestLoss };
  }

  /**
   * Calculate win and unbeaten streaks
   */
  calculateStreaks(fixtures: Fixture[], teamId: string): {
    longestWinStreak: number;
    longestUnbeatenStreak: number;
  } {
    let longestWinStreak = 0;
    let longestUnbeatenStreak = 0;
    let currentWinStreak = 0;
    let currentUnbeatenStreak = 0;

    // Sort fixtures by week
    const sortedFixtures = [...fixtures]
      .filter((f) => f.played && (f.homeTeamId === teamId || f.awayTeamId === teamId))
      .sort((a, b) => a.week - b.week);

    sortedFixtures.forEach((fixture) => {
      const isHome = fixture.homeTeamId === teamId;
      const result = fixture.result?.result;

      if (result) {
        const won = (isHome && result === 'home') || (!isHome && result === 'away');
        const drew = result === 'draw';

        if (won) {
          currentWinStreak++;
          currentUnbeatenStreak++;
          longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
          longestUnbeatenStreak = Math.max(longestUnbeatenStreak, currentUnbeatenStreak);
        } else if (drew) {
          currentWinStreak = 0;
          currentUnbeatenStreak++;
          longestUnbeatenStreak = Math.max(longestUnbeatenStreak, currentUnbeatenStreak);
        } else {
          currentWinStreak = 0;
          currentUnbeatenStreak = 0;
        }
      }
    });

    return { longestWinStreak, longestUnbeatenStreak };
  }

  /**
   * Initialize empty club records
   */
  initializeClubRecords(season: number): ClubRecords {
    return {
      bestLeaguePosition: { position: 20, season },
      mostPoints: { points: 0, season },
      mostWins: { wins: 0, season },
      mostGoalsScored: { goals: 0, season },
      fewestGoalsConceded: { goals: 999, season },
      bestGoalDifference: { difference: -999, season },
      biggestWin: {
        opponent: '',
        score: '0-0',
        homeOrAway: 'home',
        week: 1,
        season,
      },
      longestWinStreak: { streak: 0, season },
      longestUnbeatenStreak: { streak: 0, season },
      mostGoalsSingleSeason: {
        playerId: '',
        playerName: '',
        goals: 0,
        season,
      },
      mostAssistsSingleSeason: {
        playerId: '',
        playerName: '',
        assists: 0,
        season,
      },
      mostCleanSheetsSeason: { cleanSheets: 0, season },
    };
  }

  /**
   * Update club records if season records broke any records
   */
  updateClubRecords(
    currentRecords: ClubRecords,
    seasonRecords: SeasonRecords
  ): { records: ClubRecords; brokenRecords: string[] } {
    const updated = { ...currentRecords };
    const brokenRecords: string[] = [];

    // Best league position (lower is better)
    if (seasonRecords.finalPosition < updated.bestLeaguePosition.position) {
      updated.bestLeaguePosition = {
        position: seasonRecords.finalPosition,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Best League Position: ${this.getOrdinal(seasonRecords.finalPosition)}`);
    }

    // Most points
    if (seasonRecords.points > updated.mostPoints.points) {
      updated.mostPoints = {
        points: seasonRecords.points,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Most Points: ${seasonRecords.points}`);
    }

    // Most wins
    if (seasonRecords.won > updated.mostWins.wins) {
      updated.mostWins = {
        wins: seasonRecords.won,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Most Wins: ${seasonRecords.won}`);
    }

    // Most goals scored
    if (seasonRecords.goalsFor > updated.mostGoalsScored.goals) {
      updated.mostGoalsScored = {
        goals: seasonRecords.goalsFor,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Most Goals Scored: ${seasonRecords.goalsFor}`);
    }

    // Fewest goals conceded
    if (seasonRecords.goalsAgainst < updated.fewestGoalsConceded.goals) {
      updated.fewestGoalsConceded = {
        goals: seasonRecords.goalsAgainst,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Fewest Goals Conceded: ${seasonRecords.goalsAgainst}`);
    }

    // Best goal difference
    if (seasonRecords.goalDifference > updated.bestGoalDifference.difference) {
      updated.bestGoalDifference = {
        difference: seasonRecords.goalDifference,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Best Goal Difference: ${seasonRecords.goalDifference > 0 ? '+' : ''}${seasonRecords.goalDifference}`);
    }

    // Biggest win (by margin)
    if (seasonRecords.biggestWin) {
      const currentMargin = this.getScoreMargin(updated.biggestWin.score);
      const newMargin = this.getScoreMargin(seasonRecords.biggestWin.score);
      if (newMargin > currentMargin) {
        updated.biggestWin = {
          ...seasonRecords.biggestWin,
          season: seasonRecords.season,
        };
        brokenRecords.push(`Biggest Win: ${seasonRecords.biggestWin.score}`);
      }
    }

    // Longest win streak
    if (seasonRecords.longestWinStreak > updated.longestWinStreak.streak) {
      updated.longestWinStreak = {
        streak: seasonRecords.longestWinStreak,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Longest Win Streak: ${seasonRecords.longestWinStreak} games`);
    }

    // Longest unbeaten streak
    if (seasonRecords.longestUnbeatenStreak > updated.longestUnbeatenStreak.streak) {
      updated.longestUnbeatenStreak = {
        streak: seasonRecords.longestUnbeatenStreak,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Longest Unbeaten Streak: ${seasonRecords.longestUnbeatenStreak} games`);
    }

    // Most goals single season (player)
    if (seasonRecords.topScorer && seasonRecords.topScorer.goals > updated.mostGoalsSingleSeason.goals) {
      updated.mostGoalsSingleSeason = {
        playerId: seasonRecords.topScorer.playerId,
        playerName: seasonRecords.topScorer.playerName,
        goals: seasonRecords.topScorer.goals,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Most Goals (Player): ${seasonRecords.topScorer.playerName} - ${seasonRecords.topScorer.goals}`);
    }

    // Most assists single season (player)
    if (seasonRecords.topAssists && seasonRecords.topAssists.assists > updated.mostAssistsSingleSeason.assists) {
      updated.mostAssistsSingleSeason = {
        playerId: seasonRecords.topAssists.playerId,
        playerName: seasonRecords.topAssists.playerName,
        assists: seasonRecords.topAssists.assists,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Most Assists (Player): ${seasonRecords.topAssists.playerName} - ${seasonRecords.topAssists.assists}`);
    }

    // Most clean sheets
    if (seasonRecords.cleanSheets > updated.mostCleanSheetsSeason.cleanSheets) {
      updated.mostCleanSheetsSeason = {
        cleanSheets: seasonRecords.cleanSheets,
        season: seasonRecords.season,
      };
      brokenRecords.push(`Most Clean Sheets: ${seasonRecords.cleanSheets}`);
    }

    return { records: updated, brokenRecords };
  }

  /**
   * Get score margin from score string (e.g., "5-0" returns 5)
   */
  private getScoreMargin(score: string): number {
    const [home, away] = score.split('-').map(Number);
    return Math.abs(home - away);
  }

  /**
   * Get ordinal string (1st, 2nd, 3rd, etc.)
   */
  private getOrdinal(num: number): string {
    if (num >= 11 && num <= 13) return `${num}th`;
    const lastDigit = num % 10;
    switch (lastDigit) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  }
}
