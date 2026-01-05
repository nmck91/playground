/**
 * Custom Match Simulation Examples
 *
 * This file demonstrates how to use the Football Director Engine
 * to simulate matches with custom logic and configurations.
 */

import { getModule } from '../libs/football-director-engine/src/lib/module-registry';
import {
  MatchSimulator,
  SeasonManager,
  TeamGenerator,
  LeagueTableManager,
  WeatherGenerator,
} from '../libs/football-director-engine/src/lib/module-keys';
import type {
  Team,
  Player,
  MatchResult,
  Fixture,
  LeagueTable,
} from '../libs/football-director-engine/src/lib/types';

/**
 * Example 1: Basic Match Simulation
 *
 * Simulate a single match between two teams.
 */
export function example1_BasicMatchSimulation() {
  console.log('=== Example 1: Basic Match Simulation ===\n');

  // Get module instances from registry
  const matchSimulator = getModule(MatchSimulator);
  const teamGenerator = getModule(TeamGenerator);

  // Generate two teams
  const teams = teamGenerator.generateTeams(2, 'Premier League');
  const homeTeam = teams[0];
  const awayTeam = teams[1];

  console.log(\`Match: \${homeTeam.name} vs \${awayTeam.name}\`);

  // Simulate the match
  const result = matchSimulator.simulateMatch(homeTeam, awayTeam, 10);

  console.log(\`\nResult: \${result.homeTeam} \${result.homeScore} - \${result.awayScore} \${result.awayTeam}\`);
  console.log(\`\nMatch Events:\`);
  result.events.forEach((event, index) => {
    console.log(\`\${index + 1}. \${event.minute}' - \${event.type}: \${event.player || 'N/A'}\`);
  });

  console.log(\`\nMan of the Match: \${result.manOfMatch.playerName} (\${result.manOfMatch.rating.toFixed(1)})\`);

  return result;
}

// Run all examples
if (require.main === module) {
  const { initializeEngine } = require('../libs/football-director-engine/src/lib/setup-modules');
  initializeEngine();
  example1_BasicMatchSimulation();
}
