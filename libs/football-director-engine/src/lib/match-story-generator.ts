/**
 * Football Director Engine - Match Story Generator
 * Unified module for generating match-related storytelling content
 *
 * Responsibilities:
 * - Pre-match previews (team news, head-to-head, weather, manager quotes)
 * - Post-match analysis (manager quotes, player interviews, turning points)
 * - Match storytelling before and after the game
 *
 * Consolidates functionality from:
 * - match-preview-generator.ts (pre-match content)
 * - post-match-generator.ts (post-match content)
 */

import {
  Fixture,
  Team,
  MatchPreview,
  HeadToHead,
  TeamNews,
  LeagueTable,
  MatchResult,
  PostMatchAnalysis,
  ManagerQuote,
  PlayerInterview,
  ManOfMatch,
} from './types';
import { IWeatherGenerator } from './interfaces/weather-generator.interface';
import { IMatchCommentary } from './interfaces/match-commentary.interface';
import { WeatherGenerator } from './weather-generator';
import { MatchCommentary } from './match-commentary';
import { IMatchStoryGenerator } from './interfaces/match-story-generator.interface';

// Re-export interface for convenience
export { IMatchStoryGenerator };

/**
 * Match Story Generator Implementation
 *
 * Generates comprehensive storytelling content for matches,
 * both before (previews) and after (analysis).
 */
export class MatchStoryGenerator implements IMatchStoryGenerator {
  private weatherGenerator: IWeatherGenerator;
  private commentaryGenerator: IMatchCommentary;

  constructor(
    weatherGenerator?: IWeatherGenerator,
    commentaryGenerator?: IMatchCommentary
  ) {
    // Use provided dependencies or create defaults for backward compatibility
    this.weatherGenerator = weatherGenerator ?? new WeatherGenerator();
    this.commentaryGenerator = commentaryGenerator ?? new MatchCommentary();
  }

  // ============================================
  // PRE-MATCH PREVIEW GENERATION
  // ============================================

  /**
   * Generate a comprehensive preview for an upcoming match
   */
  generatePreview(
    fixture: Fixture,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    allFixtures: Fixture[],
    currentWeek: number,
    seed?: number
  ): MatchPreview {
    // Get team positions
    const homePosition = leagueTable.findIndex((t) => t.teamId === homeTeam.id) + 1;
    const awayPosition = leagueTable.findIndex((t) => t.teamId === awayTeam.id) + 1;

    // Generate head-to-head history
    const headToHead = this.generateHeadToHead(
      homeTeam.name,
      awayTeam.name,
      allFixtures
    );

    // Generate team news
    const homeTeamNews = this.generateTeamNews(homeTeam, allFixtures, currentWeek);
    const awayTeamNews = this.generateTeamNews(awayTeam, allFixtures, currentWeek);

    // Generate weather forecast
    const weather = this.weatherGenerator.generateWeather(fixture.week, seed);

    // Detect derby
    const isDerby = this.isDerby(homeTeam.name, awayTeam.name);

    // Determine match importance
    const matchImportance = this.calculateMatchImportance(
      homePosition,
      awayPosition,
      homeTeamNews.recentForm,
      awayTeamNews.recentForm,
      isDerby
    );

    // Calculate expected attendance
    const expectedAttendance = this.commentaryGenerator.generateAttendance(
      homeTeam,
      seed,
      {
        isDerby,
        homePosition,
        awayPosition,
        weatherCondition: weather.condition,
      }
    );

    // Generate pre-match manager quotes
    const managerQuotes = this.generatePreMatchManagerQuotes(
      homeTeam.name,
      awayTeam.name,
      homePosition,
      awayPosition,
      homeTeamNews.recentForm,
      awayTeamNews.recentForm,
      seed
    );

    return {
      fixtureId: fixture.id,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      week: fixture.week,
      homePosition,
      awayPosition,
      headToHead,
      homeTeamNews,
      awayTeamNews,
      expectedAttendance,
      weather,
      isDerby,
      matchImportance,
      managerQuotes,
    };
  }

