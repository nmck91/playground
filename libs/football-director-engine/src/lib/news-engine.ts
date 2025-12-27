/**
 * Football Director Engine - News Engine
 * Unified news article generation for all game events
 *
 * Consolidates news generation logic into a single, maintainable module.
 * Replaces the old news-generator.ts with enhanced functionality.
 */

import {
  NewsArticle,
  NewsArticleType,
  NewsImportance,
  MatchResult,
  LeagueTable,
  TransferListing,
  Player,
  BoardStatus,
  Team,
  Injury,
  PlayerContract,
  Achievement,
} from './types';
import { DevelopmentReport } from './player-development';

/**
 * News Engine Interface
 *
 * Defines the contract for news generation. Enables dependency injection
 * and easier testing through mocking.
 */
export interface INewsEngine {
  // Match-related news
  generateMatchNews(
    results: MatchResult[],
    playerTeamName: string,
    leagueTable: LeagueTable[],
    week: number,
    season: number
  ): NewsArticle[];

  // Transfer news
  generateTransferNews(
    listing: TransferListing,
    buyerTeamName: string,
    week: number,
    season: number,
    isSale?: boolean
  ): NewsArticle;

  // Player milestone news
  generateMilestoneNews(
    player: Player,
    teamName: string,
    week: number,
    season: number
  ): NewsArticle[];

  // Injury news (NEW)
  generateInjuryNews(
    player: Player,
    injury: Injury,
    teamName: string,
    week: number,
    season: number
  ): NewsArticle;

  // Contract news (NEW)
  generateContractNews(
    player: Player,
    contract: PlayerContract,
    teamName: string,
    week: number,
    season: number,
    newsType: 'signing' | 'renewal' | 'expiring'
  ): NewsArticle;

  // Achievement news (NEW)
  generateAchievementNews(
    achievement: Achievement,
    week: number,
    season: number
  ): NewsArticle;

  // Board status news
  generateBoardNews(
    boardStatus: BoardStatus,
    teamName: string,
    position: number,
    week: number,
    season: number
  ): NewsArticle | null;

  // League standings news
  generateStandingsNews(
    oldTable: LeagueTable[],
    newTable: LeagueTable[],
    week: number,
    season: number
  ): NewsArticle[];

  // Player development news
  generateDevelopmentNews(
    reports: DevelopmentReport[],
    teamName: string,
    week: number,
    season: number
  ): NewsArticle[];

  // Youth academy news
  generateYouthAcademyNews(
    newPlayers: Player[],
    teamName: string,
    week: number,
    season: number
  ): NewsArticle;

  // Season start/end news
  generateWelcomeNews(teamName: string, season: number): NewsArticle;
  generateSeasonEndNews(
    finalPosition: number,
    teamName: string,
    season: number,
    leagueTable: LeagueTable
  ): NewsArticle;

  // Background flavor news (NEW)
  generateRandomNews(week: number, season: number): NewsArticle | null;

  // Utility
  pruneOldNews(newsFeed: NewsArticle[], currentSeason: number): NewsArticle[];
}

/**
 * News Engine Implementation
 *
 * Generates news articles for all game events in a consistent format.
 * Uses template-based content generation for maintainability.
 */
