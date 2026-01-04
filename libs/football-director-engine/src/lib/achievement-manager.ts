/**
 * Football Director Engine - Achievement Manager
 * Manages achievements, trophies, and season awards
 */

import {
  Achievement,
  SeasonAward,
  GameState,
  LeagueTable,
  Player,
  SeasonRecords,
} from './types';
import { IAchievementManager } from './interfaces/achievement-manager.interface';

// Re-export interface for convenience
export { IAchievementManager };

/**
 * Achievement Manager Implementation
 */
export class AchievementManager implements IAchievementManager {
  /**
   * Get all available achievements in the game
   */
  getAllAchievements(): Achievement[] {
    return [
      // LEAGUE ACHIEVEMENTS
      {
        id: 'league-champion',
        name: 'League Champion',
        description: 'Win the league title',
        category: 'league',
        icon: '🏆',
        unlocked: false,
      },
      {
        id: 'league-runner-up',
        name: 'So Close',
        description: 'Finish 2nd in the league',
        category: 'league',
        icon: '🥈',
        unlocked: false,
      },
      {
        id: 'top-four',
        name: 'Top Four Finish',
        description: 'Finish in the top 4 positions',
        category: 'league',
        icon: '⬆️',
        unlocked: false,
      },
      {
        id: 'great-escape',
        name: 'Great Escape',
        description: 'Avoid relegation from bottom 3',
        category: 'league',
        icon: '🎯',
        unlocked: false,
      },
      {
        id: 'dynasty',
        name: 'Dynasty',
        description: 'Win 3 consecutive league titles',
        category: 'league',
        icon: '👑',
        unlocked: false,
      },
      {
        id: 'consistency',
        name: 'Model of Consistency',
        description: 'Finish in top 6 for 5 consecutive seasons',
        category: 'league',
        icon: '📈',
        unlocked: false,
      },

      // GOALS ACHIEVEMENTS
      {
        id: 'century',
        name: 'Century',
        description: 'Score 100 goals in a single season',
        category: 'goals',
        icon: '💯',
        unlocked: false,
        progress: 0,
        target: 100,
      },
      {
        id: 'goal-machine',
        name: 'Goal Machine',
        description: 'Score in 10 consecutive matches',
        category: 'goals',
        icon: '⚽',
        unlocked: false,
      },
      {
        id: 'demolition',
        name: 'Demolition',
        description: 'Win a match by 6 or more goals',
        category: 'goals',
        icon: '💥',
        unlocked: false,
      },
      {
        id: 'clinical',
        name: 'Clinical Finishers',
        description: 'Have a player score 30+ goals in a season',
        category: 'goals',
        icon: '🎯',
        unlocked: false,
      },
      {
        id: 'team-effort',
        name: 'Team Effort',
        description: 'Have 5 different players score in one match',
        category: 'goals',
        icon: '🤝',
        unlocked: false,
      },

      // DEFENSE ACHIEVEMENTS
      {
        id: 'iron-curtain',
        name: 'Iron Curtain',
        description: 'Keep 20 clean sheets in a season',
        category: 'defense',
        icon: '🛡️',
        unlocked: false,
        progress: 0,
        target: 20,
      },
      {
        id: 'unbeaten',
        name: 'Unbeaten Run',
        description: 'Go 15 matches without losing',
        category: 'defense',
        icon: '🔒',
        unlocked: false,
      },
      {
        id: 'invincibles',
        name: 'Invincibles',
        description: 'Complete a season unbeaten',
        category: 'defense',
        icon: '⭐',
        unlocked: false,
      },
      {
        id: 'mean-defense',
        name: 'Mean Defense',
        description: 'Concede fewer than 25 goals in a season',
        category: 'defense',
        icon: '🚫',
        unlocked: false,
      },

      // FINANCE ACHIEVEMENTS
      {
        id: 'millionaire',
        name: 'Millionaire Club',
        description: 'Reach £1,000,000 in budget',
        category: 'finance',
        icon: '💰',
        unlocked: false,
        progress: 0,
        target: 1000000,
      },
      {
        id: 'bargain-hunter',
        name: 'Bargain Hunter',
        description: 'Sign a player for under £50k who becomes top scorer',
        category: 'finance',
        icon: '🏷️',
        unlocked: false,
      },
      {
        id: 'profit-maker',
        name: 'Profit Maker',
        description: 'Sell a player for 3x their purchase price',
        category: 'finance',
        icon: '📊',
        unlocked: false,
      },
      {
        id: 'financial-stability',
        name: 'Financial Stability',
        description: 'Complete a season with positive net spend',
        category: 'finance',
        icon: '💵',
        unlocked: false,
      },

      // PLAYERS ACHIEVEMENTS
      {
        id: 'youth-academy',
        name: 'Youth Development',
        description: 'Develop a player from skill 10 to skill 18+',
        category: 'players',
        icon: '🎓',
        unlocked: false,
      },
      {
        id: 'legend',
        name: 'Club Legend',
        description: 'Have a player reach 200 appearances',
        category: 'players',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        target: 200,
      },
      {
        id: 'veteran-squad',
        name: 'Experience Wins',
        description: 'Win the league with average squad age of 30+',
        category: 'players',
        icon: '👴',
        unlocked: false,
      },
      {
        id: 'young-guns',
        name: 'Young Guns',
        description: 'Win the league with average squad age under 25',
        category: 'players',
        icon: '👶',
        unlocked: false,
      },

      // SPECIAL ACHIEVEMENTS
      {
        id: 'perfect-season',
        name: 'Perfect Season',
        description: 'Win all 38 matches in a season',
        category: 'special',
        icon: '🏅',
        unlocked: false,
      },
      {
        id: 'giant-killer',
        name: 'Giant Killer',
        description: 'Beat the league leader by 3+ goals',
        category: 'special',
        icon: '⚔️',
        unlocked: false,
      },
      {
        id: 'comeback-king',
        name: 'Comeback King',
        description: 'Win a match after being 3-0 down',
        category: 'special',
        icon: '🔄',
        unlocked: false,
      },
      {
        id: 'first-season',
        name: 'First Season Hero',
        description: 'Win the league in your first season',
        category: 'special',
        icon: '🚀',
        unlocked: false,
      },
      {
        id: 'long-service',
        name: 'Long Service',
        description: 'Manage the club for 10 seasons',
        category: 'special',
        icon: '⏰',
        unlocked: false,
        progress: 0,
        target: 10,
      },
      {
        id: 'objective-master',
        name: 'Objective Master',
        description: 'Achieve board objectives 5 seasons in a row',
        category: 'special',
        icon: '🎯',
        unlocked: false,
      },
    ];
  }

