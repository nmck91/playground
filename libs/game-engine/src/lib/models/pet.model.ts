/**
 * Pet companion that assists the player
 */
export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  level: number;
  xp: number;

  // Visual
  spriteSheet: string;

  // Abilities (for future use)
  abilities: PetAbility[];
}

/**
 * Available pet species
 */
export type PetSpecies = 'dog' | 'cheetah' | 'eagle' | 'shark';

/**
 * Pet ability (future feature)
 */
export interface PetAbility {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
}

/**
 * Pet definitions for the game
 */
export const PET_DEFINITIONS: Record<PetSpecies, PetDefinition> = {
  dog: {
    species: 'dog',
    displayName: 'Scout',
    description: 'A loyal companion who cheers you on!',
    spriteSheet: 'assets/images/pets/dog.png',
    unlockMethod: 'starter',
    region: null,
  },
  cheetah: {
    species: 'cheetah',
    displayName: 'Flash',
    description: 'The fastest helper on the savanna!',
    spriteSheet: 'assets/images/pets/cheetah.png',
    unlockMethod: 'location',
    region: 'africa',
  },
  eagle: {
    species: 'eagle',
    displayName: 'Sky',
    description: 'Soars high to spot the answers!',
    spriteSheet: 'assets/images/pets/eagle.png',
    unlockMethod: 'location',
    region: 'asia',
  },
  shark: {
    species: 'shark',
    displayName: 'Finn',
    description: 'Dives deep into math mysteries!',
    spriteSheet: 'assets/images/pets/shark.png',
    unlockMethod: 'location',
    region: 'oceania',
  },
};

/**
 * Definition for creating pets
 */
export interface PetDefinition {
  species: PetSpecies;
  displayName: string;
  description: string;
  spriteSheet: string;
  unlockMethod: 'starter' | 'location' | 'achievement';
  region: string | null;
}

/**
 * Create a new pet instance
 */
export function createPet(species: PetSpecies, customName?: string): Pet {
  const definition = PET_DEFINITIONS[species];
  return {
    id: `${species}-${Date.now()}`,
    name: customName || definition.displayName,
    species,
    level: 1,
    xp: 0,
    spriteSheet: definition.spriteSheet,
    abilities: [],
  };
}
