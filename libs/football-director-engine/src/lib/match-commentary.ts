/**
 * Football Director Engine - Match Commentary
 * Generates exciting match highlights and commentary
 */

import { Team, MatchEvent, Player } from './types';

export class MatchCommentary {
  /**
   * Select random goal scorers from a team based on position
   */
  selectGoalScorers(team: Team, numberOfGoals: number, seed?: number): string[] {
    const scorers: string[] = [];

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
        scorers.push(scorer.name);
      }
    }

    return scorers;
  }

  /**
   * Generate match events (goals, cards, etc.)
   */
  generateMatchEvents(
    homeTeam: Team,
    awayTeam: Team,
    homeScore: number,
    awayScore: number,
    homeScorers: string[],
    awayScorers: string[],
    seed?: number
  ): MatchEvent[] {
    const events: MatchEvent[] = [];

    // Add goal events
    homeScorers.forEach((scorer, index) => {
      const minute = this.generateGoalMinute(homeScore + awayScore, index, seed);
      events.push({
        minute,
        type: 'goal',
        team: 'home',
        playerName: scorer,
        description: this.generateGoalDescription(scorer, homeTeam.name, minute, seed),
      });
    });

    awayScorers.forEach((scorer, index) => {
      const minute = this.generateGoalMinute(homeScore + awayScore, index + homeScore, seed);
      events.push({
        minute,
        type: 'goal',
        team: 'away',
        playerName: scorer,
        description: this.generateGoalDescription(scorer, awayTeam.name, minute, seed),
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
          description: `${randomPlayer.name} receives a yellow card for a late challenge`,
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
  private generateGoalDescription(scorer: string, team: string, minute: number, seed?: number): string {
    const descriptions = [
      `⚽ GOAL! ${scorer} finds the back of the net!`,
      `⚽ ${scorer} scores a brilliant goal for ${team}!`,
      `⚽ What a strike! ${scorer} makes it count!`,
      `⚽ ${scorer} with a clinical finish!`,
      `⚽ ${team} take the lead through ${scorer}!`,
      `⚽ ${scorer} slots it home with precision!`,
      `⚽ Spectacular goal by ${scorer}!`,
      `⚽ ${scorer} finds space and finishes beautifully!`,
    ];

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
   * Generate attendance figure
   */
  generateAttendance(homeTeam: Team, seed?: number): number {
    const random = seed !== undefined ? this.seededRandom(seed + 1000) : Math.random();

    // Base attendance on team budget (proxy for popularity)
    const baseAttendance = Math.min(50000, homeTeam.budget / 50);
    const variance = baseAttendance * 0.3; // ±30% variance

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
