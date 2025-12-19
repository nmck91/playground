/**
 * Football Director Engine - News Generator
 * Generates news articles for various game events
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
} from './types';
import { DevelopmentReport } from './player-development';

export class NewsGenerator {
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
   * Generate welcome news
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
