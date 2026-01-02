/**
 * Example: Custom Match Simulation
 *
 * This example demonstrates how to use the Football Director Engine
 * to simulate matches with custom logic and handle match events.
 */

import {
  TeamGenerator,
  SeasonManager,
  MatchSimulator,
  LeagueTableManager,
  MatchCommentary,
  MatchStoryGenerator,
  NewsEngine,
  type Team,
  type Season,
  type MatchResult,
  type LeagueTable
} from '@playground/football-director-engine';

/**
 * Basic Match Simulation
 *
 * Shows the simplest way to simulate a single match.
 */
export function basicMatchSimulation() {
  console.log('=== Basic Match Simulation ===\n');

  // 1. Generate teams
  const generator = new TeamGenerator();
  const teams = generator.generateLeague();

  // 2. Get two teams
  const homeTeam = teams[0];
  const awayTeam = teams[1];

  // 3. Create a fixture
  const fixture = {
    id: 'fixture-1',
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeamName: homeTeam.name,
    awayTeamName: awayTeam.name,
    week: 1,
    year: 2025,
    played: false
  };

  // 4. Simulate the match
  const simulator = new MatchSimulator();
  const result = simulator.simulateMatch(
    homeTeam,
    awayTeam,
    fixture,
    1, // week
    2025 // year
  );

  // 5. Display results
  console.log(`${result.homeTeamName} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeamName}`);
  console.log(`Attendance: ${result.attendance.toLocaleString()}`);
  console.log(`\nKey Events:`);

  result.events.forEach(event => {
    if (event.type === 'goal') {
      console.log(`  ${event.minute}' - GOAL! ${event.playerName} (${event.teamName})`);
    } else if (event.type === 'yellow-card' || event.type === 'red-card') {
      console.log(`  ${event.minute}' - ${event.type.toUpperCase()}: ${event.playerName}`);
    }
  });

  return result;
}

/**
 * Match Simulation with Commentary
 *
 * Shows how to generate live commentary during a match.
 */
export function matchSimulationWithCommentary() {
  console.log('\n=== Match with Commentary ===\n');

  const generator = new TeamGenerator();
  const teams = generator.generateLeague();
  const homeTeam = teams[0];
  const awayTeam = teams[1];

  const fixture = {
    id: 'fixture-2',
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeamName: homeTeam.name,
    awayTeamName: awayTeam.name,
    week: 1,
    year: 2025,
    played: false
  };

  const simulator = new MatchSimulator();
  const commentary = new MatchCommentary();

  // Simulate match
  const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, 1, 2025);

  console.log(`${result.homeTeamName} vs ${result.awayTeamName}`);
  console.log('=' .repeat(50));

  // Generate commentary for each event
  let currentScore = { home: 0, away: 0 };

  result.events.forEach(event => {
    const eventCommentary = commentary.generateEventCommentary(
      event,
      homeTeam,
      awayTeam,
      currentScore,
      event.minute
    );

    console.log(`\n${event.minute}' - ${eventCommentary}`);

    // Update score for context
    if (event.type === 'goal') {
      if (event.teamId === homeTeam.id) {
        currentScore.home++;
      } else {
        currentScore.away++;
      }
    }
  });

  // Half-time commentary
  const halfTimeCommentary = commentary.generateHalfTimeCommentary(
    homeTeam,
    awayTeam,
    { home: result.homeGoals, away: result.awayGoals },
    result.events.filter(e => e.minute <= 45)
  );

  console.log(`\n--- HALF TIME ---`);
  console.log(halfTimeCommentary);

  // Full-time commentary
  const fullTimeCommentary = commentary.generateFullTimeCommentary(result);

  console.log(`\n--- FULL TIME ---`);
  console.log(fullTimeCommentary);
  console.log(`Final Score: ${result.homeTeamName} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeamName}`);

  return result;
}

/**
 * Match Simulation with Post-Match Analysis
 *
 * Shows how to generate post-match analysis and news articles.
 */
export function matchSimulationWithAnalysis() {
  console.log('\n=== Match with Post-Match Analysis ===\n');

  const generator = new TeamGenerator();
  const teams = generator.generateLeague();
  const homeTeam = teams[0];
  const awayTeam = teams[1];

  // Initialize season for table context
  const seasonManager = new SeasonManager();
  const season = seasonManager.initializeSeason(teams, 2025);
  const fixture = season.fixtures[0];

  // Simulate match
  const simulator = new MatchSimulator();
  const result = simulator.simulateMatch(
    homeTeam,
    awayTeam,
    fixture,
    1,
    2025
  );

  // Update league table
  const tableManager = new LeagueTableManager();
  let table = tableManager.initializeTable(teams);
  table = tableManager.updateTable(table, result);

  // Generate post-match analysis
  const storyGen = new MatchStoryGenerator();
  const analysis = storyGen.generatePostMatchAnalysis(
    result,
    homeTeam,
    awayTeam,
    table
  );

  console.log(`${result.homeTeamName} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeamName}`);
  console.log('=' .repeat(50));

  console.log('\nManager Quotes:');
  console.log(`${analysis.homeManagerQuote.manager}: "${analysis.homeManagerQuote.quote}"`);
  console.log(`${analysis.awayManagerQuote.manager}: "${analysis.awayManagerQuote.quote}"`);

  if (analysis.playerInterview) {
    console.log('\nPlayer Interview:');
    console.log(`${analysis.playerInterview.playerName}: "${analysis.playerInterview.quote}"`);
  }

  if (analysis.turningPoint) {
    console.log('\nTurning Point:');
    console.log(`- ${analysis.turningPoint}`);
  }

  console.log('\nKey Statistics:');
  analysis.keyStats.forEach(stat => {
    console.log(`- ${stat.label}: ${stat.value}`);
  });

  // Generate news article
  const newsEngine = new NewsEngine();
  const newsArticle = newsEngine.generateMatchNews(result);

  console.log('\n=== NEWS ARTICLE ===');
  console.log(`Title: ${newsArticle.title}`);
  console.log(`\n${newsArticle.content}`);

  return { result, analysis, newsArticle };
}

