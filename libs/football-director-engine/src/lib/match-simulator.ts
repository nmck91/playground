/**
 * Football Director Engine - Match Simulator
 *
 * Simulates football matches based on team strength
 */

import { Team, Match, MatchResult, MatchStats, PlayerRating, ManOfMatch, Player, CupResult, MatchType } from './types';
import { ITacticsManager } from './interfaces/tactics-manager.interface';
import { IInjuryManager } from './interfaces/injury-manager.interface';
import { IMoraleManager } from './interfaces/morale-manager.interface';
import { IStaffManager } from './interfaces/staff-manager.interface';
import { IWeatherGenerator } from './interfaces/weather-generator.interface';
import { IMatchCommentary } from './interfaces/match-commentary.interface';
import { TacticsManager } from './tactics-manager';
import { InjuryManager } from './injury-manager';
import { MoraleManager } from './morale-manager';
import { StaffManager } from './staff-manager';
import { WeatherGenerator } from './weather-generator';
import { MatchCommentary } from './match-commentary';
import { getDefaultPostMatchAnalysis, getDefaultMatchWeather, getDefaultMatchStats } from './migration';
import { IMatchSimulator } from './interfaces/match-simulator.interface';

// Re-export interface for convenience
export type { IMatchSimulator };

/**
 * Match Simulator Implementation
 */
export class MatchSimulator implements IMatchSimulator {
  private tacticsManager: ITacticsManager;
  private injuryManager: IInjuryManager;
  private moraleManager: IMoraleManager;
  private staffManager: IStaffManager;
  private weatherGenerator: IWeatherGenerator;
  private matchCommentary: IMatchCommentary;

  constructor(
    tacticsManager?: ITacticsManager,
    injuryManager?: IInjuryManager,
    moraleManager?: IMoraleManager,
    staffManager?: IStaffManager,
    weatherGenerator?: IWeatherGenerator,
    matchCommentary?: IMatchCommentary
  ) {
    // Use provided dependencies or create defaults for backward compatibility
    this.tacticsManager = tacticsManager ?? new TacticsManager();
    this.injuryManager = injuryManager ?? new InjuryManager();
    this.moraleManager = moraleManager ?? new MoraleManager();
    this.staffManager = staffManager ?? new StaffManager();
    this.weatherGenerator = weatherGenerator ?? new WeatherGenerator();
    this.matchCommentary = matchCommentary ?? new MatchCommentary();
  }

  /**
   * Calculate team strength based on player skills, manager bonus, morale, and available players
   */
  calculateTeamStrength(team: Team, currentWeek: number): number {
    if (!team.players || team.players.length === 0) {
      return 0;
    }

    // Only count available (not injured/suspended) players
    const availablePlayers = this.injuryManager.getAvailablePlayers(team, currentWeek);

    if (availablePlayers.length === 0) {
      return 0;
    }

    // Calculate total skill with morale modifiers
    const totalSkill = availablePlayers.reduce((sum, player) => {
      let effectiveSkill = player.skill;

      // Apply morale modifier if morale exists
      if (player.morale !== undefined) {
        const moraleInfo = this.moraleManager.getMoraleInfo(player.morale);
        effectiveSkill = this.moraleManager.applyMoraleToSkill(player.skill, moraleInfo);
      }

      return sum + effectiveSkill;
    }, 0);

    const baseStrength = totalSkill / availablePlayers.length;

    // Apply manager bonus (affects team performance)
    const managerBonus = this.staffManager.getManagerBonus(team);

    return baseStrength * managerBonus;
  }

