import { MathOperation } from './challenge.model';

/**
 * World region for grouping locations
 */
export type WorldRegion = 'africa' | 'asia' | 'europe' | 'americas' | 'oceania';

/**
 * A location on the world map that contains challenges
 */
export interface Location {
  id: string;
  name: string;
  region: WorldRegion;
  description: string;

  // Visual assets
  backgroundImage: string;
  thumbnailImage: string;
  iconImage: string;

  // Challenge configuration
  recommendedLevel: number;
  operations: MathOperation[];

  // Rewards
  stampId: string;
  artifactId: string;
  xpReward: number;

  // Unlock requirements
  requiredStamps: number; // Number of stamps needed to unlock

  // Pet unlock (if any)
  unlocksPetId?: string;
}

/**
 * Stamp tier based on performance
 */
export type StampTier = 'gold' | 'silver' | 'bronze' | 'none';

/**
 * Progress for a specific location
 */
export interface LocationProgress {
  locationId: string;
  completed: boolean;
  bestScore: number;
  bestTime: number;
  bestStampTier: StampTier;
  attemptsCount: number;
  lastAttemptAt?: Date;
  stampEarned: boolean;
  artifactEarned: boolean;
}

/**
 * Calculate stamp tier based on score and time
 * @param score - Score out of 100
 * @param avgTimePerProblemMs - Average time per problem in milliseconds
 */
export function calculateStampTier(
  score: number,
  avgTimePerProblemMs: number
): StampTier {
  // Time thresholds (in ms per problem)
  const fastTime = 5000;   // Under 5s per problem = fast
  const okTime = 10000;    // Under 10s per problem = ok

  // Gold: 90+ score AND fast time
  if (score >= 90 && avgTimePerProblemMs <= fastTime) {
    return 'gold';
  }

  // Silver: 70+ score AND ok time, OR 90+ with slower time
  if ((score >= 70 && avgTimePerProblemMs <= okTime) || score >= 90) {
    return 'silver';
  }

  // Bronze: 50+ score (completion)
  if (score >= 50) {
    return 'bronze';
  }

  return 'none';
}

/**
 * Get XP multiplier for stamp tier
 */
export function getStampTierMultiplier(tier: StampTier): number {
  switch (tier) {
    case 'gold': return 1.5;
    case 'silver': return 1.2;
    case 'bronze': return 1.0;
    case 'none': return 0.5;
  }
}

/**
 * Get emoji for stamp tier
 */
export function getStampTierEmoji(tier: StampTier): string {
  switch (tier) {
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    case 'none': return '📋';
  }
}

/**
 * Initial locations for MVP
 */
export const MVP_LOCATIONS: Location[] = [
  {
    id: 'egypt-pyramids',
    name: 'Egyptian Pyramids',
    region: 'africa',
    description: 'Crack the ancient codes of the pharaohs!',
    backgroundImage: 'assets/images/locations/egypt-pyramids.png',
    thumbnailImage: 'assets/images/locations/egypt-pyramids-thumb.png',
    iconImage: 'assets/images/locations/egypt-pyramids-icon.png',
    recommendedLevel: 1,
    operations: ['addition'],
    stampId: 'stamp-egypt',
    artifactId: 'artifact-scarab',
    xpReward: 100,
    requiredStamps: 0,
  },
  {
    id: 'amazon-rainforest',
    name: 'Amazon Rainforest',
    region: 'americas',
    description: 'Decode the secrets of the jungle!',
    backgroundImage: 'assets/images/locations/amazon-rainforest.png',
    thumbnailImage: 'assets/images/locations/amazon-rainforest-thumb.png',
    iconImage: 'assets/images/locations/amazon-rainforest-icon.png',
    recommendedLevel: 2,
    operations: ['addition', 'subtraction'],
    stampId: 'stamp-amazon',
    artifactId: 'artifact-emerald',
    xpReward: 150,
    requiredStamps: 1,
  },
  {
    id: 'himalaya-mountains',
    name: 'Himalaya Mountains',
    region: 'asia',
    description: 'Solve puzzles at the roof of the world!',
    backgroundImage: 'assets/images/locations/himalaya-mountains.png',
    thumbnailImage: 'assets/images/locations/himalaya-mountains-thumb.png',
    iconImage: 'assets/images/locations/himalaya-mountains-icon.png',
    recommendedLevel: 3,
    operations: ['addition', 'subtraction'],
    stampId: 'stamp-himalaya',
    artifactId: 'artifact-crystal',
    xpReward: 200,
    requiredStamps: 2,
    unlocksPetId: 'eagle',
  },
  {
    id: 'african-savanna',
    name: 'African Savanna',
    region: 'africa',
    description: 'Race against time on the plains!',
    backgroundImage: 'assets/images/locations/african-savanna.png',
    thumbnailImage: 'assets/images/locations/african-savanna-thumb.png',
    iconImage: 'assets/images/locations/african-savanna-icon.png',
    recommendedLevel: 4,
    operations: ['subtraction', 'multiplication'],
    stampId: 'stamp-savanna',
    artifactId: 'artifact-mask',
    xpReward: 250,
    requiredStamps: 3,
    unlocksPetId: 'cheetah',
  },
  {
    id: 'pacific-islands',
    name: 'Pacific Islands',
    region: 'oceania',
    description: 'Dive into underwater code mysteries!',
    backgroundImage: 'assets/images/locations/pacific-islands.png',
    thumbnailImage: 'assets/images/locations/pacific-islands-thumb.png',
    iconImage: 'assets/images/locations/pacific-islands-icon.png',
    recommendedLevel: 5,
    operations: ['multiplication'],
    stampId: 'stamp-pacific',
    artifactId: 'artifact-pearl',
    xpReward: 300,
    requiredStamps: 4,
    unlocksPetId: 'shark',
  },
];
