/**
 * Example: Custom Transfer Logic
 *
 * This example demonstrates how to use and extend the TransferMarket
 * module for custom transfer logic and market manipulation.
 */

import {
  TeamGenerator,
  TransferMarket,
  type Team,
  type Player,
  type TransferListing
} from '@playground/football-director-engine';

/**
 * Basic Transfer Market Usage
 *
 * Shows how to use the transfer market for buying and selling players.
 */
export function basicTransferMarketUsage() {
  console.log('=== Basic Transfer Market Usage ===\n');

  // 1. Generate teams
  const generator = new TeamGenerator();
  const teams = generator.generateLeague();

  const playerTeam = teams[0]; // Your team
  const aiTeams = teams.slice(1); // AI teams

  // 2. Create transfer market
  const market = new TransferMarket();

  // 3. Check if transfer window is open
  const currentWeek = 5; // Pre-season window (weeks 1-8)
  const isOpen = market.isTransferWindowOpen(currentWeek);

  console.log(`Current Week: ${currentWeek}`);
  console.log(`Transfer Window Open: ${isOpen}`);

  if (!isOpen) {
    console.log('Transfer window is closed!');
    return;
  }

  // 4. Generate transfer listings from AI teams
  const listings = market.generateMarket(aiTeams, currentWeek, 10);

  console.log(`\nAvailable Players: ${listings.length}\n`);

  // Display top 5 listings
  listings.slice(0, 5).forEach((listing, index) => {
    console.log(`${index + 1}. ${listing.player.name} (${listing.player.position})`);
    console.log(`   Age: ${listing.player.age} | Skill: ${listing.player.skill}`);
    console.log(`   Team: ${listing.sellingTeamName}`);
    console.log(`   Price: £${listing.askingPrice.toLocaleString()}`);
    console.log();
  });

  // 5. Buy a player
  const targetListing = listings[0];
  const sellerTeam = teams.find(t => t.id === targetListing.sellingTeamId)!;

  console.log(`Attempting to buy: ${targetListing.player.name}`);
  console.log(`Your Budget: £${playerTeam.budget.toLocaleString()}`);
  console.log(`Asking Price: £${targetListing.askingPrice.toLocaleString()}\n`);

  const buyResult = market.buyPlayer(
    targetListing,
    playerTeam,
    sellerTeam,
    listings,
    currentWeek
  );

  if (buyResult.success) {
    console.log(`✓ ${buyResult.message}`);
    console.log(`New Budget: £${buyResult.updatedBuyerTeam!.budget.toLocaleString()}`);
    console.log(`Squad Size: ${buyResult.updatedBuyerTeam!.players.length}`);
  } else {
    console.log(`✗ ${buyResult.message}`);
  }

  return { playerTeam: buyResult.updatedBuyerTeam || playerTeam, listings: buyResult.updatedListings || listings };
}

/**
 * Selling Players
 *
 * Shows how to list your own players for sale.
 */
export function sellingPlayers() {
  console.log('\n=== Selling Players ===\n');

  const generator = new TeamGenerator();
  const teams = generator.generateLeague();
  const playerTeam = teams[0];

  const market = new TransferMarket();
  const currentWeek = 5;

  // Find a player to sell (lowest skill player)
  const playerToSell = [...playerTeam.players]
    .sort((a, b) => a.skill - b.skill)[0];

  // Calculate suggested value
  const suggestedValue = market.calculatePlayerValue(playerToSell);

  console.log(`Selling: ${playerToSell.name}`);
  console.log(`Position: ${playerToSell.position} | Age: ${playerToSell.age} | Skill: ${playerToSell.skill}`);
  console.log(`Suggested Value: £${suggestedValue.toLocaleString()}`);
  console.log(`Squad Size Before: ${playerTeam.players.length}`);

  // List player (asking for 120% of suggested value)
  const askingPrice = Math.round(suggestedValue * 1.2);

  console.log(`Listing for: £${askingPrice.toLocaleString()}\n`);

  const sellResult = market.sellPlayer(
    playerToSell,
    playerTeam,
    askingPrice,
    [],
    currentWeek
  );

  if (sellResult.success) {
    console.log(`✓ ${sellResult.message}`);
    console.log(`Squad Size After: ${sellResult.updatedTeam!.players.length}`);
    console.log(`Listing Created: Yes`);
  } else {
    console.log(`✗ ${sellResult.message}`);
  }

  return sellResult;
}