  /**
   * Generate head-to-head record between two teams
   */
  private generateHeadToHead(
    homeTeam: string,
    awayTeam: string,
    allFixtures: Fixture[]
  ): HeadToHead {
    // Filter fixtures between these two teams (allFixtures already contains current season)
    const matches = allFixtures.filter(
      (f) =>
        f.result &&
        ((f.result.homeTeam === homeTeam && f.result.awayTeam === awayTeam) ||
          (f.result.homeTeam === awayTeam && f.result.awayTeam === homeTeam))
    );

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    matches.forEach((match) => {
      if (!match.result) return;

      if (match.result.homeTeam === homeTeam) {
        if (match.result.result === 'home') homeWins++;
        else if (match.result.result === 'away') awayWins++;
        else draws++;
      } else {
        if (match.result.result === 'home') awayWins++;
        else if (match.result.result === 'away') homeWins++;
        else draws++;
      }
    });

    // Get last 5 meetings
    const lastFiveMeetings = matches.slice(-5).map((match) => ({
      homeTeam: match.result!.homeTeam,
      awayTeam: match.result!.awayTeam,
      homeScore: match.result!.homeScore,
      awayScore: match.result!.awayScore,
      week: match.week,
      season: 2024 // Placeholder - season tracking to be enhanced
    }));

    return {
      homeWins,
      awayWins,
      draws,
      lastFiveMeetings,
    };
  }

  /**
   * Generate team news including form, injuries, and suspensions
   */
  private generateTeamNews(
    team: Team,
    allFixtures: Fixture[],
    currentWeek: number
  ): TeamNews {
    // Get recent form (last 5 matches)
    const recentMatches = allFixtures
      .filter(
        (f) =>
          f.week < currentWeek &&
          f.result &&
          (f.result.homeTeam === team.name || f.result.awayTeam === team.name)
      )
      .slice(-5);

    const recentForm = recentMatches.map((match) => {
      if (!match.result) return 'D';
      const isHome = match.result.homeTeam === team.name;
      if (match.result.result === 'draw') return 'D';
      if ((match.result.result === 'home' && isHome) || (match.result.result === 'away' && !isHome)) {
        return 'W';
      }
      return 'L';
    });

    // Count injuries and suspensions
    const injuries = team.players.filter((p) => p.injury && p.injury.weeksRemaining > 0);
    const suspensions = team.players.filter((p) => p.suspendedUntil && p.suspendedUntil > currentWeek);

    return {
      recentForm,
      injuries: injuries.map((p) => ({
        playerName: p.name,
        returnWeek: currentWeek + p.injury!.weeksRemaining,
      })),
      suspensions: suspensions.map((p) => ({
        playerName: p.name,
        returnWeek: p.suspendedUntil!,
      })),
      keyPlayers: [],
    };
  }

  /**
   * Detect if this is a derby match
   */
  private isDerby(homeTeam: string, awayTeam: string): boolean {
    // Simple derby detection based on team names
    const derbies = [
      ['Manchester United', 'Manchester City'],
      ['Arsenal', 'Tottenham'],
      ['Liverpool', 'Everton'],
      ['Rangers', 'Celtic'],
    ];

    return derbies.some(
      ([team1, team2]) =>
        (homeTeam.includes(team1) && awayTeam.includes(team2)) ||
        (homeTeam.includes(team2) && awayTeam.includes(team1))
    );
  }

