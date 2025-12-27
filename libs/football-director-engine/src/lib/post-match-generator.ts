/**
 * Football Director Engine - Post-Match Generator
 *
 * Generates post-match content including manager quotes, player interviews, and analysis
 */

import {
  MatchResult,
  PostMatchAnalysis,
  ManagerQuote,
  PlayerInterview,
  Team,
  LeagueTable,
  ManOfMatch,
} from './types';

/**
 * Post-Match Generator Interface
 *
 * Defines the contract for generating post-match analysis content.
 */
export interface IPostMatchGenerator {
  /**
   * Generate complete post-match analysis including manager quotes, player interviews,
   * turning points, and key statistics
   */
  generatePostMatchAnalysis(
    result: MatchResult,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    seed?: number
  ): PostMatchAnalysis;
}

/**
 * Post-Match Generator Implementation
 */
export class PostMatchGenerator implements IPostMatchGenerator {
  /**
   * Generate complete post-match analysis
   */
  generatePostMatchAnalysis(
    result: MatchResult,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    seed?: number
  ): PostMatchAnalysis {
    const homePosition = leagueTable.findIndex((t) => t.teamId === homeTeam.id) + 1;
    const awayPosition = leagueTable.findIndex((t) => t.teamId === awayTeam.id) + 1;

    // Generate manager quotes
    const homeManagerQuote = this.generateManagerQuote(
      homeTeam,
      result.result,
      result.homeScore,
      result.awayScore,
      awayTeam.name,
      homePosition,
      seed
    );

    const awayManagerQuote = this.generateManagerQuote(
      awayTeam,
      result.result === 'home' ? 'away' : result.result === 'away' ? 'home' : 'draw',
      result.awayScore,
      result.homeScore,
      homeTeam.name,
      awayPosition,
      seed ? seed + 1 : undefined
    );

    // Generate player interview (man of match)
    let playerInterview: PlayerInterview | undefined;
    if (result.manOfMatch) {
      playerInterview = this.generatePlayerInterview(
        result.manOfMatch,
        result.result,
        result.homeScore,
        result.awayScore,
        seed ? seed + 2 : undefined
      );
    }

    // Identify turning point
    const turningPoint = this.identifyTurningPoint(result, seed);

    // Compile key stats
    const keyStats = this.compileKeyStats(result);

    return {
      homeManagerQuote,
      awayManagerQuote,
      playerInterview,
      turningPoint,
      keyStats,
    };
  }

  /**
   * Generate manager quote based on result
   */
  private generateManagerQuote(
    team: Team,
    result: 'home' | 'away' | 'draw',
    teamScore: number,
    opponentScore: number,
    opponentName: string,
    position: number,
    seed?: number
  ): ManagerQuote {
    const manager = team.staff.find((s) => s.role === 'manager');
    const managerName = manager?.name || 'Manager';

    let sentiment: 'happy' | 'neutral' | 'frustrated';
    let quote: string;
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Determine sentiment
    if (result === 'home') {
      sentiment = 'happy';
    } else if (result === 'away') {
      sentiment = 'frustrated';
    } else {
      sentiment = 'neutral';
    }

    // Generate quote based on sentiment and context
    if (sentiment === 'happy') {
      const happyQuotes = [
        `I'm delighted with the performance today. The lads executed the game plan perfectly.`,
        `Three points is what matters. The team showed great character and determination.`,
        `We controlled the game from start to finish. This is the standard we need to maintain.`,
        `Brilliant performance from the boys. They deserved every bit of that victory.`,
        `We're building momentum now. This win shows how far we've come as a team.`,
        `The players were magnificent today. I couldn't ask for more from them.`,
      ];
      quote = happyQuotes[Math.floor(random * happyQuotes.length)];
    } else if (sentiment === 'frustrated') {
      const frustratedQuotes = [
        `Very disappointing result. We didn't turn up today and that's not acceptable.`,
        `We made too many mistakes and ${opponentName} punished us. We need to be better.`,
        `I'm frustrated because I know we're capable of much more than that performance.`,
        `We let ourselves down today. The players know we need to improve quickly.`,
        `That's not the standard we expect. We need to look ourselves in the mirror.`,
        `Credit to ${opponentName}, but we made it too easy for them. We must do better.`,
      ];
      quote = frustratedQuotes[Math.floor(random * frustratedQuotes.length)];
    } else {
      // Neutral (draw)
      const neutralQuotes = [
        `A point is a point, but we feel we could have won it. Mixed feelings really.`,
        `We showed resilience to come back, but we should have taken all three points.`,
        `On another day we win that game. We created chances but couldn't convert them.`,
        `I'm pleased with parts of the performance, but frustrated we didn't get the win.`,
        `We battled hard for the point. Both teams had chances, fair result in the end.`,
        `There are positives to take, but we're disappointed not to win at home.`,
      ];
      quote = neutralQuotes[Math.floor(random * neutralQuotes.length)];
    }

    return {
      managerName,
      teamName: team.name,
      quote,
      sentiment,
    };
  }