/**
 * Player Valuation Examples
 *
 * Shows how player valuations work based on different attributes.
 */
export function playerValuationExamples() {
  console.log('\n=== Player Valuation Examples ===\n');

  const market = new TransferMarket();

  // Create example players with different attributes
  const players: Player[] = [
    {
      id: '1',
      name: 'Young Talent',
      position: 'FWD',
      skill: 12,
      age: 20,
      wages: 3000,
      stats: {} as any,
      history: []
    },
    {
      id: '2',
      name: 'Peak Performer',
      position: 'MID',
      skill: 16,
      age: 27,
      wages: 8000,
      stats: {} as any,
      history: []
    },
    {
      id: '3',
      name: 'Experienced Veteran',
      position: 'DEF',
      skill: 14,
      age: 34,
      wages: 5000,
      stats: {} as any,
      history: []
    },
    {
      id: '4',
      name: 'Elite Striker',
      position: 'FWD',
      skill: 18,
      age: 25,
      wages: 12000,
      stats: {} as any,
      history: []
    },
    {
      id: '5',
      name: 'Backup Goalkeeper',
      position: 'GK',
      skill: 10,
      age: 29,
      wages: 2500,
      stats: {} as any,
      history: []
    }
  ];

  console.log('Player Valuations:\n');
  console.log('Name                    Pos  Age  Skill  Valuation');
  console.log('─'.repeat(60));

  players.forEach(player => {
    const value = market.calculatePlayerValue(player);
    const name = player.name.padEnd(20);
    const pos = player.position.padEnd(3);
    const age = player.age.toString().padStart(3);
    const skill = player.skill.toString().padStart(3);
    const valuation = `£${value.toLocaleString()}`.padStart(12);

    console.log(`${name} ${pos} ${age}   ${skill}   ${valuation}`);
  });

  console.log('\nValuation Factors:');
  console.log('- Skill: Exponential growth (higher skill = much higher value)');
  console.log('- Age: Peak at 25-28, decline after 32');
  console.log('- Position: Forwards (FWD) worth 10% more than average');
  console.log('- Position: Goalkeepers (GK) worth 10% less than average');

  return players.map(p => ({
    player: p,
    value: market.calculatePlayerValue(p)
  }));
}

/**
 * Transfer Window Management
 *
 * Shows how transfer windows work across the season.
 */
export function transferWindowManagement() {
  console.log('\n=== Transfer Window Management ===\n');

  const market = new TransferMarket();

  // Check all weeks in a season
  const importantWeeks = [
    { week: 1, phase: 'Pre-Season Start' },
    { week: 5, phase: 'Mid Pre-Season' },
    { week: 8, phase: 'Pre-Season End' },
    { week: 10, phase: 'Regular Season' },
    { week: 20, phase: 'Mid-Season' },
    { week: 28, phase: 'Winter Window Start' },
    { week: 30, phase: 'Mid Winter Window' },
    { week: 32, phase: 'Winter Window End' },
    { week: 40, phase: 'Late Season' },
    { week: 52, phase: 'Season End' }
  ];

  console.log('Transfer Window Status Across Season:\n');
  console.log('Week  Phase                 Window Open?');
  console.log('─'.repeat(50));

  importantWeeks.forEach(({ week, phase }) => {
    const isOpen = market.isTransferWindowOpen(week);
    const weekStr = week.toString().padStart(2);
    const phaseStr = phase.padEnd(20);
    const status = isOpen ? '✓ YES' : '✗ NO';

    console.log(`${weekStr}    ${phaseStr} ${status}`);
  });

  console.log('\nTransfer Windows:');
  console.log('1. Pre-Season Window: Weeks 1-8');
  console.log('2. Winter Window: Weeks 28-32');

  return importantWeeks.map(({ week }) => ({
    week,
    isOpen: market.isTransferWindowOpen(week)
  }));
}

