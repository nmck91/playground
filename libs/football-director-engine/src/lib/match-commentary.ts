/**
 * Football Director Engine - Match Commentary
 * Generates exciting match highlights and commentary
 */

import { Team, MatchEvent, Player } from './types';

export class MatchCommentary {
  /**
   * Select random goal scorers from a team based on position
   */
  selectGoalScorers(team: Team, numberOfGoals: number, seed?: number): Player[] {
    const scorers: Player[] = [];

    // Weight scorers by position (FWD most likely, GK least likely)
    const positionWeights = {
      FWD: 5,
      MID: 3,
      DEF: 1,
      GK: 0.1,
    };

    for (let i = 0; i < numberOfGoals; i++) {
      const random = seed !== undefined ? this.seededRandom(seed + i) : Math.random();

      // Create weighted player pool
      const weightedPlayers: Player[] = [];
      team.players.forEach((player) => {
        const weight = positionWeights[player.position] * (player.skill / 10);
        const copies = Math.max(1, Math.floor(weight));
        for (let j = 0; j < copies; j++) {
          weightedPlayers.push(player);
        }
      });

      if (weightedPlayers.length > 0) {
        const scorer = weightedPlayers[Math.floor(random * weightedPlayers.length)];
        scorers.push(scorer);
      }
    }

    return scorers;
  }

  /**
   * Select assist provider for a goal (50% probability)
   * Returns null if no assist (solo goal)
   */
  selectAssistProvider(team: Team, scorer: Player, seed?: number): Player | null {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // 50% chance of having an assist
    if (random > 0.5) {
      return null;
    }

    // Weight assist providers by position (MID most likely, GK least likely)
    const positionWeights = {
      FWD: 3,
      MID: 5,
      DEF: 1,
      GK: 0.1,
    };

    const assistRandom = seed !== undefined ? this.seededRandom(seed + 1) : Math.random();

    // Create weighted player pool (excluding the scorer)
    const weightedPlayers: Player[] = [];
    team.players.forEach((player) => {
      if (player.id !== scorer.id) {
        const weight = positionWeights[player.position] * (player.skill / 10);
        const copies = Math.max(1, Math.floor(weight));
        for (let j = 0; j < copies; j++) {
          weightedPlayers.push(player);
        }
      }
    });

    if (weightedPlayers.length > 0) {
      return weightedPlayers[Math.floor(assistRandom * weightedPlayers.length)];
    }

    return null;
  }

