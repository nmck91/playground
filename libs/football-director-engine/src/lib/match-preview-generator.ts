/**
 * Football Director Engine - Match Preview Generator
 *
 * Generates pre-match preview content for upcoming fixtures
 */

import {
  Fixture,
  Team,
  MatchPreview,
  HeadToHead,
  TeamNews,
  LeagueTable,
} from './types';
import { WeatherGenerator } from './weather-generator';
import { MatchCommentary } from './match-commentary';

/**
 * Match Preview Generator Interface
 *
 * Defines the contract for generating pre-match preview content.
 */
export interface IMatchPreviewGenerator {
  /**
   * Generate a comprehensive preview for an upcoming match including team news,
   * head-to-head statistics, weather forecast, and manager quotes
   */
  generatePreview(
    fixture: Fixture,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    allFixtures: Fixture[],
    currentWeek: number,
    currentYear: number,
    seed?: number
  ): MatchPreview;
}

/**
 * Match Preview Generator Implementation
 */
export class MatchPreviewGenerator implements IMatchPreviewGenerator {
  private weatherGenerator = new WeatherGenerator();
  private commentaryGenerator = new MatchCommentary();

  /**
   * Generate a preview for an upcoming match
   */
  generatePreview(
    fixture: Fixture,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    allFixtures: Fixture[],
    currentWeek: number,
    currentYear: number,
    seed?: number
  ): MatchPreview {
    // Get team positions
    const homePosition = leagueTable.findIndex((t) => t.teamId === homeTeam.id) + 1;
    const awayPosition = leagueTable.findIndex((t) => t.teamId === awayTeam.id) + 1;

    // Generate head-to-head history
    const headToHead = this.generateHeadToHead(
      homeTeam.name,
      awayTeam.name,
      allFixtures,
      currentYear
    );

    // Generate team news
    const homeTeamNews = this.generateTeamNews(homeTeam, leagueTable, allFixtures, currentWeek);
    const awayTeamNews = this.generateTeamNews(awayTeam, leagueTable, allFixtures, currentWeek);

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

    // Generate manager quotes
    const managerQuotes = this.generateManagerQuotes(
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
    allFixtures: Fixture[],
    currentYear: number
  ): HeadToHead {
    // Find all played fixtures between these teams (last 2 seasons)
    const h2hFixtures = allFixtures.filter(
      (f) =>
        f.played &&
        f.result &&
        ((f.result.homeTeam === homeTeam && f.result.awayTeam === awayTeam) ||
          (f.result.homeTeam === awayTeam && f.result.awayTeam === homeTeam))
    );

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    h2hFixtures.forEach((f) => {
      if (f.result) {
        if (f.result.homeTeam === homeTeam) {
          if (f.result.result === 'home') homeWins++;
          else if (f.result.result === 'away') awayWins++;
          else draws++;
        } else {
          if (f.result.result === 'home') awayWins++;
          else if (f.result.result === 'away') homeWins++;
          else draws++;
        }
      }
    });

    // Get last 5 meetings
    const lastFiveMeetings = h2hFixtures
      .slice(-5)
      .reverse()
      .map((f) => ({
        homeTeam: f.result!.homeTeam,
        awayTeam: f.result!.awayTeam,
        homeScore: f.result!.homeScore,
        awayScore: f.result!.awayScore,
        week: f.week,
        season: currentYear, // Simplified - assume current season
      }));

    return {
      homeWins,
      awayWins,
      draws,
      lastFiveMeetings,
    };
  }

  /**
   * Generate team news (injuries, suspensions, form, key players)
   */
  private generateTeamNews(
    team: Team,
    leagueTable: LeagueTable[],
    allFixtures: Fixture[],
    currentWeek: number
  ): TeamNews {
    // Find injured players
    const injuries = team.players
      .filter((p) => p.injury && p.injury.weeksRemaining > 0)
      .map((p) => ({
        playerName: p.name,
        returnWeek: currentWeek + (p.injury?.weeksRemaining || 0),
      }));

    // Find suspended players
    const suspensions = team.players
      .filter((p) => p.suspendedUntil && p.suspendedUntil > currentWeek)
      .map((p) => ({
        playerName: p.name,
        returnWeek: p.suspendedUntil || currentWeek,
      }));

    // Find key players (top scorers/assisters)
    const keyPlayers = team.players
      .filter((p) => p.stats.goals > 0 || p.stats.assists > 0)
      .sort((a, b) => b.stats.goals + b.stats.assists - (a.stats.goals + a.stats.assists))
      .slice(0, 3)
      .map((p) => {
        let form = 'Good';
        if (p.stats.goals >= 10) form = 'Excellent';
        else if (p.stats.goals >= 5) form = 'Good';
        else form = 'Average';

        return {
          playerName: p.name,
          form,
          goals: p.stats.goals,
        };
      });

    // Calculate recent form (last 5 matches)
    const recentForm = this.calculateRecentForm(team.name, allFixtures, currentWeek);

    return {
      injuries,
      suspensions,
      keyPlayers,
      recentForm,
    };
  }

  /**
   * Calculate recent form from last 5 matches
   */
  private calculateRecentForm(
    teamName: string,
    allFixtures: Fixture[],
    currentWeek: number
  ): ('W' | 'D' | 'L')[] {
    const teamFixtures = allFixtures
      .filter(
        (f) =>
          f.played &&
          f.result &&
          f.week < currentWeek &&
          (f.result.homeTeam === teamName || f.result.awayTeam === teamName)
      )
      .sort((a, b) => b.week - a.week)
      .slice(0, 5);

    return teamFixtures.map((f) => {
      const result = f.result!;
      const isHome = result.homeTeam === teamName;

      if (result.result === 'draw') return 'D';
      if ((isHome && result.result === 'home') || (!isHome && result.result === 'away')) {
        return 'W';
      }
      return 'L';
    });
  }

  /**
   * Calculate match importance based on various factors
   */
  private calculateMatchImportance(
    homePosition: number,
    awayPosition: number,
    homeForm: ('W' | 'D' | 'L')[],
    awayForm: ('W' | 'D' | 'L')[],
    isDerby: boolean
  ): 'low' | 'medium' | 'high' {
    // Derby is always high importance
    if (isDerby) return 'high';

    // Top 6 clash
    if (homePosition <= 6 && awayPosition <= 6) return 'high';

    // Relegation battle (bottom 4)
    if (homePosition >= 17 && awayPosition >= 17) return 'high';

    // Title contender vs mid-table
    if (homePosition <= 3 || awayPosition <= 3) return 'medium';

    // Good form clash
    const homeWins = homeForm.filter((r) => r === 'W').length;
    const awayWins = awayForm.filter((r) => r === 'W').length;
    if (homeWins >= 3 && awayWins >= 3) return 'medium';

    return 'low';
  }

  /**
   * Generate manager quotes for preview
   */
  private generateManagerQuotes(
    homeTeam: string,
    awayTeam: string,
    homePosition: number,
    awayPosition: number,
    homeForm: ('W' | 'D' | 'L')[],
    awayForm: ('W' | 'D' | 'L')[],
    seed?: number
  ): { home: string; away: string } {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();
    const random2 = seed !== undefined ? this.seededRandom(seed + 1) : Math.random();

    // Home manager quotes
    const homeQuotes = [
      `We respect ${awayTeam} but we're confident in our ability at home.`,
      `Every match is vital at this stage of the season. We need the three points.`,
      `The fans will be behind us and we'll give it everything we've got.`,
      `We've prepared well this week and the team is ready for the challenge.`,
      `${awayTeam} are a good side, but we believe we can get the result we need.`,
    ];

    // Away manager quotes
    const awayQuotes = [
      `Playing at ${homeTeam} is never easy, but we go there to win.`,
      `We need to bounce back from recent results with a strong performance.`,
      `Our away form has been solid and we're looking to continue that.`,
      `The lads are focused and we know what we need to do to get a result.`,
      `It's a tough fixture but we're well prepared and ready for the battle.`,
    ];

    return {
      home: homeQuotes[Math.floor(random * homeQuotes.length)],
      away: awayQuotes[Math.floor(random2 * awayQuotes.length)],
    };
  }

  /**
   * Check if this is a derby match
   */
  private isDerby(homeTeam: string, awayTeam: string): boolean {
    const rivalries = [
      ['Manchester United', 'Manchester City'],
      ['Arsenal', 'Tottenham'],
      ['Liverpool', 'Everton'],
      ['Chelsea', 'Arsenal'],
      ['Celtic', 'Rangers'],
    ];

    return rivalries.some(
      ([team1, team2]) =>
        (homeTeam === team1 && awayTeam === team2) || (homeTeam === team2 && awayTeam === team1)
    );
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
