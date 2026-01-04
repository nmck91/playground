/**
 * Football Director Engine - Match Commentary
 * Generates real-time match events and commentary during match simulation
 *
 * Responsibilities:
 * - Select goal scorers and assist providers
 * - Generate match events (goals, cards, shots, saves, blocks, etc.)
 * - Generate attendance with contextual factors
 * - Real-time commentary descriptions
 *
 * Non-Responsibilities (handled by other modules):
 * - Pre-match previews and post-match analysis (MatchStoryGenerator)
 * - News articles (NewsEngine)
 */

import { Team, MatchEvent, Player, HalfTimeState } from './types';

/**
 * Match Commentary Interface
 *
 * Defines the contract for real-time match event generation.
 * Use this interface for dependency injection and testing.
 */
export interface IMatchCommentary {
  // Goal scorer selection
  selectGoalScorers(team: Team, numberOfGoals: number, seed?: number): Player[];
  selectAssistProvider(team: Team, scorer: Player, seed?: number): Player | null;

  // Event generation
  generateMatchEvents(
    homeTeam: Team,
    awayTeam: Team,
    homeScore: number,
    awayScore: number,
    homeScorers: Player[],
    awayScorers: Player[],
    seed?: number
  ): MatchEvent[];

  // Match phase commentary
  generateHalfTimeCommentary(state: HalfTimeState, seed?: number): string;
  generateFullTimeCommentary(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    events: MatchEvent[],
    seed?: number
  ): string;

  // Attendance
  generateAttendance(
    homeTeam: Team,
    seed?: number,
    options?: {
      isDerby?: boolean;
      homePosition?: number;
      awayPosition?: number;
      weatherCondition?: string;
    }
  ): number;
}

/**
 * Match Commentary Implementation
 *
 * Generates real-time match events during match simulation.
 */
