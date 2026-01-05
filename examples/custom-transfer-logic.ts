/**
 * Custom Transfer Logic Examples
 *
 * This file demonstrates how to use the Football Director Engine
 * to implement custom transfer market logic.
 */

import { getModule } from '../libs/football-director-engine/src/lib/module-registry';
import {
  TransferMarket,
  TeamGenerator,
  FinanceEngine,
} from '../libs/football-director-engine/src/lib/module-keys';
import type {
  Team,
  Player,
  TransferListing,
} from '../libs/football-director-engine/src/lib/types';

/**
 * Example 1: Generate Transfer Market
 */
export function example1_GenerateTransferMarket() {
  console.log('=== Example 1: Generate Transfer Market ===\n');

  const transferMarket = getModule(TransferMarket);
  const teamGenerator = getModule(TeamGenerator);

  const teams = teamGenerator.generateTeams(20, 'Premier League');
  const playerTeam = teams[0];

  const listings = transferMarket.generateTransferListings(teams, playerTeam.name, 15);

  console.log(\`Generated \${listings.length} transfer listings\n\`);
  console.log('Top 10 Players Available:\n');
  console.log('Player                | Pos | Age | Rating | Price');
  console.log('-----------------------------------------------------------');

  listings.slice(0, 10).forEach(listing => {
    const name = listing.player.name.padEnd(20);
    const pos = listing.player.position.padEnd(3);
    const age = listing.player.age.toString().padStart(3);
    const rating = listing.player.rating.toString().padStart(6);
    const price = (\`£\${(listing.price / 1000000).toFixed(1)}M\`).padStart(8);
    console.log(\`\${name} | \${pos} | \${age} | \${rating} | \${price}\`);
  });

  return listings;
}

/**
 * Example 2: Buy and Sell Players
 */
export function example2_BuyAndSellPlayers() {
  console.log('\n=== Example 2: Buy and Sell Players ===\n');

  const transferMarket = getModule(TransferMarket);
  const teamGenerator = getModule(TeamGenerator);
  const financeEngine = getModule(FinanceEngine);

  const teams = teamGenerator.generateTeams(20, 'Premier League');
  const playerTeam = teams[0];
  const listings = transferMarket.generateTransferListings(teams, playerTeam.name, 15);

  let budget = 50000000; // £50M
  let currentWage = 1000000; // £1M per week
  const wageLimit = 2000000; // £2M per week

  console.log(\`Starting Budget: £\${(budget / 1000000).toFixed(1)}M\`);
  console.log(\`Current Wages: £\${(currentWage / 1000000).toFixed(2)}M/week\`);
  console.log(\`Wage Limit: £\${(wageLimit / 1000000).toFixed(1)}M/week\n\`);

  // Try to buy the best player we can afford
  const affordablePlayer = listings.find(l => l.price <= budget);

  if (affordablePlayer) {
    console.log(\`Attempting to buy: \${affordablePlayer.player.name} for £\${(affordablePlayer.price / 1000000).toFixed(1)}M\`);

    const buyResult = transferMarket.buyPlayer(
      affordablePlayer.player,
      affordablePlayer.price,
      budget,
      currentWage,
      wageLimit
    );

    if (buyResult.success) {
      budget = buyResult.newBudget;
      console.log(\`✓ Transfer successful! New budget: £\${(budget / 1000000).toFixed(1)}M\`);
    } else {
      console.log(\`✗ Transfer failed: \${buyResult.error}\`);
    }
  }

  // Sell a player
  const playerToSell = playerTeam.squad[0];
  const sellPrice = 5000000; // £5M

  console.log(\`\nSelling: \${playerToSell.name} for £\${(sellPrice / 1000000).toFixed(1)}M\`);

  const sellResult = transferMarket.sellPlayer(playerToSell, sellPrice, budget, currentWage);
  budget = sellResult.newBudget;

  console.log(\`✓ Player sold! New budget: £\${(budget / 1000000).toFixed(1)}M\`);
  console.log(\`New weekly wage: £\${(sellResult.newWage / 1000000).toFixed(2)}M\`);
}

// Run examples
if (require.main === module) {
  const { initializeEngine } = require('../libs/football-director-engine/src/lib/setup-modules');
  initializeEngine();

  example1_GenerateTransferMarket();
  example2_BuyAndSellPlayers();
}