  /**
   * Check achievements and return newly unlocked ones
   */
  checkAchievements(
    gameState: GameState,
    achievements: Achievement[]
  ): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const now = new Date();

    achievements.forEach((achievement) => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;
      let progress = 0;

      switch (achievement.id) {
        // LEAGUE ACHIEVEMENTS
        case 'league-champion': {
          const position = this.getCurrentPosition(gameState);
          shouldUnlock = position === 1 && gameState.season.status === 'completed';
          break;
        }

        case 'league-runner-up': {
          const position = this.getCurrentPosition(gameState);
          shouldUnlock = position === 2 && gameState.season.status === 'completed';
          break;
        }

        case 'top-four': {
          const position = this.getCurrentPosition(gameState);
          shouldUnlock = position <= 4 && gameState.season.status === 'completed';
          break;
        }

        case 'great-escape': {
          const position = this.getCurrentPosition(gameState);
          const wasInBottom3 = this.wasEverInBottom3(gameState);
          shouldUnlock = position > 17 && wasInBottom3 && gameState.season.status === 'completed';
          break;
        }

        case 'dynasty':
          shouldUnlock = this.hasConsecutiveWins(gameState.seasonRecords, 3);
          break;

        case 'consistency':
          shouldUnlock = this.hasConsecutiveTopNFinishes(gameState.seasonRecords, 6, 5);
          break;

        // GOALS ACHIEVEMENTS
        case 'century': {
          const tableEntry = this.getPlayerTableEntry(gameState);
          progress = tableEntry?.goalsFor || 0;
          shouldUnlock = progress >= 100 && gameState.season.status === 'completed';
          break;
        }

        case 'goal-machine':
          shouldUnlock = this.hasGoalScoringStreak(gameState, 10);
          break;

        case 'demolition':
          shouldUnlock = this.hasBigWin(gameState, 6);
          break;

        case 'clinical': {
          const topScorer = this.getTopScorer(gameState.playerTeam.players);
          shouldUnlock = !!(topScorer && topScorer.stats.goals >= 30);
          break;
        }

        case 'team-effort':
          shouldUnlock = this.hasFiveScorersInMatch(gameState);
          break;

        // DEFENSE ACHIEVEMENTS
        case 'iron-curtain': {
          const cleanSheets = this.countCleanSheets(gameState);
          progress = cleanSheets;
          shouldUnlock = cleanSheets >= 20 && gameState.season.status === 'completed';
          break;
        }

        case 'unbeaten':
          shouldUnlock = this.hasUnbeatenStreak(gameState, 15);
          break;

        case 'invincibles': {
          const tableEntry = this.getPlayerTableEntry(gameState);
          shouldUnlock = !!(tableEntry && tableEntry.lost === 0 && gameState.season.status === 'completed');
          break;
        }

        case 'mean-defense': {
          const tableEntry = this.getPlayerTableEntry(gameState);
          shouldUnlock = !!(tableEntry && tableEntry.goalsAgainst < 25 && gameState.season.status === 'completed');
          break;
        }

        // FINANCE ACHIEVEMENTS
        case 'millionaire':
          progress = gameState.finances.budget;
          shouldUnlock = gameState.finances.budget >= 1000000;
          break;

        case 'bargain-hunter':
          shouldUnlock = this.hasBargainTopScorer(gameState);
          break;

        case 'profit-maker':
          shouldUnlock = this.hasProfitableTransfer(gameState);
          break;

        case 'financial-stability':
          shouldUnlock = this.hasPositiveNetSpend(gameState) && gameState.season.status === 'completed';
          break;

        // PLAYERS ACHIEVEMENTS
        case 'youth-academy':
          shouldUnlock = this.hasDevelopedYouth(gameState);
          break;

        case 'legend': {
          const mostAppearances = this.getMostAppearances(gameState.playerTeam.players);
          progress = mostAppearances?.stats.careerAppearances || 0;
          shouldUnlock = progress >= 200;
          break;
        }

        case 'veteran-squad': {
          const avgAge = this.getAverageSquadAge(gameState.playerTeam.players);
          const position = this.getCurrentPosition(gameState);
          shouldUnlock = avgAge >= 30 && position === 1 && gameState.season.status === 'completed';
          break;
        }

        case 'young-guns': {
          const avgAge = this.getAverageSquadAge(gameState.playerTeam.players);
          const position = this.getCurrentPosition(gameState);
          shouldUnlock = avgAge < 25 && position === 1 && gameState.season.status === 'completed';
          break;
        }

        // SPECIAL ACHIEVEMENTS
        case 'perfect-season': {
          const tableEntry = this.getPlayerTableEntry(gameState);
          shouldUnlock = !!(tableEntry && tableEntry.won === 38 && gameState.season.status === 'completed');
          break;
        }

        case 'giant-killer':
          shouldUnlock = this.hasBeatLeader(gameState, 3);
          break;

        case 'comeback-king':
          shouldUnlock = this.hasComeback(gameState);
          break;

        case 'first-season':
          shouldUnlock = this.getCurrentPosition(gameState) === 1 && gameState.season.year === 2024 && gameState.season.status === 'completed';
          break;

        case 'long-service':
          progress = gameState.season.year - 2024 + (gameState.season.status === 'completed' ? 1 : 0);
          shouldUnlock = progress >= 10;
          break;

        case 'objective-master':
          shouldUnlock = this.hasConsecutiveObjectivesAchieved(gameState, 5);
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = now;
        newlyUnlocked.push(achievement);
      } else if (achievement.target) {
        achievement.progress = Math.min(progress, achievement.target);
      }
    });

    return newlyUnlocked;
  }

  /**
   * Award season prizes (Player of Year, Golden Boot, etc.)
   */
  awardSeasonPrizes(gameState: GameState): SeasonAward {
    const players = gameState.playerTeam.players;

    // Find top scorer
    const topScorer = this.getTopScorer(players);
    const goldenBoot = topScorer && topScorer.stats.goals > 0
      ? {
          playerId: topScorer.id,
          playerName: topScorer.name,
          goals: topScorer.stats.goals,
        }
      : undefined;

    // Find top goalkeeper (most clean sheets)
    const topKeeper = this.getTopKeeper(players);
    const goldenGlove = topKeeper && topKeeper.stats.cleanSheets > 0
      ? {
          playerId: topKeeper.id,
          playerName: topKeeper.name,
          cleanSheets: topKeeper.stats.cleanSheets,
        }
      : undefined;

    // Find young player of the year (best performer under 23)
    const youngPlayer = this.getBestYoungPlayer(players);
    const youngPlayerOfYear = youngPlayer
      ? {
          playerId: youngPlayer.id,
          playerName: youngPlayer.name,
          age: youngPlayer.age,
          reason: this.getYoungPlayerReason(youngPlayer),
        }
      : undefined;

    // Find player of the year (overall best performer)
    const playerOfYearCandidate = this.getPlayerOfYear(players);
    const playerOfYear = playerOfYearCandidate
      ? {
          playerId: playerOfYearCandidate.id,
          playerName: playerOfYearCandidate.name,
          reason: this.getPlayerOfYearReason(playerOfYearCandidate),
        }
      : undefined;

    return {
      season: gameState.season.year,
      awards: {
        goldenBoot,
        goldenGlove,
        youngPlayerOfYear,
        playerOfYear,
      },
    };
  }

  // Helper methods

  private getCurrentPosition(gameState: GameState): number {
    const sortedTable = [...gameState.leagueTable].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    return sortedTable.findIndex(entry => entry.teamId === gameState.playerTeam.id) + 1;
  }

  private getPlayerTableEntry(gameState: GameState): LeagueTable | undefined {
    return gameState.leagueTable.find(entry => entry.teamId === gameState.playerTeam.id);
  }

  private wasEverInBottom3(gameState: GameState): boolean {
    // This would need historical position tracking, for now assume true if currently close
    const position = this.getCurrentPosition(gameState);
    return position >= 15;
  }

  private hasConsecutiveWins(seasonRecords: SeasonRecords[], count: number): boolean {
    if (seasonRecords.length < count) return false;
    const recentSeasons = seasonRecords.slice(-count);
    return recentSeasons.every(season => season.finalPosition === 1);
  }

  private hasConsecutiveTopNFinishes(seasonRecords: SeasonRecords[], topN: number, count: number): boolean {
    if (seasonRecords.length < count) return false;
    const recentSeasons = seasonRecords.slice(-count);
    return recentSeasons.every(season => season.finalPosition <= topN);
  }

  private hasGoalScoringStreak(gameState: GameState, streakLength: number): boolean {
    const playerMatches = gameState.matchHistory
      .filter(match => match.homeTeam === gameState.playerTeam.name || match.awayTeam === gameState.playerTeam.name)
      .slice(-streakLength);

    if (playerMatches.length < streakLength) return false;

    return playerMatches.every(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      return isHome ? match.homeScore > 0 : match.awayScore > 0;
    });
  }

  private hasBigWin(gameState: GameState, goalMargin: number): boolean {
    return gameState.matchHistory.some(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      const isAway = match.awayTeam === gameState.playerTeam.name;

      if (isHome) return match.homeScore - match.awayScore >= goalMargin;
      if (isAway) return match.awayScore - match.homeScore >= goalMargin;
      return false;
    });
  }

  private getTopScorer(players: Player[]): Player | null {
    if (players.length === 0) return null;
    return players.reduce((top, player) =>
      player.stats.goals > top.stats.goals ? player : top
    );
  }

  private hasFiveScorersInMatch(gameState: GameState): boolean {
    // Check if any match had 5+ different scorers
    // This would need detailed event tracking, simplified check
    return gameState.matchHistory.some(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      const scorers = isHome ? match.homeGoalScorers : match.awayGoalScorers;
      if (!scorers) return false;
      const uniqueScorers = new Set(scorers);
      return uniqueScorers.size >= 5;
    });
  }

  private countCleanSheets(gameState: GameState): number {
    return gameState.matchHistory.filter(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      const isAway = match.awayTeam === gameState.playerTeam.name;

      if (isHome) return match.awayScore === 0;
      if (isAway) return match.homeScore === 0;
      return false;
    }).length;
  }

  private hasUnbeatenStreak(gameState: GameState, streakLength: number): boolean {
    const playerMatches = gameState.matchHistory
      .filter(match => match.homeTeam === gameState.playerTeam.name || match.awayTeam === gameState.playerTeam.name)
      .slice(-streakLength);

    if (playerMatches.length < streakLength) return false;

    return playerMatches.every(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      if (isHome) return match.result !== 'away';
      return match.result !== 'home';
    });
  }

  private hasBargainTopScorer(gameState: GameState): boolean {
    // Simplified: Check if any player with low wages is top scorer
    const topScorer = this.getTopScorer(gameState.playerTeam.players);
    return topScorer ? topScorer.wages < 50000 : false;
  }

  private hasProfitableTransfer(gameState: GameState): boolean {
    // Simplified: Check transaction history for profitable sales
    const transfers = gameState.finances.transactions.filter(t => t.category === 'transfers');
    // Would need to track purchase prices properly
    return transfers.some(t => t.type === 'income' && t.amount > 150000);
  }

  private hasPositiveNetSpend(gameState: GameState): boolean {
    const seasonTransfers = gameState.finances.transactions.filter(
      t => t.category === 'transfers' && t.weekNumber <= gameState.season.currentWeek
    );

    const income = seasonTransfers
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = seasonTransfers
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return income >= expenses;
  }

  private hasDevelopedYouth(gameState: GameState): boolean {
    return gameState.playerTeam.players.some(player => {
      // Check history for development from low skill to high skill
      if (player.history.length === 0) return false;
      // const _firstSeason = player.history[0]; // Reserved for future development tracking
      // Simplified: assume skill growth based on current skill
      return player.skill >= 18 && player.age < 25;
    });
  }

  private getMostAppearances(players: Player[]): Player | null {
    if (players.length === 0) return null;
    return players.reduce((most, player) =>
      player.stats.careerAppearances > most.stats.careerAppearances ? player : most
    );
  }

  private getAverageSquadAge(players: Player[]): number {
    if (players.length === 0) return 0;
    const totalAge = players.reduce((sum, player) => sum + player.age, 0);
    return totalAge / players.length;
  }

  private hasBeatLeader(gameState: GameState, goalMargin: number): boolean {
    // Find matches where player beat the league leader
    return gameState.matchHistory.some(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      const isAway = match.awayTeam === gameState.playerTeam.name;

      // Simplified: check for big wins (can't determine if opponent was leader at the time)
      if (isHome && match.homeScore - match.awayScore >= goalMargin) return true;
      if (isAway && match.awayScore - match.homeScore >= goalMargin) return true;
      return false;
    });
  }

  private hasComeback(gameState: GameState): boolean {
    // This would need event tracking to determine if team was 3-0 down
    // Simplified: check for high-scoring comeback wins
    return gameState.matchHistory.some(match => {
      const isHome = match.homeTeam === gameState.playerTeam.name;
      const isAway = match.awayTeam === gameState.playerTeam.name;

      if (isHome && match.result === 'home' && match.homeScore >= 4 && match.awayScore >= 3) return true;
      if (isAway && match.result === 'away' && match.awayScore >= 4 && match.homeScore >= 3) return true;
      return false;
    });
  }

  private hasConsecutiveObjectivesAchieved(gameState: GameState, count: number): boolean {
    const recentObjectives = gameState.boardStatus.objectiveHistory.slice(-count);
    if (recentObjectives.length < count) return false;
    return recentObjectives.every(obj => obj.status === 'achieved');
  }

  private getTopKeeper(players: Player[]): Player | null {
    const keepers = players.filter(p => p.position === 'GK');
    if (keepers.length === 0) return null;
    return keepers.reduce((top, keeper) =>
      keeper.stats.cleanSheets > top.stats.cleanSheets ? keeper : top
    );
  }

  private getBestYoungPlayer(players: Player[]): Player | null {
    const youngPlayers = players.filter(p => p.age < 23 && p.stats.appearances >= 10);
    if (youngPlayers.length === 0) return null;

    // Score based on goals, assists, and appearances
    return youngPlayers.reduce((best, player) => {
      const score = player.stats.goals * 2 + player.stats.assists + player.stats.appearances * 0.5;
      const bestScore = best.stats.goals * 2 + best.stats.assists + best.stats.appearances * 0.5;
      return score > bestScore ? player : best;
    });
  }

  private getPlayerOfYear(players: Player[]): Player | null {
    if (players.length === 0) return null;

    // Score based on position and contributions
    return players.reduce((best, player) => {
      const score = this.calculatePlayerScore(player);
      const bestScore = this.calculatePlayerScore(best);
      return score > bestScore ? player : best;
    });
  }

  private calculatePlayerScore(player: Player): number {
    if (player.stats.appearances < 15) return 0;

    const goalsScore = player.stats.goals * 3;
    const assistsScore = player.stats.assists * 2;
    const appearancesScore = player.stats.appearances * 0.5;
    const cleanSheetsScore = player.stats.cleanSheets * 2;

    return goalsScore + assistsScore + appearancesScore + cleanSheetsScore;
  }

  private getYoungPlayerReason(player: Player): string {
    if (player.stats.goals > player.stats.assists) {
      return `Scored ${player.stats.goals} goals in breakthrough season`;
    } else if (player.stats.assists > 0) {
      return `${player.stats.assists} assists and ${player.stats.goals} goals`;
    } else if (player.position === 'GK') {
      return `${player.stats.cleanSheets} clean sheets as young goalkeeper`;
    } else {
      return `${player.stats.appearances} appearances in impressive debut season`;
    }
  }

  private getPlayerOfYearReason(player: Player): string {
    if (player.position === 'GK') {
      return `Outstanding ${player.stats.cleanSheets} clean sheets`;
    } else if (player.stats.goals >= 20) {
      return `Prolific ${player.stats.goals} goals in all competitions`;
    } else if (player.stats.assists >= 15) {
      return `Creative force with ${player.stats.assists} assists`;
    } else if (player.stats.goals + player.stats.assists >= 20) {
      return `${player.stats.goals} goals and ${player.stats.assists} assists`;
    } else {
      return `Consistent performer with ${player.stats.appearances} appearances`;
    }
  }
}