/**
 * AI Transfer Activity Simulation
 *
 * Shows how AI teams buy and sell players automatically.
 */
export function aiTransferActivity() {
  console.log('\n=== AI Transfer Activity ===\n');

  const generator = new TeamGenerator();
  const teams = generator.generateLeague();
  const market = new TransferMarket();

  const currentWeek = 5;

  // Generate initial market
  let listings = market.generateMarket(teams.slice(0, 10), currentWeek, 15);

  console.log(`Initial Market Size: ${listings.length} players`);
  console.log(`Teams: ${teams.length}`);
  console.log('Simulating AI transfer activity...\n');

  // Simulate AI transfers
  const result = market.simulateAITransfers(teams, listings, currentWeek);

  console.log(`Final Market Size: ${result.updatedListings.length} players`);
  console.log(`Transfers Completed: ${listings.length - result.updatedListings.length}`);

  // Show which teams made transfers
  const originalSquadSizes = teams.map(t => t.players.length);
  const newSquadSizes = result.updatedTeams.map(t => t.players.length);

  console.log('\nSquad Size Changes:');

  result.updatedTeams.forEach((team, index) => {
    const original = originalSquadSizes[index];
    const current = newSquadSizes[index];
    const change = current - original;

    if (change !== 0) {
      const direction = change > 0 ? 'Bought' : 'Sold';
      console.log(`${team.name}: ${direction} ${Math.abs(change)} player(s) (${original} → ${current})`);
    }
  });

  return result;
}

/**
 * Custom Transfer Strategy
 *
 * Example of implementing a custom transfer strategy.
 */
export function customTransferStrategy() {
  console.log('\n=== Custom Transfer Strategy ===\n');

  const generator = new TeamGenerator();
  const teams = generator.generateLeague();
  const playerTeam = teams[0];
  const aiTeams = teams.slice(1);

  const market = new TransferMarket();
  const currentWeek = 5;

  // Generate market
  const listings = market.generateMarket(aiTeams, currentWeek, 20);

  // Custom Strategy: Buy young forwards with high potential
  const targetCriteria = {
    position: 'FWD' as const,
    maxAge: 23,
    minSkill: 10,
    maxPrice: 500000
  };

  console.log('Transfer Strategy: Young Forwards');
  console.log(`Max Age: ${targetCriteria.maxAge}`);
  console.log(`Min Skill: ${targetCriteria.minSkill}`);
  console.log(`Budget: £${targetCriteria.maxPrice.toLocaleString()}\n`);

  // Filter listings
  const targets = listings.filter(listing =>
    listing.player.position === targetCriteria.position &&
    listing.player.age <= targetCriteria.maxAge &&
    listing.player.skill >= targetCriteria.minSkill &&
    listing.askingPrice <= targetCriteria.maxPrice
  );

  console.log(`Matching Players: ${targets.length}\n`);

  if (targets.length > 0) {
    // Sort by value (skill/price ratio)
    const sorted = targets.sort((a, b) => {
      const valueA = a.player.skill / a.askingPrice;
      const valueB = b.player.skill / b.askingPrice;
      return valueB - valueA;
    });

    console.log('Top 3 Value Picks:\n');

    sorted.slice(0, 3).forEach((listing, index) => {
      const valueRatio = (listing.player.skill / listing.askingPrice * 1000000).toFixed(2);

      console.log(`${index + 1}. ${listing.player.name}`);
      console.log(`   Age: ${listing.player.age} | Skill: ${listing.player.skill}`);
      console.log(`   Price: £${listing.askingPrice.toLocaleString()}`);
      console.log(`   Value Ratio: ${valueRatio} skill per £1M`);
      console.log();
    });

    return sorted;
  } else {
    console.log('No players match criteria');
    return [];
  }
}

// Run examples if executed directly
if (require.main === module) {
  console.log('Football Director Engine - Transfer Market Examples\n');
  console.log('=' .repeat(70));

  basicTransferMarketUsage();
  sellingPlayers();
  playerValuationExamples();
  transferWindowManagement();
  aiTransferActivity();
  customTransferStrategy();
}