  /**
   * Generate match events (goals, cards, etc.)
   */
  generateMatchEvents(
    homeTeam: Team,
    awayTeam: Team,
    homeScore: number,
    awayScore: number,
    homeScorers: Player[],
    awayScorers: Player[],
    seed?: number
  ): MatchEvent[] {
    const events: MatchEvent[] = [];

    // Add goal events for home team
    homeScorers.forEach((scorer, index) => {
      const minute = this.generateGoalMinute(homeScore + awayScore, index, seed);
      const assistProvider = this.selectAssistProvider(homeTeam, scorer, seed ? seed + index + 300 : undefined);

      events.push({
        minute,
        type: 'goal',
        team: 'home',
        playerName: scorer.name,
        playerId: scorer.id,
        assistPlayerName: assistProvider?.name,
        assistPlayerId: assistProvider?.id,
        description: this.generateGoalDescription(scorer.name, homeTeam.name, minute, seed, assistProvider?.name),
      });
    });

    // Add goal events for away team
    awayScorers.forEach((scorer, index) => {
      const minute = this.generateGoalMinute(homeScore + awayScore, index + homeScore, seed);
      const assistProvider = this.selectAssistProvider(awayTeam, scorer, seed ? seed + index + 400 : undefined);

      events.push({
        minute,
        type: 'goal',
        team: 'away',
        playerName: scorer.name,
        playerId: scorer.id,
        assistPlayerName: assistProvider?.name,
        assistPlayerId: assistProvider?.id,
        description: this.generateGoalDescription(scorer.name, awayTeam.name, minute, seed, assistProvider?.name),
      });
    });

    // Add occasional yellow cards (30% chance in high-scoring games)
    const totalGoals = homeScore + awayScore;
    const cardRandom = seed !== undefined ? this.seededRandom(seed + 500) : Math.random();
    if (totalGoals >= 3 && cardRandom < 0.3) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 501) : Math.random();
      const randomPlayer = this.selectRandomPlayer(
        teamRandom < 0.5 ? homeTeam : awayTeam,
        seed
      );
      if (randomPlayer) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 502) : Math.random();
        const teamChoice = seed !== undefined ? this.seededRandom(seed + 503) : Math.random();
        events.push({
          minute: 45 + Math.floor(minuteRandom * 45),
          type: 'yellow-card',
          team: teamChoice < 0.5 ? 'home' : 'away',
          playerName: randomPlayer.name,
          playerId: randomPlayer.id,
          description: `${randomPlayer.name} receives a yellow card for a late challenge`,
        });
      }
    }

    // Add red cards (5% chance in competitive matches)
    const redCardRandom = seed !== undefined ? this.seededRandom(seed + 600) : Math.random();
    if (redCardRandom < 0.05) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 601) : Math.random();
      const redCardPlayer = this.selectRandomPlayer(
        teamRandom < 0.5 ? homeTeam : awayTeam,
        seed ? seed + 602 : undefined
      );
      if (redCardPlayer) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 603) : Math.random();
        const minute = 20 + Math.floor(minuteRandom * 60); // Between 20-80 minutes
        const teamChoice = seed !== undefined ? this.seededRandom(seed + 604) : Math.random();
        events.push({
          minute,
          type: 'red-card',
          team: teamChoice < 0.5 ? 'home' : 'away',
          playerName: redCardPlayer.name,
          playerId: redCardPlayer.id,
          description: `🟥 ${redCardPlayer.name} is sent off! Straight red card for a reckless challenge!`,
        });
      }
    }

    // Mark some goals as penalties (10% of goals)
    const penaltyRandom = seed !== undefined ? this.seededRandom(seed + 700) : Math.random();
    if (totalGoals > 0 && penaltyRandom < 0.1) {
      // Pick a random goal event and mark it as penalty
      const goalEvents = events.filter(e => e.type === 'goal');
      if (goalEvents.length > 0) {
        const penaltyGoalIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 701) : Math.random()) * goalEvents.length);
        const penaltyGoal = goalEvents[penaltyGoalIndex];
        penaltyGoal.type = 'penalty';
        penaltyGoal.description = `${penaltyGoal.minute}' - ⚽ PENALTY! ${penaltyGoal.playerName} converts from the spot!`;
      }
    }

    // Add match injuries (8% chance)
    const injuryRandom = seed !== undefined ? this.seededRandom(seed + 800) : Math.random();
    if (injuryRandom < 0.08) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 801) : Math.random();
      const injuredPlayer = this.selectRandomPlayer(
        teamRandom < 0.5 ? homeTeam : awayTeam,
        seed ? seed + 802 : undefined
      );
      if (injuredPlayer) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 803) : Math.random();
        const minute = 10 + Math.floor(minuteRandom * 70); // Between 10-80 minutes
        const teamChoice = seed !== undefined ? this.seededRandom(seed + 804) : Math.random();

        const injuryDescriptions = [
          'picks up a knock',
          'goes down injured',
          'suffers an injury',
          'is hurt in a challenge',
          'clutches their leg',
        ];
        const descIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 805) : Math.random()) * injuryDescriptions.length);

        events.push({
          minute,
          type: 'goal', // Using 'goal' type since we don't have 'injury' type defined yet
          team: teamChoice < 0.5 ? 'home' : 'away',
          playerName: injuredPlayer.name,
          playerId: injuredPlayer.id,
          description: `🚑 ${injuredPlayer.name} ${injuryDescriptions[descIndex]} and requires treatment`,
        });
      }
    }

    // Sort events by minute
    return events.sort((a, b) => a.minute - b.minute);
  }

  /**
   * Generate a realistic goal minute
   */
  private generateGoalMinute(totalGoals: number, goalIndex: number, seed?: number): number {
    const random = seed !== undefined ? this.seededRandom(seed + goalIndex + 100) : Math.random();
    const minuteRandom = seed !== undefined ? this.seededRandom(seed + goalIndex + 200) : Math.random();

    // Goals more likely in certain periods
    if (random < 0.2) {
      return Math.floor(minuteRandom * 15); // Early goal (0-15)
    } else if (random < 0.4) {
      return 30 + Math.floor(minuteRandom * 15); // Just before halftime (30-45)
    } else if (random < 0.6) {
      return 45 + Math.floor(minuteRandom * 15); // Early second half (45-60)
    } else {
      return 75 + Math.floor(minuteRandom * 15); // Late drama (75-90)
    }
  }

  /**
   * Generate exciting goal description
   */
  private generateGoalDescription(scorer: string, team: string, minute: number, seed?: number, assistProvider?: string): string {
    let descriptions: string[];

    if (assistProvider) {
      descriptions = [
        `⚽ GOAL! ${scorer} finds the back of the net! Assist: ${assistProvider}`,
        `⚽ ${scorer} scores a brilliant goal for ${team}! Great pass from ${assistProvider}!`,
        `⚽ What a strike! ${scorer} makes it count! Set up by ${assistProvider}`,
        `⚽ ${scorer} with a clinical finish! Assisted by ${assistProvider}`,
        `⚽ ${team} take the lead through ${scorer}! ${assistProvider} with the assist`,
        `⚽ ${scorer} slots it home with precision! ${assistProvider} creates the chance`,
        `⚽ Spectacular goal by ${scorer}! Wonderful assist from ${assistProvider}`,
        `⚽ ${scorer} finds space and finishes beautifully! ${assistProvider} picks out the pass`,
      ];
    } else {
      descriptions = [
        `⚽ GOAL! ${scorer} finds the back of the net!`,
        `⚽ ${scorer} scores a brilliant goal for ${team}!`,
        `⚽ What a strike! ${scorer} makes it count!`,
        `⚽ ${scorer} with a clinical finish!`,
        `⚽ ${team} take the lead through ${scorer}!`,
        `⚽ ${scorer} slots it home with precision!`,
        `⚽ Spectacular goal by ${scorer}!`,
        `⚽ ${scorer} finds space and finishes beautifully!`,
      ];
    }

    const random = seed !== undefined ? this.seededRandom(seed + minute) : Math.random();
    const description = descriptions[Math.floor(random * descriptions.length)];
    return `${minute}' - ${description}`;
  }

  /**
   * Generate match summary commentary
   */
  generateMatchSummary(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    events: MatchEvent[]
  ): string {
    const goalEvents = events.filter((e) => e.type === 'goal');

    if (homeScore === 0 && awayScore === 0) {
      return `A tense goalless draw between ${homeTeam} and ${awayTeam}. Both defenses stood firm.`;
    }

    if (homeScore > awayScore + 2) {
      return `Dominant performance from ${homeTeam}! They ran riot with a convincing ${homeScore}-${awayScore} victory.`;
    }

    if (awayScore > homeScore + 2) {
      return `${awayTeam} were unstoppable away from home, cruising to a ${awayScore}-${homeScore} win!`;
    }

    if (homeScore === awayScore) {
      return `An entertaining ${homeScore}-${homeScore} draw! Both teams shared the points in a thrilling encounter.`;
    }

    if (homeScore > awayScore) {
      return `${homeTeam} edge past ${awayTeam} ${homeScore}-${awayScore} in a closely fought contest.`;
    } else {
      return `${awayTeam} claim all three points with a ${awayScore}-${homeScore} away victory!`;
    }
  }

  /**
   * Generate attendance figure with enhanced contextual factors
   */
  generateAttendance(
    homeTeam: Team,
    seed?: number,
    options?: {
      isDerby?: boolean;
      homePosition?: number;
      awayPosition?: number;
      weatherCondition?: string;
    }
  ): number {
    const random = seed !== undefined ? this.seededRandom(seed + 1000) : Math.random();

    // Base attendance on team budget (proxy for popularity)
    let baseAttendance = Math.min(50000, homeTeam.budget / 50);

    // Apply contextual modifiers
    let modifier = 1.0;

    // Derby bonus (+20%)
    if (options?.isDerby) {
      modifier += 0.20;
    }

    // Home team in top 4 (+10%)
    if (options?.homePosition && options.homePosition <= 4) {
      modifier += 0.10;
    }

    // Away team is league leader (+15%)
    if (options?.awayPosition && options.awayPosition === 1) {
      modifier += 0.15;
    }

    // Weather penalty for bad conditions (-10%)
    if (options?.weatherCondition === 'rainy' || options?.weatherCondition === 'snowy') {
      modifier -= 0.10;
    }

    // Apply modifier
    baseAttendance *= modifier;

    // Add variance (±15%)
    const variance = baseAttendance * 0.15;
    const attendance = baseAttendance + (random - 0.5) * 2 * variance;

    return Math.max(5000, Math.floor(attendance / 100) * 100); // Round to nearest 100
  }

  /**
   * Select random player from team
   */
  private selectRandomPlayer(team: Team, seed?: number): Player | null {
    if (team.players.length === 0) return null;
    const random = seed !== undefined ? this.seededRandom(seed + 504) : Math.random();
    return team.players[Math.floor(random * team.players.length)];
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