  /**
   * Generate player interview for man of match
   */
  private generatePlayerInterview(
    manOfMatch: ManOfMatch,
    matchResult: 'home' | 'away' | 'draw',
    homeScore: number,
    awayScore: number,
    seed?: number
  ): PlayerInterview {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Determine if player's team won
    const wonMatch =
      (manOfMatch.team === 'home' && matchResult === 'home') ||
      (manOfMatch.team === 'away' && matchResult === 'away');
    const drew = matchResult === 'draw';

    let quotes: string[];

    if (wonMatch) {
      quotes = [
        `I'm buzzing with the win! The whole team played brilliantly today.`,
        `It's a great feeling to help the team get three points. We worked so hard for this.`,
        `The manager set us up perfectly. We knew what we had to do and we executed it.`,
        `Credit to the lads, everyone put in a shift. I'm just happy to contribute.`,
        `Winning is what matters most. Individual awards are nice, but it's all about the team.`,
        `We've been working on this in training all week. Great to see it pay off.`,
      ];
    } else if (drew) {
      quotes = [
        `We're disappointed not to win, but we showed good character to get a point.`,
        `It's frustrating because we had chances to win it. But we'll take the point.`,
        `We need to be more clinical in front of goal. That's something we'll work on.`,
        `Fair result probably. Both teams had chances. We move on to the next one.`,
        `We'll learn from this and come back stronger. There are positives to build on.`,
      ];
    } else {
      quotes = [
        `Gutted with the result. We let ourselves and the fans down today.`,
        `We didn't perform to our standards. We need to bounce back quickly.`,
        `Individual performances don't matter when you lose. It's about the team.`,
        `We'll stick together and work harder. That's all we can do now.`,
        `Disappointing day, but we have to focus on the next match and improving.`,
      ];
    }

    const quote = quotes[Math.floor(random * quotes.length)];

    return {
      playerId: manOfMatch.playerId,
      playerName: manOfMatch.playerName,
      teamName: manOfMatch.team === 'home' ? '' : '', // Will be filled by caller
      quote,
      rating: manOfMatch.rating,
    };
  }

  /**
   * Identify the turning point of the match
   */
  private identifyTurningPoint(result: MatchResult, seed?: number): string | undefined {
    const events = result.events || [];
    if (events.length === 0) return undefined;

    // Check for red cards (biggest turning point)
    const redCards = events.filter((e) => e.type === 'red-card');
    if (redCards.length > 0) {
      const redCard = redCards[0];
      return `${redCard.playerName}'s red card in the ${redCard.minute}' changed the entire complexion of the match`;
    }

    // Check for early goals (< 15 mins)
    const earlyGoals = events.filter((e) => (e.type === 'goal' || e.type === 'penalty') && e.minute < 15);
    if (earlyGoals.length > 0) {
      const earlyGoal = earlyGoals[0];
      return `${earlyGoal.playerName}'s early goal in the ${earlyGoal.minute}' set the tone for the match`;
    }

    // Check for late goals (> 75 mins) that changed the result
    const lateGoals = events.filter((e) => (e.type === 'goal' || e.type === 'penalty') && e.minute > 75);
    if (lateGoals.length > 0 && result.homeScore === result.awayScore) {
      const lateGoal = lateGoals[lateGoals.length - 1];
      return `${lateGoal.playerName}'s dramatic late equalizer in the ${lateGoal.minute}' rescued a point`;
    } else if (lateGoals.length > 0) {
      const lateGoal = lateGoals[lateGoals.length - 1];
      return `${lateGoal.playerName}'s late strike in the ${lateGoal.minute}' sealed the victory`;
    }

    // Check for first goal if close match
    if (Math.abs(result.homeScore - result.awayScore) <= 1 && events.length > 0) {
      const firstGoal = events.find((e) => e.type === 'goal' || e.type === 'penalty');
      if (firstGoal) {
        return `${firstGoal.playerName}'s opening goal proved decisive in a tight encounter`;
      }
    }

    return undefined;
  }

  /**
   * Compile key statistics into narrative points
   */
  private compileKeyStats(result: MatchResult): string[] {
    const keyStats: string[] = [];

    if (!result.stats) return keyStats;

    const stats = result.stats;

    // Possession dominance
    if (stats.possession.home >= 65) {
      keyStats.push(`${result.homeTeam} dominated possession with ${stats.possession.home}%`);
    } else if (stats.possession.away >= 65) {
      keyStats.push(`${result.awayTeam} dominated possession with ${stats.possession.away}%`);
    } else if (Math.abs(stats.possession.home - stats.possession.away) <= 5) {
      keyStats.push(`Evenly contested match with possession split ${stats.possession.home}%-${stats.possession.away}%`);
    }

    // Shots comparison
    const totalShots = stats.shots.home + stats.shots.away;
    if (stats.shots.home > stats.shots.away * 1.5) {
      keyStats.push(`${result.homeTeam} created significantly more chances (${stats.shots.home} shots to ${stats.shots.away})`);
    } else if (stats.shots.away > stats.shots.home * 1.5) {
      keyStats.push(`${result.awayTeam} created significantly more chances (${stats.shots.away} shots to ${stats.shots.home})`);
    }

    // Clinical finishing
    if (result.homeScore > 0 && stats.shotsOnTarget.home > 0) {
      const homeConversion = (result.homeScore / stats.shotsOnTarget.home) * 100;
      if (homeConversion >= 50) {
        keyStats.push(`${result.homeTeam} were clinical, converting ${homeConversion.toFixed(0)}% of shots on target`);
      }
    }
    if (result.awayScore > 0 && stats.shotsOnTarget.away > 0) {
      const awayConversion = (result.awayScore / stats.shotsOnTarget.away) * 100;
      if (awayConversion >= 50) {
        keyStats.push(`${result.awayTeam} were clinical, converting ${awayConversion.toFixed(0)}% of shots on target`);
      }
    }

    // Disciplinary
    const totalFouls = stats.fouls.home + stats.fouls.away;
    if (totalFouls >= 30) {
      keyStats.push(`Feisty encounter with ${totalFouls} fouls committed between both sides`);
    }

    // Man of match highlight
    if (result.manOfMatch && result.manOfMatch.rating >= 9.0) {
      keyStats.push(`${result.manOfMatch.playerName} put in a world-class performance (${result.manOfMatch.rating.toFixed(1)}/10)`);
    }

    return keyStats;
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