  /**
   * Simulate a single match between two teams
   */
  simulateMatch(match: Match, currentWeek = 1, seed?: number, matchType: MatchType = 'competitive'): MatchResult {
    const homeStrength = this.calculateTeamStrength(match.homeTeam, currentWeek);
    const awayStrength = this.calculateTeamStrength(match.awayTeam, currentWeek);

    // Apply tactical modifiers
    const homeTactics = match.homeTeam.tactics || this.tacticsManager.getDefaultTactics();
    const awayTactics = match.awayTeam.tactics || this.tacticsManager.getDefaultTactics();

    const homeTacticalModifier = this.tacticsManager.calculateTacticalModifier(
      homeTactics,
      awayTactics
    );
    const awayTacticalModifier = this.tacticsManager.calculateTacticalModifier(
      awayTactics,
      homeTactics
    );

    // Apply advanced tactics modifiers (roles + instructions)
    const homeAdvancedModifier = this.tacticsManager.calculateAdvancedTacticsModifier(homeTactics);
    const awayAdvancedModifier = this.tacticsManager.calculateAdvancedTacticsModifier(awayTactics);

    // Home advantage (10% boost) + tactical modifier + advanced tactics
    const adjustedHomeStrength = homeStrength * 1.1 * (homeTacticalModifier + homeAdvancedModifier);
    const adjustedAwayStrength = awayStrength * (awayTacticalModifier + awayAdvancedModifier);

    // Calculate goal probabilities based on strength difference
    const homeGoals = this.generateGoals(adjustedHomeStrength, adjustedAwayStrength, seed);
    const awayGoals = this.generateGoals(
      adjustedAwayStrength,
      adjustedHomeStrength,
      seed ? seed + 1 : undefined
    );

    let result: 'home' | 'away' | 'draw';
    if (homeGoals > awayGoals) {
      result = 'home';
    } else if (awayGoals > homeGoals) {
      result = 'away';
    } else {
      result = 'draw';
    }

    // Generate match commentary
    const homeScorerPlayers = this.matchCommentary.selectGoalScorers(match.homeTeam, homeGoals, seed);
    const awayScorerPlayers = this.matchCommentary.selectGoalScorers(match.awayTeam, awayGoals, seed ? seed + 10 : undefined);

    // Detect derby before generating events
    const isDerby = this.isDerbyMatch(match.homeTeam.name, match.awayTeam.name);

    const events = this.matchCommentary.generateMatchEvents(
      match.homeTeam,
      match.awayTeam,
      homeGoals,
      awayGoals,
      homeScorerPlayers,
      awayScorerPlayers,
      seed
    );

    // Generate weather (we'll need this for attendance)
    const weather = this.weatherGenerator.generateWeather(currentWeek, seed);

    // Enhanced attendance with contextual factors
    // Note: We don't have league table here, so we'll pass undefined for positions
    const attendance = this.matchCommentary.generateAttendance(
      match.homeTeam,
      seed,
      {
        isDerby,
        weatherCondition: weather.condition,
        // homePosition and awayPosition would require league table, skip for now
      }
    );

    // Convert Player[] to string[] for goal scorers
    const homeGoalScorers = homeScorerPlayers.map((player) => player.name);
    const awayGoalScorers = awayScorerPlayers.map((player) => player.name);

    // Generate match statistics
    const stats = this.generateMatchStats(
      adjustedHomeStrength,
      adjustedAwayStrength,
      homeGoals,
      awayGoals,
      seed ? seed + 5000 : undefined
    );

    // Generate player ratings
    const playerRatings = this.generatePlayerRatings(
      match,
      homeGoals,
      awayGoals,
      homeScorerPlayers,
      awayScorerPlayers,
      seed ? seed + 6000 : undefined
    );

    // Select man of the match
    const manOfMatch = this.selectManOfMatch(
      playerRatings,
      homeScorerPlayers,
      awayScorerPlayers
    );

    return {
      homeScore: homeGoals,
      awayScore: awayGoals,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      result,
      matchType,
      homeGoalScorers,
      awayGoalScorers,
      events,
      attendance,
      // Match Day Atmosphere enhancements
      weather,
      stats,
      playerRatings,
      manOfMatch,
      isDerby,
      // Story 1.5.2: postMatchAnalysis is now required
      postMatchAnalysis: getDefaultPostMatchAnalysis(match.homeTeam.name, match.awayTeam.name),
    };
  }

  /**
   * Generate number of goals based on team strengths
   * Uses Poisson-like distribution
   */
  private generateGoals(attackStrength: number, defenseStrength: number, seed?: number): number {
    // Calculate expected goals based on strength ratio
    const strengthRatio = attackStrength / Math.max(defenseStrength, 1);
    const expectedGoals = Math.max(0, (strengthRatio - 0.5) * 3);

    // Use seeded random if provided, otherwise Math.random()
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Simple Poisson-like distribution
    let goals = 0;
    let probability = Math.exp(-expectedGoals);
    let cumulative = probability;

    while (random > cumulative && goals < 10) {
      goals++;
      probability *= expectedGoals / goals;
      cumulative += probability;
    }

    return goals;
  }