/**
 * Full Season Match Simulation
 *
 * Shows how to simulate an entire season of matches.
 */
export function fullSeasonSimulation() {
  console.log('\n=== Full Season Simulation ===\n');

  // 1. Generate league
  const generator = new TeamGenerator();
  const teams = generator.generateLeague();

  // 2. Initialize season
  const seasonManager = new SeasonManager();
  let season = seasonManager.initializeSeason(teams, 2025);

  // 3. Initialize league table
  const tableManager = new LeagueTableManager();
  let table = tableManager.initializeTable(teams);

  // 4. Initialize match simulator
  const simulator = new MatchSimulator();

  // 5. Simulate all weeks
  let matchesPlayed = 0;

  for (let week = 1; week <= 52; week++) {
    // Get fixtures for this week
    const weekFixtures = season.fixtures.filter(f => f.week === week && !f.played);

    if (weekFixtures.length > 0) {
      console.log(`Week ${week}:`);

      // Simulate each fixture
      weekFixtures.forEach(fixture => {
        const homeTeam = teams.find(t => t.id === fixture.homeTeamId)!;
        const awayTeam = teams.find(t => t.id === fixture.awayTeamId)!;

        const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, week, 2025);

        console.log(`  ${result.homeTeamName} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeamName}`);

        // Update table
        table = tableManager.updateTable(table, result);

        // Mark fixture as played
        fixture.played = true;
        matchesPlayed++;
      });
    }

    // Advance week
    season = seasonManager.advanceWeek(season);
  }

  // 6. Display final table
  console.log('\n=== FINAL LEAGUE TABLE ===\n');
  console.log('Pos  Team                         P   W  D  L   GF  GA  GD  Pts');
  console.log('─'.repeat(70));

  table.forEach((team, index) => {
    const pos = (index + 1).toString().padStart(2);
    const name = team.teamName.padEnd(25);
    const played = team.played.toString().padStart(2);
    const won = team.won.toString().padStart(2);
    const drawn = team.drawn.toString().padStart(2);
    const lost = team.lost.toString().padStart(2);
    const gf = team.goalsFor.toString().padStart(3);
    const ga = team.goalsAgainst.toString().padStart(3);
    const gd = team.goalDifference.toString().padStart(3);
    const pts = team.points.toString().padStart(3);

    console.log(`${pos}   ${name} ${played}  ${won} ${drawn} ${lost}  ${gf} ${ga} ${gd} ${pts}`);
  });

  console.log(`\nTotal Matches Played: ${matchesPlayed}`);
  console.log(`Champion: ${table[0].teamName}`);

  return { season, table };
}

/**
 * Deterministic Match Simulation
 *
 * Shows how to use seeds for reproducible results.
 */
export function deterministicMatchSimulation() {
  console.log('\n=== Deterministic Match Simulation ===\n');

  const generator = new TeamGenerator();

  // Generate same league twice with same seed
  const teams1 = generator.generateLeague(12345);
  const teams2 = generator.generateLeague(12345);

  console.log('League 1 first team:', teams1[0].name);
  console.log('League 2 first team:', teams2[0].name);
  console.log('Names match:', teams1[0].name === teams2[0].name); // true

  // Simulate same match twice with same seed
  const simulator = new MatchSimulator();

  const fixture = {
    id: 'fixture-deterministic',
    homeTeamId: teams1[0].id,
    awayTeamId: teams1[1].id,
    homeTeamName: teams1[0].name,
    awayTeamName: teams1[1].name,
    week: 1,
    year: 2025,
    played: false
  };

  // Note: MatchSimulator doesn't currently expose seed parameter in public API
  // This is an example of how it would work if it did
  const result1 = simulator.simulateMatch(teams1[0], teams1[1], fixture, 1, 2025);
  const result2 = simulator.simulateMatch(teams2[0], teams2[1], fixture, 1, 2025);

  console.log(`\nMatch 1: ${result1.homeTeamName} ${result1.homeGoals} - ${result1.awayGoals} ${result1.awayTeamName}`);
  console.log(`Match 2: ${result2.homeTeamName} ${result2.homeGoals} - ${result2.awayGoals} ${result2.awayTeamName}`);

  // Note: Without seed support in simulateMatch, scores may differ
  console.log('Same teams, potentially different results (no seed in simulateMatch)');

  return { result1, result2 };
}

// Run examples if executed directly
if (require.main === module) {
  console.log('Football Director Engine - Match Simulation Examples\n');
  console.log('=' .repeat(70));

  basicMatchSimulation();
  matchSimulationWithCommentary();
  matchSimulationWithAnalysis();

  // Uncomment to run full season (takes longer)
  // fullSeasonSimulation();

  deterministicMatchSimulation();
}