export class NewsEngine implements INewsEngine {
  /**
   * Generate news for match results
   */
  generateMatchNews(
    results: MatchResult[],
    playerTeamName: string,
    leagueTable: LeagueTable[],
    week: number,
    season: number
  ): NewsArticle[] {
    const news: NewsArticle[] = [];
    const now = new Date();

    results.forEach((result) => {
      const isPlayerMatch = result.homeTeam === playerTeamName || result.awayTeam === playerTeamName;
      const isHighScoring = result.homeScore + result.awayScore >= 5;
      const isUpset = this.isUpset(result, leagueTable);
      const margin = Math.abs(result.homeScore - result.awayScore);
      const isBigWin = margin >= 4;

      // Generate news for significant matches
      if (isPlayerMatch || isHighScoring || isUpset || isBigWin) {
        const importance: NewsImportance = isPlayerMatch ? 'high' : isUpset ? 'medium' : 'low';

        let headline = '';
        let body = '';

        if (isPlayerMatch && result.result === 'home' && result.homeTeam === playerTeamName) {
          headline = `${result.homeTeam} Triumph ${result.homeScore}-${result.awayScore} Against ${result.awayTeam}`;
          body = this.generateMatchBody(result, true);
        } else if (isPlayerMatch && result.result === 'away' && result.awayTeam === playerTeamName) {
          headline = `${result.awayTeam} Secure ${result.awayScore}-${result.homeScore} Victory at ${result.homeTeam}`;
          body = this.generateMatchBody(result, false);
        } else if (isPlayerMatch && result.result === 'draw') {
          headline = `${result.homeTeam} and ${result.awayTeam} Share the Points in ${result.homeScore}-${result.awayScore} Draw`;
          body = this.generateMatchBody(result, result.homeTeam === playerTeamName);
        } else if (isBigWin) {
          headline = `${result.result === 'home' ? result.homeTeam : result.awayTeam} Demolish Opposition ${Math.max(result.homeScore, result.awayScore)}-${Math.min(result.homeScore, result.awayScore)}`;
          body = `A commanding performance saw ${result.result === 'home' ? result.homeTeam : result.awayTeam} cruise to a ${margin}-goal victory.`;
        } else if (isUpset) {
          const underdog = this.getPosition(result.result === 'home' ? result.homeTeam : result.awayTeam, leagueTable) >
            this.getPosition(result.result === 'home' ? result.awayTeam : result.homeTeam, leagueTable) ?
            (result.result === 'home' ? result.homeTeam : result.awayTeam) : null;
          if (underdog) {
            headline = `Shock Result: ${underdog} Stun ${result.result === 'home' ? result.awayTeam : result.homeTeam}`;
            body = `In a surprise result, ${underdog} secured an unexpected victory against higher-ranked opponents.`;
          }
        } else if (isHighScoring) {
          headline = `Goal Fest: ${result.homeTeam} ${result.homeScore}-${result.awayScore} ${result.awayTeam}`;
          body = `Fans were treated to an entertaining ${result.homeScore + result.awayScore}-goal thriller at ${result.homeTeam}'s ground.`;
        }

        if (headline) {
          news.push({
            id: `news-${Date.now()}-${Math.random()}`,
            date: now,
            week,
            season,
            type: 'result',
            headline,
            body,
            teams: [result.homeTeam, result.awayTeam],
            importance,
            read: false,
          });
        }
      }
    });

    return news;
  }