export class MatchCommentary implements IMatchCommentary {
  /**
   * Select random goal scorers from a team based on position
   */
  selectGoalScorers(team: Team, numberOfGoals: number, seed?: number): Player[] {
    const scorers: Player[] = [];

    // Weight scorers by position (FWD most likely, DEF least likely)
    // Goalkeepers are excluded from scoring
    const positionWeights = {
      FWD: 5,
      MID: 3,
      DEF: 1,
      GK: 0, // Goalkeepers don't score
    };

    for (let i = 0; i < numberOfGoals; i++) {
      const random = seed !== undefined ? this.seededRandom(seed + i) : Math.random();

      // Create weighted player pool (excluding goalkeepers)
      const weightedPlayers: Player[] = [];
      team.players.forEach((player) => {
        // Skip goalkeepers entirely
        if (player.position === 'GK') return;

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

    // Generate detailed match events (shots, saves, chances)
    events.push(...this.generateDetailedMatchEvents(homeTeam, awayTeam, homeScore, awayScore, seed));

    // Sort events by minute
    return events.sort((a, b) => a.minute - b.minute);
  }

  /**
   * Generate detailed match events (shots, saves, big chances, blocks, near misses)
   */
  private generateDetailedMatchEvents(
    homeTeam: Team,
    awayTeam: Team,
    _homeScore: number,
    _awayScore: number,
    seed?: number
  ): MatchEvent[] {
    const detailedEvents: MatchEvent[] = [];
    // const totalGoals = homeScore + awayScore; // Currently unused

    // Generate 2-4 big chances (missed opportunities)
    const bigChancesCount = 2 + Math.floor((seed !== undefined ? this.seededRandom(seed + 900) : Math.random()) * 3);
    for (let i = 0; i < bigChancesCount; i++) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 901 + i) : Math.random();
      const team = teamRandom < 0.5 ? homeTeam : awayTeam;
      const player = this.selectRandomAttacker(team, seed ? seed + 902 + i : undefined);

      if (player) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 903 + i) : Math.random();
        const minute = 5 + Math.floor(minuteRandom * 85);

        const descriptions = [
          `${player.name} misses a golden opportunity!`,
          `${player.name} should have scored there!`,
          `Big chance wasted by ${player.name}!`,
          `${player.name} can't convert the chance!`,
        ];
        const descIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 904 + i) : Math.random()) * descriptions.length);

        detailedEvents.push({
          minute,
          type: 'big-chance',
          team: teamRandom < 0.5 ? 'home' : 'away',
          playerName: player.name,
          playerId: player.id,
          description: descriptions[descIndex],
        });
      }
    }

    // Generate 3-6 saves
    const savesCount = 3 + Math.floor((seed !== undefined ? this.seededRandom(seed + 1000) : Math.random()) * 4);
    for (let i = 0; i < savesCount; i++) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 1001 + i) : Math.random();
      // Goalkeeper is from opposite team
      const gkTeam = teamRandom < 0.5 ? awayTeam : homeTeam;
      const attackTeam = teamRandom < 0.5 ? homeTeam : awayTeam;

      const gk = gkTeam.players.find(p => p.position === 'GK');
      const attacker = this.selectRandomAttacker(attackTeam, seed ? seed + 1002 + i : undefined);

      if (gk && attacker) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 1003 + i) : Math.random();
        const minute = 5 + Math.floor(minuteRandom * 85);

        const descriptions = [
          `Brilliant save by ${gk.name} to deny ${attacker.name}!`,
          `${gk.name} makes a crucial save!`,
          `Great reflexes from ${gk.name}!`,
          `${gk.name} tips it away from danger!`,
        ];
        const descIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 1004 + i) : Math.random()) * descriptions.length);

        detailedEvents.push({
          minute,
          type: 'save',
          team: teamRandom < 0.5 ? 'away' : 'home', // Goalkeeper's team
          playerName: gk.name,
          playerId: gk.id,
          description: descriptions[descIndex],
        });
      }
    }

    // Generate 2-3 near misses (hitting post/crossbar)
    const nearMissCount = 2 + Math.floor((seed !== undefined ? this.seededRandom(seed + 1100) : Math.random()) * 2);
    for (let i = 0; i < nearMissCount; i++) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 1101 + i) : Math.random();
      const team = teamRandom < 0.5 ? homeTeam : awayTeam;
      const player = this.selectRandomAttacker(team, seed ? seed + 1102 + i : undefined);

      if (player) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 1103 + i) : Math.random();
        const minute = 5 + Math.floor(minuteRandom * 85);

        const target = (seed !== undefined ? this.seededRandom(seed + 1104 + i) : Math.random()) < 0.5 ? 'post' : 'crossbar';
        const descriptions = [
          `${player.name} hits the ${target}!`,
          `So close! ${player.name}'s shot strikes the ${target}!`,
          `${player.name} rattles the ${target}!`,
        ];
        const descIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 1105 + i) : Math.random()) * descriptions.length);

        detailedEvents.push({
          minute,
          type: 'near-miss',
          team: teamRandom < 0.5 ? 'home' : 'away',
          playerName: player.name,
          playerId: player.id,
          description: descriptions[descIndex],
        });
      }
    }

    // Generate 2-4 blocks
    const blocksCount = 2 + Math.floor((seed !== undefined ? this.seededRandom(seed + 1200) : Math.random()) * 3);
    for (let i = 0; i < blocksCount; i++) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 1201 + i) : Math.random();
      const defTeam = teamRandom < 0.5 ? awayTeam : homeTeam;
      const attackTeam = teamRandom < 0.5 ? homeTeam : awayTeam;

      const defender = this.selectRandomDefender(defTeam, seed ? seed + 1202 + i : undefined);
      const attacker = this.selectRandomAttacker(attackTeam, seed ? seed + 1203 + i : undefined);

      if (defender && attacker) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 1204 + i) : Math.random();
        const minute = 5 + Math.floor(minuteRandom * 85);

        const descriptions = [
          `${defender.name} blocks ${attacker.name}'s shot!`,
          `Crucial block by ${defender.name}!`,
          `${defender.name} throws his body on the line!`,
        ];
        const descIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 1205 + i) : Math.random()) * descriptions.length);

        detailedEvents.push({
          minute,
          type: 'block',
          team: teamRandom < 0.5 ? 'away' : 'home', // Defender's team
          playerName: defender.name,
          playerId: defender.id,
          description: descriptions[descIndex],
        });
      }
    }

    // Generate 4-8 shots on/off target
    const shotsCount = 4 + Math.floor((seed !== undefined ? this.seededRandom(seed + 1300) : Math.random()) * 5);
    for (let i = 0; i < shotsCount; i++) {
      const teamRandom = seed !== undefined ? this.seededRandom(seed + 1301 + i) : Math.random();
      const team = teamRandom < 0.5 ? homeTeam : awayTeam;
      const player = this.selectRandomAttacker(team, seed ? seed + 1302 + i : undefined);

      if (player) {
        const minuteRandom = seed !== undefined ? this.seededRandom(seed + 1303 + i) : Math.random();
        const minute = 5 + Math.floor(minuteRandom * 85);

        const isOnTarget = (seed !== undefined ? this.seededRandom(seed + 1304 + i) : Math.random()) < 0.6;
        const shotType = isOnTarget ? 'shot-on-target' : 'shot-off-target';

        const onTargetDesc = [
          `${player.name} tests the goalkeeper!`,
          `Shot from ${player.name}!`,
          `${player.name} forces a save!`,
        ];
        const offTargetDesc = [
          `${player.name} shoots wide!`,
          `${player.name}'s effort goes over the bar!`,
          `Wild shot from ${player.name}!`,
        ];
        const descriptions = isOnTarget ? onTargetDesc : offTargetDesc;
        const descIndex = Math.floor((seed !== undefined ? this.seededRandom(seed + 1305 + i) : Math.random()) * descriptions.length);

        detailedEvents.push({
          minute,
          type: shotType,
          team: teamRandom < 0.5 ? 'home' : 'away',
          playerName: player.name,
          playerId: player.id,
          description: descriptions[descIndex],
        });
      }
    }

    return detailedEvents;
  }

  /**
   * Select random attacker (FWD or MID)
   */
  private selectRandomAttacker(team: Team, seed?: number): Player | null {
    const attackers = team.players.filter(p => p.position === 'FWD' || p.position === 'MID');
    if (attackers.length === 0) return this.selectRandomPlayer(team, seed);
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();
    return attackers[Math.floor(random * attackers.length)];
  }

  /**
   * Select random defender
   */
  private selectRandomDefender(team: Team, seed?: number): Player | null {
    const defenders = team.players.filter(p => p.position === 'DEF');
    if (defenders.length === 0) return this.selectRandomPlayer(team, seed);
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();
    return defenders[Math.floor(random * defenders.length)];
  }

  /**
   * Generate a realistic goal minute
   */
  private generateGoalMinute(_totalGoals: number, goalIndex: number, seed?: number): number {
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
   * Generate half-time commentary with context-aware analysis
   */
  generateHalfTimeCommentary(state: HalfTimeState, seed?: number): string {
    const { homeTeam, awayTeam, homeScore, awayScore, events } = state;
    const random = seed !== undefined ? this.seededRandom(seed + 2000) : Math.random();

    // Check for red cards
    const hasRedCard = events.some(e => e.type === 'red-card');

    // Goalless draw at half-time
    if (homeScore === 0 && awayScore === 0) {
      const templates = [
        `It's goalless at the break. Both teams are cancelling each other out in a tight first half.`,
        `No goals yet as we reach half-time. Defenses on top in what's been a cagey affair so far.`,
        `Half-time and it's 0-0. Neither side has been able to find the breakthrough in this tactical battle.`,
        `The scoreboard remains blank at the interval. A tense first 45 minutes with few clear chances.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Draw with goals
    if (homeScore === awayScore && homeScore > 0) {
      const templates = [
        `We're all square at ${homeScore}-${homeScore} as the players head down the tunnel. An entertaining first half!`,
        `Half-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. It's been end-to-end action with both teams trading blows.`,
        `The teams are level at ${homeScore}-${homeScore} at the break. This one could go either way in the second half!`,
        `${homeScore}-${homeScore} at half-time in what's been a pulsating contest. Everything to play for after the break.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Home team leading
    if (homeScore > awayScore) {
      const margin = homeScore - awayScore;
      if (margin >= 3) {
        return `Half-time and ${homeTeam} are running riot! Leading ${homeScore}-${awayScore}, they've been utterly dominant.`;
      } else if (margin === 2) {
        const templates = [
          `${homeTeam} lead ${homeScore}-${awayScore} at the break. They've controlled the first half and ${awayTeam} have a mountain to climb.`,
          `Half-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. The home side have been impressive so far.`,
        ];
        return templates[Math.floor(random * templates.length)];
      } else {
        const templates = [
          `${homeTeam} edge it ${homeScore}-${awayScore} at half-time, but ${awayTeam} are still very much in this.`,
          `Narrow lead for ${homeTeam} as we reach the interval. ${homeScore}-${awayScore}, and it's all to play for.`,
          `Half-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. A slender advantage for the home side.`,
        ];
        return templates[Math.floor(random * templates.length)];
      }
    }

    // Away team leading
    const margin = awayScore - homeScore;
    if (margin >= 3) {
      return `Remarkable first half from ${awayTeam}! They lead ${awayScore}-${homeScore} at the break, completely outplaying the home side.`;
    } else if (margin === 2) {
      const templates = [
        `${awayTeam} are in control at the interval, leading ${awayScore}-${homeScore}. ${homeTeam} need a response in the second half.`,
        `Half-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. The visitors have been the better team so far.`,
      ];
      return templates[Math.floor(random * templates.length)];
    } else {
      const redCardContext = hasRedCard ? ' The red card could prove crucial in the second half.' : '';
      const templates = [
        `${awayTeam} lead ${awayScore}-${homeScore} at half-time. A valuable away advantage, but ${homeTeam} can still get back into this.${redCardContext}`,
        `Half-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. The away side have their noses in front.${redCardContext}`,
      ];
      return templates[Math.floor(random * templates.length)];
    }
  }

  /**
   * Generate full-time commentary with context-aware match summary
   */
  generateFullTimeCommentary(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    events: MatchEvent[],
    seed?: number
  ): string {
    const random = seed !== undefined ? this.seededRandom(seed + 3000) : Math.random();

    // Count significant events
    const totalGoals = homeScore + awayScore;
    const hasRedCard = events.some(e => e.type === 'red-card');
    const penaltyGoals = events.filter(e => e.type === 'penalty').length;

    // Goalless draw
    if (homeScore === 0 && awayScore === 0) {
      const templates = [
        `A tense goalless draw between ${homeTeam} and ${awayTeam}. Both defenses stood firm.`,
        `Full-time: 0-0. Neither side could find the breakthrough in a defensive battle.`,
        `The points are shared in a goalless stalemate. Frustration for both teams.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Big home win
    if (homeScore > awayScore + 2) {
      const redCardContext = hasRedCard ? ' The red card proved decisive.' : '';
      const templates = [
        `Dominant performance from ${homeTeam}! They ran riot with a convincing ${homeScore}-${awayScore} victory.${redCardContext}`,
        `Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. A comprehensive win for the home side!${redCardContext}`,
        `${homeTeam} were irresistible today, cruising to a ${homeScore}-${awayScore} triumph. ${awayTeam} were simply outclassed.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Big away win
    if (awayScore > homeScore + 2) {
      const redCardContext = hasRedCard ? ' Playing against ten men certainly helped.' : '';
      const templates = [
        `${awayTeam} were unstoppable away from home, cruising to a ${awayScore}-${homeScore} win!${redCardContext}`,
        `Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. A stunning away performance!${redCardContext}`,
        `Emphatic victory for ${awayTeam} who put ${homeScore} past ${homeTeam}. A result that will send shockwaves through the league.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // High-scoring draw
    if (homeScore === awayScore && totalGoals >= 4) {
      const templates = [
        `An entertaining ${homeScore}-${homeScore} draw! Both teams shared the points in a thrilling encounter.`,
        `What a game! Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. The fans certainly got their money's worth!`,
        `A pulsating ${homeScore}-${homeScore} thriller! Neither side deserved to lose this one.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Low-scoring draw
    if (homeScore === awayScore) {
      const templates = [
        `Full-time: ${homeScore}-${homeScore}. A fair result as both teams share the spoils.`,
        `The points are shared in a ${homeScore}-${homeScore} draw. A hard-fought contest.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Narrow home win
    if (homeScore === awayScore + 1) {
      const penaltyContext = penaltyGoals > 0 ? ' The penalty proved crucial.' : '';
      const templates = [
        `${homeTeam} edge past ${awayTeam} ${homeScore}-${awayScore} in a closely fought contest.${penaltyContext}`,
        `Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. The home side claim a narrow victory.${penaltyContext}`,
        `A tight match ends ${homeScore}-${awayScore} in favor of ${homeTeam}. ${awayTeam} pushed them all the way.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Narrow away win
    if (awayScore === homeScore + 1) {
      const penaltyContext = penaltyGoals > 0 ? ' The penalty made all the difference.' : '';
      const templates = [
        `${awayTeam} claim all three points with a ${awayScore}-${homeScore} away victory!${penaltyContext}`,
        `Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. A valuable away win for the visitors.${penaltyContext}`,
        `${awayTeam} edge it ${awayScore}-${homeScore} on the road. A hard-earned three points.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Home win by 2
    if (homeScore === awayScore + 2) {
      const templates = [
        `${homeTeam} secure a ${homeScore}-${awayScore} victory. A solid performance from the home side.`,
        `Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. Comfortable win in the end for ${homeTeam}.`,
      ];
      return templates[Math.floor(random * templates.length)];
    }

    // Away win by 2
    const templates = [
      `${awayTeam} triumph ${awayScore}-${homeScore} away from home. An impressive performance.`,
      `Full-time: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}. The visitors were deserving winners.`,
    ];
    return templates[Math.floor(random * templates.length)];
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
