/**
 * Football Director Engine - Player Stats Tracker
 * Tracks individual player statistics and career history
 */

import {
  Player,
  PlayerStats,
  PlayerHistoryRecord,
  Team,
  MatchResult,
  MatchEvent,
  SeasonTopPerformers,
} from './types';

/**
 * Player Stats Tracker Interface
 *
 * Defines the contract for tracking player statistics.
 */
export interface IPlayerStatsTracker {
  initializePlayerStats(): PlayerStats;
  updateStatsFromMatch(player: Player, events: MatchEvent[], team: 'home' | 'away'): Player;
  processTeamMatchStats(team: Team, result: MatchResult, teamSide: 'home' | 'away'): Team;
  archiveSeasonStats(player: Player, season: number, teamName: string): Player;
  getTopPerformers(team: Team): SeasonTopPerformers;
  resetSeasonStats(player: Player): Player;
  archiveAndResetTeamStats(team: Team, season: number): Team;
}

/**
 * Player Stats Tracker Implementation
 */
export class PlayerStatsTracker implements IPlayerStatsTracker {
  /**
   * Initialize stats for a new player
   */
  initializePlayerStats(): PlayerStats {
    return {
      // Current season stats
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      // Career stats
      careerAppearances: 0,
      careerGoals: 0,
      careerAssists: 0,
      careerCleanSheets: 0,
    };
  }

  /**
   * Update player stats from match events
   */
  updateStatsFromMatch(
    player: Player,
    matchEvents: MatchEvent[],
    matchResult: MatchResult,
    teamName: string,
    wasHomeTeam: boolean
  ): Player {
    const updatedStats = { ...player.stats };

    // Count appearance
    updatedStats.appearances += 1;
    updatedStats.careerAppearances += 1;

    // Process match events for this player
    matchEvents.forEach((event) => {
      if (event.playerId === player.id) {
        switch (event.type) {
          case 'goal':
            updatedStats.goals += 1;
            updatedStats.careerGoals += 1;
            break;
          case 'yellow-card':
            updatedStats.yellowCards += 1;
            break;
          case 'red-card':
            updatedStats.redCards += 1;
            break;
        }
      }

      // Track assists
      if (event.type === 'goal' && event.assistPlayerId === player.id) {
        updatedStats.assists += 1;
        updatedStats.careerAssists += 1;
      }
    });

    // Track clean sheets for goalkeepers
    if (player.position === 'GK') {
      const opponentScore = wasHomeTeam
        ? matchResult.awayScore
        : matchResult.homeScore;

      if (opponentScore === 0) {
        updatedStats.cleanSheets += 1;
        updatedStats.careerCleanSheets += 1;
      }
    }

    return {
      ...player,
      stats: updatedStats,
    };
  }

  /**
   * Process season stats for entire team after match
   */
  processTeamMatchStats(
    team: Team,
    matchResult: MatchResult,
    matchEvents: MatchEvent[],
    wasHomeTeam: boolean
  ): Team {
    const updatedPlayers = team.players.map((player) =>
      this.updateStatsFromMatch(
        player,
        matchEvents,
        matchResult,
        team.name,
        wasHomeTeam
      )
    );

    return {
      ...team,
      players: updatedPlayers,
    };
  }

  /**
   * Archive current season stats to history
   */
  archiveSeasonStats(
    player: Player,
    season: number,
    teamName: string
  ): Player {
    const historyRecord: PlayerHistoryRecord = {
      season,
      teamName,
      appearances: player.stats.appearances,
      goals: player.stats.goals,
      assists: player.stats.assists,
      cleanSheets:
        player.position === 'GK' ? player.stats.cleanSheets : undefined,
    };

    return {
      ...player,
      history: [...player.history, historyRecord],
    };
  }

  /**
   * Get top performers from team
   */
  getTopPerformers(team: Team): SeasonTopPerformers {
    // Find top scorer
    const sortedByGoals = [...team.players].sort(
      (a, b) => b.stats.goals - a.stats.goals
    );
    const topScorer =
      sortedByGoals[0]?.stats.goals > 0
        ? { player: sortedByGoals[0], goals: sortedByGoals[0].stats.goals }
        : null;

    // Find top assists
    const sortedByAssists = [...team.players].sort(
      (a, b) => b.stats.assists - a.stats.assists
    );
    const topAssists =
      sortedByAssists[0]?.stats.assists > 0
        ? {
            player: sortedByAssists[0],
            assists: sortedByAssists[0].stats.assists,
          }
        : null;

    // Find most appearances
    const sortedByAppearances = [...team.players].sort(
      (a, b) => b.stats.appearances - a.stats.appearances
    );
    const mostAppearances =
      sortedByAppearances[0]?.stats.appearances > 0
        ? {
            player: sortedByAppearances[0],
            appearances: sortedByAppearances[0].stats.appearances,
          }
        : null;

    // Find clean sheet king (goalkeepers only)
    const goalkeepers = team.players.filter((p) => p.position === 'GK');
    const sortedByCleanSheets = goalkeepers.sort(
      (a, b) => b.stats.cleanSheets - a.stats.cleanSheets
    );
    const cleanSheetKing =
      sortedByCleanSheets[0]?.stats.cleanSheets > 0
        ? {
            player: sortedByCleanSheets[0],
            cleanSheets: sortedByCleanSheets[0].stats.cleanSheets,
          }
        : null;

    return {
      topScorer,
      topAssists,
      mostAppearances,
      cleanSheetKing,
    };
  }

  /**
   * Reset current season stats (called at season end)
   */
  resetSeasonStats(player: Player): Player {
    const resetStats: PlayerStats = {
      // Reset current season stats
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      // Keep career stats
      careerAppearances: player.stats.careerAppearances,
      careerGoals: player.stats.careerGoals,
      careerAssists: player.stats.careerAssists,
      careerCleanSheets: player.stats.careerCleanSheets,
    };

    return {
      ...player,
      stats: resetStats,
    };
  }

  /**
   * Archive stats and reset for entire team
   */
  archiveAndResetTeamStats(team: Team, season: number): Team {
    const updatedPlayers = team.players.map((player) => {
      // Archive current season stats
      const playerWithHistory = this.archiveSeasonStats(
        player,
        season,
        team.name
      );
      // Reset season stats
      return this.resetSeasonStats(playerWithHistory);
    });

    return {
      ...team,
      players: updatedPlayers,
    };
  }
}