  /**
   * Calculate match importance based on positions and form
   */
  private calculateMatchImportance(
    homePosition: number,
    awayPosition: number,
    _homeForm: string[],
    _awayForm: string[],
    isDerby: boolean
  ): 'low' | 'medium' | 'high' {
    if (isDerby) return 'high';

    // Top of table clash
    if (homePosition <= 4 && awayPosition <= 4) return 'high';

    // Relegation battle
    if (homePosition >= 18 && awayPosition >= 18) return 'high';

    // One team fighting for top/bottom
    if (homePosition <= 4 || awayPosition <= 4 || homePosition >= 18 || awayPosition >= 18) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Generate pre-match manager quotes
   */
  private generatePreMatchManagerQuotes(
    homeTeam: string,
    awayTeam: string,
    _homePosition: number,
    _awayPosition: number,
    _homeForm: string[],
    _awayForm: string[],
    seed?: number
  ): { home: string; away: string } {
    const random = seed !== undefined ? this.seededRandom(seed + 4000) : Math.random();

    // Home manager quotes
    const homeQuotes = [
      `We're ready for ${awayTeam}. Playing at home gives us an advantage and we aim to use it.`,
      `${awayTeam} are a tough opponent but we're confident in our preparation and our squad.`,
      `Home matches are crucial for us. We want to give our fans something to cheer about against ${awayTeam}.`,
      `We respect ${awayTeam} but we're focused on our own game. Three points is the target.`,
    ];

    // Away manager quotes
    const awayQuotes = [
      `Going to ${homeTeam} is never easy, but we've prepared well and believe we can get a result.`,
      `${homeTeam} will be tough at home, but we're going there to compete and hopefully come away with points.`,
      `Away games are a challenge but that's why we do this. We'll give it everything against ${homeTeam}.`,
      `We know ${homeTeam} will be fired up at home. We need to stay disciplined and take our chances.`,
    ];

    return {
      home: homeQuotes[Math.floor(random * homeQuotes.length)],
      away: awayQuotes[Math.floor(random * awayQuotes.length)],
    };
  }

  // ============================================
  // POST-MATCH ANALYSIS GENERATION
  // ============================================

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
    const homeManagerQuote = this.generatePostMatchManagerQuote(
      homeTeam,
      result.result,
      result.homeScore,
      result.awayScore,
      awayTeam.name,
      homePosition,
      seed
    );

    const awayManagerQuote = this.generatePostMatchManagerQuote(
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
        result.homeTeam,
        result.awayTeam,
        seed ? seed + 2 : undefined
      );
    }

    // Identify turning point
    const turningPoint = this.identifyTurningPoint(result, seed);

    // Compile key stats
    const keyStats = this.compileKeyStats(result).map(stat => `${stat.label}: ${stat.value}`);