  /**
   * Simple seeded random number generator for testing
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate match statistics based on team strengths and scoreline
   */
  private generateMatchStats(
    homeStrength: number,
    awayStrength: number,
    homeScore: number,
    awayScore: number,
    seed?: number
  ): MatchStats {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Calculate possession based on strength ratio (50-50 if equal)
    const strengthTotal = homeStrength + awayStrength;
    const homePossessionBase = (homeStrength / strengthTotal) * 100;
    const homePossession = Math.round(homePossessionBase + (random - 0.5) * 10); // ±5% variance
    const awayPossession = 100 - homePossession;

    // Shots based on possession and goals (teams that score had more attempts)
    const homeShots = Math.max(homeScore * 2, Math.round((homePossession / 100) * (8 + random * 8)));
    const awayShots = Math.max(awayScore * 2, Math.round((awayPossession / 100) * (8 + random * 8)));

    // Shots on target = goals + some additional attempts
    const homeShotsOnTarget = homeScore + Math.floor(random * (homeShots - homeScore));
    const awayShotsOnTarget = awayScore + Math.floor(random * (awayShots - awayScore));

    // Corners roughly correlate with possession and attacking intent
    const homeCorners = Math.round((homePossession / 100) * (4 + random * 6));
    const awayCorners = Math.round((awayPossession / 100) * (4 + random * 6));

    // Fouls tend to be higher for teams with less possession (defending more)
    const homeFouls = Math.round((awayPossession / 100) * (8 + random * 8));
    const awayFouls = Math.round((homePossession / 100) * (8 + random * 8));

    return {
      possession: { home: homePossession, away: awayPossession },
      shots: { home: homeShots, away: awayShots },
      shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },
      corners: { home: homeCorners, away: awayCorners },
      fouls: { home: homeFouls, away: awayFouls },
    };
  }

  /**
   * Generate player ratings for all players in the match
   */
  private generatePlayerRatings(
    match: Match,
    homeScore: number,
    awayScore: number,
    homeScorerPlayers: Player[],
    awayScorerPlayers: Player[],
    seed?: number
  ): PlayerRating[] {
    const ratings: PlayerRating[] = [];
    // const random = seed !== undefined ? this.seededRandom(seed + 1000) : Math.random(); // Reserved for future rating variance

    // Get available players from both teams
    const homeAvailable = this.injuryManager.getAvailablePlayers(match.homeTeam, 1);
    const awayAvailable = this.injuryManager.getAvailablePlayers(match.awayTeam, 1);

    // Select 11 players from each team (best skilled available)
    const homePlayers = homeAvailable
      .sort((a: Player, b: Player) => b.skill - a.skill)
      .slice(0, 11);
    const awayPlayers = awayAvailable
      .sort((a: Player, b: Player) => b.skill - a.skill)
      .slice(0, 11);

    // Rate home team players
    homePlayers.forEach((player: Player, index: number) => {
      ratings.push(
        this.ratePlayer(player, 'home', homeScorerPlayers, homeScore, awayScore, seed ? seed + index : undefined)
      );
    });

    // Rate away team players
    awayPlayers.forEach((player: Player, index: number) => {
      ratings.push(
        this.ratePlayer(player, 'away', awayScorerPlayers, awayScore, homeScore, seed ? seed + 100 + index : undefined)
      );
    });

    return ratings;
  }

  /**
   * Rate an individual player's performance
   */
  private ratePlayer(
    player: Player,
    team: 'home' | 'away',
    teamScorers: Player[],
    teamScore: number,
    opponentScore: number,
    seed?: number
  ): PlayerRating {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Base rating from skill (1-20 scale → 4-8 rating scale)
    let rating = 4 + (player.skill / 20) * 4;

    // Check if player scored
    const goals = teamScorers.filter(s => s.id === player.id).length;
    const assists = 0; // TODO: Track assists properly in future

    // Bonuses
    if (goals > 0) {
      rating += 1.5 * goals; // +1.5 to +3 for goals
    }

    // Team result bonus/penalty
    if (teamScore > opponentScore) {
      rating += 0.5; // Winning team bonus
    } else if (teamScore < opponentScore) {
      rating -= 0.5; // Losing team penalty
    }

    // Clean sheet bonus for defenders and GK
    if ((player.position === 'DEF' || player.position === 'GK') && opponentScore === 0) {
      rating += 0.5;
    }

    // Add random variance (±1)
    rating += (random - 0.5) * 2;

    // Clamp to 1-10 range
    rating = Math.max(1, Math.min(10, rating));

    // Round to 1 decimal place
    rating = Math.round(rating * 10) / 10;

    return {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      rating,
      team,
      goals: goals > 0 ? goals : undefined,
      assists: assists > 0 ? assists : undefined,
    };
  }

  /**
   * Select man of the match from player ratings
   */
  private selectManOfMatch(
    ratings: PlayerRating[],
    _homeScorers: Player[],
    _awayScorers: Player[]
  ): ManOfMatch {
    // Find highest rated player
    const topRated = ratings.reduce((prev, current) =>
      current.rating > prev.rating ? current : prev
    );

    // Generate reason based on performance
    let reason = '';
    const goals = topRated.goals || 0;
    const assists = topRated.assists || 0;

    if (goals > 1) {
      reason = `${goals} goals`;
    } else if (goals === 1 && assists > 0) {
      reason = `${goals} goal and ${assists} assist${assists > 1 ? 's' : ''}`;
    } else if (goals === 1) {
      reason = 'Match-winning goal';
    } else if (assists > 1) {
      reason = `${assists} assists`;
    } else if (topRated.position === 'GK' && topRated.rating >= 8.5) {
      reason = 'Outstanding performance';
    } else if (topRated.rating >= 9.0) {
      reason = 'Dominant display';
    } else {
      reason = 'Excellent performance';
    }

    return {
      playerId: topRated.playerId,
      playerName: topRated.playerName,
      team: topRated.team,
      rating: topRated.rating,
      reason,
    };
  }

  /**
   * Detect if this is a derby/rivalry match
   */
  private isDerbyMatch(homeTeamName: string, awayTeamName: string): boolean {
    // Define known rivalries (can be expanded)
    const rivalries = [
      ['Manchester United', 'Manchester City'],
      ['Arsenal', 'Tottenham'],
      ['Liverpool', 'Everton'],
      ['Chelsea', 'Arsenal'],
      ['Celtic', 'Rangers'],
    ];

    return rivalries.some(
      ([team1, team2]) =>
        (homeTeamName === team1 && awayTeamName === team2) ||
        (homeTeamName === team2 && awayTeamName === team1)
    );
  }

  /**
   * Simulate a full season (38 matches for each team)
   * Returns array of all match results
   */
  simulateSeason(teams: Team[], seed?: number): MatchResult[] {
    const results: MatchResult[] = [];

    // Each team plays each other team twice (home and away)
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i !== j) {
          const match: Match = {
            homeTeam: teams[i],
            awayTeam: teams[j],
          };
          const matchSeed = seed !== undefined ? seed + i * teams.length + j : undefined;
          results.push(this.simulateMatch(match, 1, matchSeed));
        }
      }
    }

    return results;
  }

  /**
   * Simulate a knockout cup match with extra time and penalties if needed
   * Must produce a winner - no draws allowed in knockout competitions
   *
   * @param match - The match to simulate
   * @param currentWeek - Current week number
   * @param seed - Optional seed for reproducibility
   * @returns Cup result with winner/loser and ET/penalty flags
   */
  simulateKnockoutMatch(match: Match, currentWeek = 1, seed?: number): CupResult {
    // Simulate normal 90 minutes
    let result = this.simulateMatch(match, currentWeek, seed);

    let wentToExtraTime = false;
    let wentToPenalties = false;
    let penaltyScore: { home: number; away: number } | undefined;

    // If drawn, go to extra time
    if (result.homeScore === result.awayScore) {
      wentToExtraTime = true;
      result = this.simulateExtraTime(result, match, currentWeek, seed);

      // If still drawn, go to penalties
      if (result.homeScore === result.awayScore) {
        wentToPenalties = true;
        const penaltyResult = this.simulatePenalties(match, seed);
        penaltyScore = penaltyResult.penaltyScore;
        result = penaltyResult.result;
      }
    }

    // Determine winner and loser
    let winnerId: string;
    let winnerName: string;
    let loserId: string;
    let loserName: string;

    if (wentToPenalties && penaltyScore) {
      // Winner determined by penalties
      if (penaltyScore.home > penaltyScore.away) {
        winnerId = match.homeTeam.id;
        winnerName = match.homeTeam.name;
        loserId = match.awayTeam.id;
        loserName = match.awayTeam.name;
      } else {
        winnerId = match.awayTeam.id;
        winnerName = match.awayTeam.name;
        loserId = match.homeTeam.id;
        loserName = match.homeTeam.name;
      }
    } else {
      // Winner determined by goals (after ET or in normal time)
      if (result.homeScore > result.awayScore) {
        winnerId = match.homeTeam.id;
        winnerName = match.homeTeam.name;
        loserId = match.awayTeam.id;
        loserName = match.awayTeam.name;
      } else {
        winnerId = match.awayTeam.id;
        winnerName = match.awayTeam.name;
        loserId = match.homeTeam.id;
        loserName = match.homeTeam.name;
      }
    }

    return {
      ...result,
      wentToExtraTime,
      wentToPenalties,
      penaltyScore,
      winnerId,
      winnerName,
      loserId,
      loserName,
    };
  }

  /**
   * Simulate extra time (2x 15 minute periods)
   * Uses reduced goal generation (30 minutes vs 90 minutes)
   *
   * @param normalTimeResult - Result from normal 90 minutes
   * @param match - The match being played
   * @param currentWeek - Current week number
   * @param seed - Optional seed for reproducibility
   * @returns Updated match result with extra time goals added
   */
  private simulateExtraTime(
    normalTimeResult: MatchResult,
    match: Match,
    currentWeek: number,
    seed?: number
  ): MatchResult {
    const homeStrength = this.calculateTeamStrength(match.homeTeam, currentWeek);
    const awayStrength = this.calculateTeamStrength(match.awayTeam, currentWeek);

    // Apply tactical modifiers (same as normal time)
    const homeTactics = match.homeTeam.tactics || this.tacticsManager.getDefaultTactics();
    const awayTactics = match.awayTeam.tactics || this.tacticsManager.getDefaultTactics();

    const homeTacticalModifier = this.tacticsManager.calculateTacticalModifier(
      homeTactics,
      awayTactics
    );
    const awayTacticalModifier = this.tacticsManager.calculateTacticalModifier(
      awayTactics,
      homeTactics
    );

    // Apply advanced tactics modifiers (roles + instructions)
    const homeAdvancedModifier = this.tacticsManager.calculateAdvancedTacticsModifier(homeTactics);
    const awayAdvancedModifier = this.tacticsManager.calculateAdvancedTacticsModifier(awayTactics);

    const adjustedHomeStrength = homeStrength * 1.1 * (homeTacticalModifier + homeAdvancedModifier);
    const adjustedAwayStrength = awayStrength * (awayTacticalModifier + awayAdvancedModifier);

    // Extra time: 30 minutes vs 90 minutes = 1/3 the time
    // Reduce goal probability accordingly
    const etSeed = seed !== undefined ? seed + 9000 : undefined;
    const homeExtraGoals = this.generateGoals(adjustedHomeStrength * 0.33, adjustedAwayStrength * 0.33, etSeed);
    const awayExtraGoals = this.generateGoals(
      adjustedAwayStrength * 0.33,
      adjustedHomeStrength * 0.33,
      etSeed ? etSeed + 1 : undefined
    );

    // Update scores
    const newHomeScore = normalTimeResult.homeScore + homeExtraGoals;
    const newAwayScore = normalTimeResult.awayScore + awayExtraGoals;

    let newResult: 'home' | 'away' | 'draw';
    if (newHomeScore > newAwayScore) {
      newResult = 'home';
    } else if (newAwayScore > newHomeScore) {
      newResult = 'away';
    } else {
      newResult = 'draw';
    }

    return {
      ...normalTimeResult,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      result: newResult,
    };
  }

  /**
   * Simulate penalty shootout
   * Each team takes 5 penalties minimum, then sudden death if tied
   *
   * @param match - The match being played
   * @param seed - Optional seed for reproducibility
   * @returns Penalty score and updated result
   */
  /**
   * Get penalty takers, prioritizing designated taker if set
   */
  private getPenaltyTakers(team: Team): Player[] {
    const available = this.injuryManager.getAvailablePlayers(team, 1);

    // Sort by skill
    const sorted = available.sort((a: Player, b: Player) => b.skill - a.skill).slice(0, 11);

    // If there's a designated penalty taker, move them to first position
    const designatedTakerId = team.tactics?.setPieces?.penaltyTaker;
    if (designatedTakerId) {
      const takerIndex = sorted.findIndex((p: Player) => p.id === designatedTakerId);
      if (takerIndex > 0) {
        // Move designated taker to first position
        const taker = sorted.splice(takerIndex, 1)[0];
        sorted.unshift(taker);
      }
    }

    return sorted;
  }

  private simulatePenalties(
    match: Match,
    seed?: number
  ): { penaltyScore: { home: number; away: number }; result: MatchResult } {
    let homePenalties = 0;
    let awayPenalties = 0;

    // Get penalty takers (prioritize designated, then by skill)
    const homeTakers = this.getPenaltyTakers(match.homeTeam);
    const awayTakers = this.getPenaltyTakers(match.awayTeam);

    // First 5 penalties each (or less if not enough players)
    const maxPenalties = Math.min(5, homeTakers.length, awayTakers.length);
    for (let i = 0; i < maxPenalties; i++) {
      const homeTaker = homeTakers[i];
      const awayTaker = awayTakers[i];

      // Penalty success based on skill (70-90% success rate)
      const homeSuccess = this.attemptPenalty(homeTaker, seed ? seed + i * 2 : undefined);
      const awaySuccess = this.attemptPenalty(awayTaker, seed ? seed + i * 2 + 1 : undefined);

      if (homeSuccess) homePenalties++;
      if (awaySuccess) awayPenalties++;
    }

    // Sudden death if still tied
    let round = maxPenalties;
    while (homePenalties === awayPenalties && round < Math.max(11, homeTakers.length, awayTakers.length)) {
      const homeTaker = homeTakers[round % homeTakers.length];
      const awayTaker = awayTakers[round % awayTakers.length];

      const homeSuccess = this.attemptPenalty(homeTaker, seed ? seed + round * 2 + 1000 : undefined);
      const awaySuccess = this.attemptPenalty(awayTaker, seed ? seed + round * 2 + 1001 : undefined);

      if (homeSuccess) homePenalties++;
      if (awaySuccess) awayPenalties++;

      round++;
    }

    // Determine result based on penalties
    const result: 'home' | 'away' | 'draw' = homePenalties > awayPenalties ? 'home' : 'away';

    // Create a minimal result object (scores remain from ET)
    const penaltyResult: MatchResult = {
      homeScore: 0, // Will be overridden in calling function
      awayScore: 0,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      result,
      matchType: 'competitive', // Penalty shootouts only occur in competitive matches
      homeGoalScorers: [],
      awayGoalScorers: [],
      events: [],
      attendance: 0,
      // Story 1.5.2: Now required fields
      weather: getDefaultMatchWeather(),
      stats: getDefaultMatchStats(),
      playerRatings: [],
      manOfMatch: null,
      isDerby: false,
      postMatchAnalysis: getDefaultPostMatchAnalysis(match.homeTeam.name, match.awayTeam.name),
    };

    return {
      penaltyScore: { home: homePenalties, away: awayPenalties },
      result: penaltyResult,
    };
  }

  /**
   * Attempt a penalty kick
   * Success rate based on player skill (70-90%)
   *
   * @param player - Player taking the penalty
   * @param seed - Optional seed for reproducibility
   * @returns True if penalty is scored
   */
  private attemptPenalty(player: Player, seed?: number): boolean {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Skill-based success rate: 70% (skill 1) to 90% (skill 20)
    const successRate = 0.7 + (player.skill / 20) * 0.2;

    return random < successRate;
  }
}