  /**
   * Generate news for transfers
   */
  generateTransferNews(
    listing: TransferListing,
    buyerTeamName: string,
    week: number,
    season: number,
    isSale = false
  ): NewsArticle {
    const now = new Date();
    const importance: NewsImportance = listing.askingPrice > 200000 ? 'high' : listing.askingPrice > 100000 ? 'medium' : 'low';

    let headline = '';
    let body = '';

    if (isSale) {
      headline = `${listing.sellingTeamName} Cash In on ${listing.player.name}`;
      body = `${listing.sellingTeamName} have sold ${listing.player.name} to ${buyerTeamName} for £${listing.askingPrice.toLocaleString()}. The ${listing.player.age}-year-old ${listing.player.position} had made ${listing.player.stats.appearances} appearances for the club.`;
    } else {
      headline = `${buyerTeamName} Sign ${listing.player.name} from ${listing.sellingTeamName}`;
      body = `${buyerTeamName} have completed the signing of ${listing.player.name} from ${listing.sellingTeamName} for a fee of £${listing.askingPrice.toLocaleString()}. The ${listing.player.age}-year-old ${listing.player.position} is expected to strengthen the squad.`;
    }

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week,
      season,
      type: 'transfer',
      headline,
      body,
      teams: [listing.sellingTeamName, buyerTeamName],
      players: [listing.player.name],
      importance,
      read: false,
    };
  }

  /**
   * Generate news for player milestones
   */
  generateMilestoneNews(
    player: Player,
    teamName: string,
    week: number,
    season: number
  ): NewsArticle[] {
    const news: NewsArticle[] = [];
    const now = new Date();

    // Career goals milestones
    if (player.stats.careerGoals === 100) {
      news.push({
        id: `news-${Date.now()}-${Math.random()}`,
        date: now,
        week,
        season,
        type: 'milestone',
        headline: `${player.name} Reaches Century of Goals`,
        body: `${teamName}'s ${player.name} has scored their 100th career goal. The ${player.age}-year-old striker continues to be a prolific scorer.`,
        teams: [teamName],
        players: [player.name],
        importance: 'high',
        read: false,
      });
    }

    // Career appearances milestones
    if (player.stats.careerAppearances === 200 || player.stats.careerAppearances === 300) {
      news.push({
        id: `news-${Date.now()}-${Math.random()}`,
        date: now,
        week,
        season,
        type: 'milestone',
        headline: `${player.name} Hits ${player.stats.careerAppearances} Appearances`,
        body: `Club stalwart ${player.name} has reached ${player.stats.careerAppearances} career appearances for ${teamName}. The ${player.position} has been a consistent performer for the club.`,
        teams: [teamName],
        players: [player.name],
        importance: 'medium',
        read: false,
      });
    }

    return news;
  }

  /**
   * Generate news for player injuries (NEW)
   */
  generateInjuryNews(
    player: Player,
    injury: Injury,
    teamName: string,
    week: number,
    season: number
  ): NewsArticle {
    const now = new Date();
    const severity = injury.type === 'serious' ? 'major' : injury.type === 'moderate' ? 'concerning' : 'minor';
    const importance: NewsImportance = injury.type === 'serious' ? 'high' : injury.type === 'moderate' ? 'medium' : 'low';

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week,
      season,
      type: 'general',
      headline: `${player.name} Suffers ${severity.charAt(0).toUpperCase() + severity.slice(1)} Injury`,
      body: `${teamName} have confirmed that ${player.name} has sustained ${injury.description}. The ${player.age}-year-old ${player.position} is expected to be sidelined for approximately ${injury.weeksRemaining} week${injury.weeksRemaining > 1 ? 's' : ''}.`,
      teams: [teamName],
      players: [player.name],
      importance,
      read: false,
    };
  }

  /**
   * Generate news for contract events (NEW)
   */
  generateContractNews(
    player: Player,
    contract: PlayerContract,
    teamName: string,
    week: number,
    season: number,
    newsType: 'signing' | 'renewal' | 'expiring'
  ): NewsArticle {
    const now = new Date();
    let headline = '';
    let body = '';
    let importance: NewsImportance = 'medium';

    switch (newsType) {
      case 'signing':
        headline = `${teamName} Secure ${player.name} on New Contract`;
        body = `${teamName} have tied down ${player.name} to a new deal worth £${contract.weeklyWage.toLocaleString()} per week. The ${player.age}-year-old ${player.position} has committed until the end of the ${contract.expiryYear} season.`;
        importance = contract.weeklyWage > 50000 ? 'high' : 'medium';
        break;

      case 'renewal':
        headline = `${player.name} Extends Stay at ${teamName}`;
        body = `${player.name} has signed a contract extension with ${teamName}. The ${player.position} will remain at the club until the end of the ${contract.expiryYear} season on wages of £${contract.weeklyWage.toLocaleString()} per week.`;
        importance = 'medium';
        break;

      case 'expiring':
        headline = `${player.name} Contract Situation Uncertain`;
        body = `${player.name}'s contract at ${teamName} is set to expire soon. With just ${contract.weeksRemaining} week${contract.weeksRemaining > 1 ? 's' : ''} remaining, the ${player.age}-year-old ${player.position} could leave on a free transfer unless a new deal is agreed.`;
        importance = 'high';
        break;
    }

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week,
      season,
      type: 'general',
      headline,
      body,
      teams: [teamName],
      players: [player.name],
      importance,
      read: false,
    };
  }

  /**
   * Generate news for unlocked achievements (NEW)
   */
  generateAchievementNews(
    achievement: Achievement,
    week: number,
    season: number
  ): NewsArticle {
    const now = new Date();

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week,
      season,
      type: 'milestone',
      headline: `Achievement Unlocked: ${achievement.name}`,
      body: `Congratulations! ${achievement.description} This milestone demonstrates the progress being made at the club.`,
      importance: 'medium',
      read: false,
    };
  }

  /**
   * Generate news for board status changes
   */
  generateBoardNews(
    boardStatus: BoardStatus,
    teamName: string,
    position: number,
    week: number,
    season: number
  ): NewsArticle | null {
    const now = new Date();

    if (boardStatus.jobSecurity === 'critical') {
      return {
        id: `news-${Date.now()}-${Math.random()}`,
        date: now,
        week,
        season,
        type: 'board',
        headline: `${teamName} Manager Under Severe Pressure`,
        body: `The ${teamName} manager's position is under threat after a difficult run of results. Currently ${position}th in the league, the board's patience is wearing thin.`,
        teams: [teamName],
        importance: 'high',
        read: false,
      };
    } else if (boardStatus.jobSecurity === 'under-pressure') {
      return {
        id: `news-${Date.now()}-${Math.random()}`,
        date: now,
        week,
        season,
        type: 'board',
        headline: `Questions Asked of ${teamName} Management`,
        body: `With ${teamName} sitting in ${position}th place, the board have expressed concerns about recent performances. The manager will need results to ease the pressure.`,
        teams: [teamName],
        importance: 'medium',
        read: false,
      };
    }

    return null;
  }

  /**
   * Generate news for league standings changes
   */
  generateStandingsNews(
    oldTable: LeagueTable[],
    newTable: LeagueTable[],
    week: number,
    season: number
  ): NewsArticle[] {
    const news: NewsArticle[] = [];
    const now = new Date();

    // Check for new league leader
    const oldLeader = oldTable[0]?.teamName;
    const newLeader = newTable[0]?.teamName;

    if (oldLeader !== newLeader && week > 1) {
      news.push({
        id: `news-${Date.now()}-${Math.random()}`,
        date: now,
        week,
        season,
        type: 'standings',
        headline: `${newLeader} Take Top Spot`,
        body: `${newLeader} have moved to the top of the league table, displacing ${oldLeader}. The title race continues to heat up as we approach the business end of the season.`,
        teams: [newLeader, oldLeader],
        importance: 'high',
        read: false,
      });
    }

    // Check for relegation zone changes (bottom 3)
    const oldBottom3 = oldTable.slice(-3).map(t => t.teamName);
    const newBottom3 = newTable.slice(-3).map(t => t.teamName);

    newBottom3.forEach(team => {
      if (!oldBottom3.includes(team) && week > 5) {
        news.push({
          id: `news-${Date.now()}-${Math.random()}`,
          date: now,
          week,
          season,
          type: 'standings',
          headline: `${team} Slip into Relegation Zone`,
          body: `${team} have dropped into the bottom three following this week's results. The club will be desperate to climb out of the danger zone in the coming weeks.`,
          teams: [team],
          importance: 'medium',
          read: false,
        });
      }
    });

    return news;
  }

  /**
   * Generate news for player development
   */
  generateDevelopmentNews(
    reports: DevelopmentReport[],
    teamName: string,
    week: number,
    season: number
  ): NewsArticle[] {
    const news: NewsArticle[] = [];
    const now = new Date();

    // Focus on significant improvements
    const significantImprovements = reports.filter(r => r.skillChange > 0 && r.skillChange >= 2);

    significantImprovements.slice(0, 2).forEach(report => {
      const message = report.skillChange > 0
        ? `The ${report.phase} player improved from skill ${report.oldSkill} to ${report.newSkill} over the summer.`
        : `Despite being in the ${report.phase} phase, the player maintained their skill level at ${report.newSkill}.`;

      news.push({
        id: `news-${Date.now()}-${Math.random()}`,
        date: now,
        week,
        season,
        type: 'development',
        headline: `${report.playerName} Shows Major Improvement`,
        body: `${teamName}'s ${report.playerName} has made significant strides in development. ${message}`,
        teams: [teamName],
        players: [report.playerName],
        importance: 'low',
        read: false,
      });
    });

    return news;
  }

  /**
   * Generate news for youth academy graduates
   */
  generateYouthAcademyNews(
    newPlayers: Player[],
    teamName: string,
    week: number,
    season: number
  ): NewsArticle {
    const now = new Date();
    const count = newPlayers.length;
    const names = newPlayers.map(p => p.name).slice(0, 2).join(' and ');
    const others = count > 2 ? ` and ${count - 2} other${count > 3 ? 's' : ''}` : '';

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week,
      season,
      type: 'general',
      headline: `${count} Youth Player${count > 1 ? 's' : ''} Graduate to First Team`,
      body: `${teamName}'s youth academy has produced another crop of promising talent. ${names}${others} ${count > 1 ? 'have' : 'has'} graduated to the first team squad and will be looking to make ${count > 1 ? 'their' : 'an'} impact in the coming season.`,
      teams: [teamName],
      players: newPlayers.map(p => p.name),
      importance: 'low',
      read: false,
    };
  }

  /**
   * Generate welcome news for new game
   */
  generateWelcomeNews(teamName: string, season: number): NewsArticle {
    const now = new Date();

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week: 1,
      season,
      type: 'general',
      headline: `New Manager Takes Charge at ${teamName}`,
      body: `A new era begins at ${teamName} as a fresh face takes the helm. The fans are eager to see what the future holds under new management. The season promises to be an exciting journey!`,
      teams: [teamName],
      importance: 'high',
      read: false,
    };
  }

  /**
   * Generate season end news
   */
  generateSeasonEndNews(
    finalPosition: number,
    teamName: string,
    season: number,
    leagueTable: LeagueTable
  ): NewsArticle {
    const now = new Date();

    let headline = '';
    let body = '';
    let importance: NewsImportance = 'high';

    if (finalPosition === 1) {
      headline = `${teamName} Crowned Champions!`;
      body = `${teamName} have won the league title with ${leagueTable.points} points! A remarkable season ends in glory with ${leagueTable.won} wins, ${leagueTable.drawn} draws, and just ${leagueTable.lost} defeats. Congratulations to the champions!`;
    } else if (finalPosition === 2) {
      headline = `${teamName} Finish as Runners-Up`;
      body = `Despite a strong campaign, ${teamName} had to settle for second place with ${leagueTable.points} points. The team can be proud of their efforts in what was a competitive season.`;
    } else if (finalPosition <= 4) {
      headline = `${teamName} Secure Top Four Finish`;
      body = `${teamName} finished the season in ${finalPosition}th place with ${leagueTable.points} points. A solid campaign that met expectations.`;
      importance = 'medium';
    } else if (finalPosition >= 18) {
      headline = `${teamName} Battle Relegation to Finish ${finalPosition}th`;
      body = `A difficult season for ${teamName} who finished in ${finalPosition}th place with ${leagueTable.points} points. The club will be looking to rebuild in the off-season.`;
      importance = 'high';
    } else {
      headline = `${teamName} Finish ${finalPosition}th After Mixed Season`;
      body = `${teamName} ended the campaign in ${finalPosition}th place with ${leagueTable.points} points. ${leagueTable.won} wins, ${leagueTable.drawn} draws, and ${leagueTable.lost} losses tell the story of a mid-table finish.`;
      importance = 'medium';
    }

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week: 38,
      season,
      type: 'general',
      headline,
      body,
      teams: [teamName],
      importance,
      read: false,
    };
  }

  /**
   * Generate random background news for flavor (NEW)
   * Returns null if no news generated this week
   */
  generateRandomNews(week: number, season: number): NewsArticle | null {
    const now = new Date();
    const random = Math.random();

    // Only generate random news 20% of the time
    if (random > 0.2) {
      return null;
    }

    const flavorNews = [
      {
        headline: 'Transfer Window Speculation Heating Up',
        body: 'Rumors are swirling around several high-profile players as clubs prepare their transfer strategies. Expect plenty of movement in the coming weeks.',
      },
      {
        headline: 'Weather Causes Fixture Concerns',
        body: 'Unseasonable weather conditions have raised questions about upcoming fixtures. Groundskeepers across the league are working hard to ensure pitches remain playable.',
      },
      {
        headline: 'Referees Under Spotlight',
        body: 'Recent controversial decisions have put match officials under increased scrutiny. The refereeing body has promised to review key incidents.',
      },
      {
        headline: 'Youth Development Focus Growing',
        body: 'Clubs are increasingly investing in their youth academies as the pathway to first-team football becomes more valued across the league.',
      },
      {
        headline: 'Fan Attendance Figures Encouraging',
        body: 'Average attendances remain strong across the league, with several clubs reporting sold-out matches. The passion for the game continues to thrive.',
      },
    ];

    const selectedNews = flavorNews[Math.floor(random * flavorNews.length)];

    return {
      id: `news-${Date.now()}-${Math.random()}`,
      date: now,
      week,
      season,
      type: 'general',
      headline: selectedNews.headline,
      body: selectedNews.body,
      importance: 'low',
      read: false,
    };
  }

  /**
   * Prune old news (keep last 3 seasons)
   */
  pruneOldNews(newsFeed: NewsArticle[], currentSeason: number): NewsArticle[] {
    const cutoffSeason = currentSeason - 3;
    return newsFeed.filter(article => article.season >= cutoffSeason);
  }

  // Helper methods

  private isUpset(result: MatchResult, leagueTable: LeagueTable[]): boolean {
    const homePos = this.getPosition(result.homeTeam, leagueTable);
    const awayPos = this.getPosition(result.awayTeam, leagueTable);

    // Upset if team ranked 5+ positions lower wins
    if (result.result === 'home' && homePos - awayPos >= 5) return true;
    if (result.result === 'away' && awayPos - homePos >= 5) return true;

    return false;
  }

  private getPosition(teamName: string, leagueTable: LeagueTable[]): number {
    const index = leagueTable.findIndex(t => t.teamName === teamName);
    return index + 1;
  }

  private generateMatchBody(result: MatchResult, isHome: boolean): string {
    const teamScore = isHome ? result.homeScore : result.awayScore;
    const opponentScore = isHome ? result.awayScore : result.homeScore;
    const opponent = isHome ? result.awayTeam : result.homeTeam;

    if (result.result === 'draw') {
      return `An entertaining match saw both teams share the spoils. The ${teamScore}-${opponentScore} draw means both sides take a point from this encounter.`;
    }

    const isWin = (isHome && result.result === 'home') || (!isHome && result.result === 'away');

    if (isWin) {
      if (result.homeGoalScorers && result.homeGoalScorers.length > 0) {
        const scorers = isHome ? result.homeGoalScorers : result.awayGoalScorers || [];
        const scorersList = scorers.slice(0, 2).join(', ');
        return `A dominant performance saw the team run out ${teamScore}-${opponentScore} winners against ${opponent}. ${scorersList} were among the scorers in this convincing victory.`;
      }
      return `A strong display earned all three points with a ${teamScore}-${opponentScore} victory over ${opponent}.`;
    } else {
      return `Despite their best efforts, the team fell to a ${opponentScore}-${teamScore} defeat against ${opponent}. Work to do to get back to winning ways.`;
    }
  }
}