    return {
      homeManagerQuote,
      awayManagerQuote,
      playerInterview,
      turningPoint,
      keyStats,
    };
  }

  /**
   * Generate post-match manager quote based on result
   */
  private generatePostMatchManagerQuote(
    team: Team,
    resultForTeam: 'home' | 'away' | 'draw',
    teamScore: number,
    opponentScore: number,
    opponentName: string,
    _position: number,
    seed?: number
  ): ManagerQuote {
    const random = seed !== undefined ? this.seededRandom(seed + 5000) : Math.random();
    let quote = '';
    let sentiment: 'happy' | 'neutral' | 'frustrated' = 'neutral';

    // Win
    if ((resultForTeam === 'home' && teamScore > opponentScore) || (resultForTeam === 'away' && teamScore > opponentScore)) {
      sentiment = 'happy';
      const winQuotes = [
        `I'm delighted with the performance today. The players executed the game plan perfectly.`,
        `Three points is what matters. The lads showed great character and quality out there.`,
        `We deserved that win. From start to finish, we were the better team.`,
        `Fantastic result for us. This is exactly what we needed and the players delivered.`,
      ];
      quote = winQuotes[Math.floor(random * winQuotes.length)];
    }
    // Loss
    else if ((resultForTeam === 'home' && teamScore < opponentScore) || (resultForTeam === 'away' && teamScore < opponentScore)) {
      sentiment = 'frustrated';
      const lossQuotes = [
        `Disappointing result. We didn't perform to our standards today.`,
        `We have to be honest, ${opponentName} were better than us today. We need to learn from this.`,
        `Not the result we wanted. We'll analyze what went wrong and come back stronger.`,
        `Credit to ${opponentName}, but we're frustrated we didn't give a better account of ourselves.`,
      ];
      quote = lossQuotes[Math.floor(random * lossQuotes.length)];
    }
    // Draw
    else {
      const drawQuotes = [
        `A point is a point. Not the result we hoped for but we'll take it and move on.`,
        `Mixed feelings about the draw. We had chances but so did they.`,
        `Fair result in the end. Both teams had their moments.`,
        `We're a bit disappointed not to win, but ${opponentName} are a good side.`,
      ];
      quote = drawQuotes[Math.floor(random * drawQuotes.length)];
    }

    // Get manager name from staff
    const manager = team.staff?.find(s => s.role === 'manager');
    const managerName = manager?.name || 'Manager';

    return {
      managerName,
      teamName: team.name,
      quote,
      sentiment,
    };
  }

  /**
   * Generate player interview for man of the match
   */
  private generatePlayerInterview(
    player: ManOfMatch,
    result: 'home' | 'away' | 'draw',
    homeScore: number,
    awayScore: number,
    homeTeam: string,
    awayTeam: string,
    seed?: number
  ): PlayerInterview {
    const random = seed !== undefined ? this.seededRandom(seed + 6000) : Math.random();

    const isWin = (result === 'home' && homeScore > awayScore) || (result === 'away' && awayScore > homeScore);
    const isDraw = homeScore === awayScore;

    let quote = '';

    if (isWin) {
      const winQuotes = [
        `I'm just happy to help the team get the three points. That's what matters most.`,
        `It was a great team performance today. I'm pleased with my contribution but it's about the result.`,
        `Brilliant win for us. The atmosphere was amazing and we fed off that energy.`,
        `Delighted to get the win. We worked hard for it and deserved the result.`,
      ];
      quote = winQuotes[Math.floor(random * winQuotes.length)];
    } else if (isDraw) {
      const drawQuotes = [
        `We're a bit disappointed not to win but we gave everything out there.`,
        `A point is okay but we felt we could have got all three. We'll take it and move on.`,
      ];
      quote = drawQuotes[Math.floor(random * drawQuotes.length)];
    } else {
      const lossQuotes = [
        `Not the result we wanted. We have to stick together and bounce back.`,
        `Tough day for us. We'll learn from this and come back stronger.`,
      ];
      quote = lossQuotes[Math.floor(random * lossQuotes.length)];
    }

    const teamName = player.team === 'home' ? homeTeam : awayTeam;

    return {
      playerId: player.playerId,
      playerName: player.playerName,
      teamName,
      rating: player.rating,
      quote,
    };
  }

  /**
   * Identify key turning point in the match
   */
  private identifyTurningPoint(result: MatchResult, seed?: number): string | undefined {
    if (!result.events || result.events.length === 0) return undefined;

    const random = seed !== undefined ? this.seededRandom(seed + 7000) : Math.random();

    // Look for significant events
    const redCards = result.events.filter((e) => e.type === 'red-card');
    const penalties = result.events.filter((e) => e.type === 'penalty');
    const goals = result.events.filter((e) => e.type === 'goal');

    // Red card is usually the turning point
    if (redCards.length > 0) {
      const redCard = redCards[0];
      return `The game changed when ${redCard.playerName} was sent off in the ${redCard.minute}th minute.`;
    }

    // Penalty goal
    if (penalties.length > 0 && random < 0.7) {
      const penalty = penalties[0];
      return `The penalty scored by ${penalty.playerName} in the ${penalty.minute}th minute proved crucial.`;
    }

    // First goal (if there were goals)
    if (goals.length > 0 && random < 0.5) {
      const firstGoal = goals[0];
      return `${firstGoal.playerName}'s opening goal in the ${firstGoal.minute}th minute set the tone for the match.`;
    }

    return undefined;
  }

  /**
   * Compile key statistics from the match
   */
  private compileKeyStats(result: MatchResult): { label: string; value: string }[] {
    const stats: { label: string; value: string }[] = [];

    // Final score
    stats.push({
      label: 'Final Score',
      value: `${result.homeScore}-${result.awayScore}`,
    });

    // Goal scorers
    if (result.homeGoalScorers && result.homeGoalScorers.length > 0) {
      stats.push({
        label: `${result.homeTeam} Scorers`,
        value: result.homeGoalScorers.join(', '),
      });
    }

    if (result.awayGoalScorers && result.awayGoalScorers.length > 0) {
      stats.push({
        label: `${result.awayTeam} Scorers`,
        value: result.awayGoalScorers.join(', '),
      });
    }

    // Man of the match
    if (result.manOfMatch) {
      stats.push({
        label: 'Man of the Match',
        value: `${result.manOfMatch.playerName} (${result.manOfMatch.rating.toFixed(1)})`,
      });
    }

    // Attendance
    if (result.attendance) {
      stats.push({
        label: 'Attendance',
        value: result.attendance.toLocaleString(),
      });
    }

    return stats;
  }

  /**
   * Seeded random number generator for deterministic results
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
