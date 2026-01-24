// Child/Parent member types
export type MemberRole = 'child' | 'parent';
export type MemberColor = 'sky-blue' | 'light-green' | 'plum' | 'blue' | 'pink';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  color: MemberColor;
  emoji: string;
  totalStars: number;
  weeklyStars: number;
}

// Daily tracking
export interface DailyHabit {
  id: string;
  name: string;
  memberId: string;
  category: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  memberId: string;
}

// Rewards
export interface Reward {
  id: string;
  name: string;
  requiredStars: number;
  cost: number; // 0 for free
  category: 'child' | 'parent';
  description: string;
}

// Weekly Summary
export interface WeeklyData {
  memberId: string;
  week: string; // YYYY-Www
  completions: {
    [day: string]: {
      [habitId: string]: boolean;
    };
  };
  totalStars: number;
}

// App State
export interface AppState {
  currentUser: CurrentUser | null;
  isLoggedIn: boolean;
  viewMode: 'kids' | 'parents' | 'all';
  selectedDate: string; // YYYY-MM-DD
}

export interface CurrentUser {
  id: string;
  email: string;
  familyId: string;
}

// Habit definitions (defaults)
export const DEFAULT_CHILD_HABITS: Record<string, DailyHabit> = {
  brushing_morning: {
    id: 'brushing_morning',
    name: 'Brushing teeth (morning)',
    memberId: '',
    category: 'hygiene'
  },
  brushing_night: {
    id: 'brushing_night',
    name: 'Brushing teeth (night)',
    memberId: '',
    category: 'hygiene'
  },
  tidying: {
    id: 'tidying',
    name: 'Tidying up after themselves',
    memberId: '',
    category: 'chores'
  },
  homework: {
    id: 'homework',
    name: 'Homework/Reading',
    memberId: '',
    category: 'education'
  },
  kindness: {
    id: 'kindness',
    name: 'Being kind to siblings',
    memberId: '',
    category: 'behavior'
  },
  manners: {
    id: 'manners',
    name: 'Using good manners',
    memberId: '',
    category: 'behavior'
  }
};

export const DEFAULT_PARENT_HABITS: Record<string, DailyHabit> = {
  playing: {
    id: 'playing',
    name: 'Playing with us when asked',
    memberId: '',
    category: 'engagement'
  },
  morning: {
    id: 'morning',
    name: 'Not being grumpy in the morning',
    memberId: '',
    category: 'mood'
  },
  bedtime: {
    id: 'bedtime',
    name: 'Reading bedtime story with voices',
    memberId: '',
    category: 'routine'
  },
  meal: {
    id: 'meal',
    name: 'Making our favorite meal',
    memberId: '',
    category: 'food'
  },
  outing: {
    id: 'outing',
    name: 'Taking us somewhere fun',
    memberId: '',
    category: 'activity'
  }
};

export const CHILD_REWARDS: Reward[] = [
  {
    id: 'dinner',
    name: 'Choose dinner',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Pick what we eat for dinner'
  },
  {
    id: 'park',
    name: 'Park trip',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Family trip to the park'
  },
  {
    id: 'bike',
    name: 'Bike ride',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Family bike ride'
  },
  {
    id: 'game_night',
    name: 'Game night',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Family game night'
  },
  {
    id: 'bubble_play',
    name: 'Bubble play',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Bubble play session'
  },
  {
    id: 'nature_walk',
    name: 'Nature walk',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Nature walk adventure'
  },
  {
    id: 'blanket_fort',
    name: 'Blanket fort',
    requiredStars: 20,
    cost: 0,
    category: 'child',
    description: 'Build a blanket fort'
  },
  {
    id: 'picnic',
    name: 'Picnic (£3)',
    requiredStars: 22,
    cost: 3,
    category: 'child',
    description: 'Family picnic'
  },
  {
    id: 'movie',
    name: 'Movie choice',
    requiredStars: 25,
    cost: 0,
    category: 'child',
    description: 'Pick the movie to watch'
  },
  {
    id: 'bedtime',
    name: 'Extra 30 min bedtime',
    requiredStars: 25,
    cost: 0,
    category: 'child',
    description: 'Stay up 30 minutes later'
  },
  {
    id: 'crafts',
    name: 'Arts & crafts (£2)',
    requiredStars: 25,
    cost: 2,
    category: 'child',
    description: 'Arts and crafts supplies'
  },
  {
    id: 'water_balloons',
    name: 'Water balloons (£2)',
    requiredStars: 25,
    cost: 2,
    category: 'child',
    description: 'Water balloon fun'
  },
  {
    id: 'baking',
    name: 'Baking session (£3)',
    requiredStars: 28,
    cost: 3,
    category: 'child',
    description: 'Bake something yummy'
  },
  {
    id: 'library_icecream',
    name: 'Library + ice cream (£4)',
    requiredStars: 28,
    cost: 4,
    category: 'child',
    description: 'Library trip and ice cream'
  },
  {
    id: 'toy',
    name: 'Pound shop toy (£1)',
    requiredStars: 30,
    cost: 1,
    category: 'child',
    description: 'Choose a toy from the shop'
  }
];

export const PARENT_REWARDS: Reward[] = [
  {
    id: 'card',
    name: 'Kids make you a card/drawing',
    requiredStars: 15,
    cost: 0,
    category: 'parent',
    description: 'Beautiful artwork from the kids'
  },
  {
    id: 'tidy',
    name: 'Kids tidy living room',
    requiredStars: 20,
    cost: 0,
    category: 'parent',
    description: 'Get some peace and quiet'
  },
  {
    id: 'tv',
    name: 'Choose what to watch on TV',
    requiredStars: 20,
    cost: 0,
    category: 'parent',
    description: 'Pick the show or movie'
  },
  {
    id: 'chores',
    name: 'Kids do your chores for the day',
    requiredStars: 25,
    cost: 0,
    category: 'parent',
    description: 'Well-deserved break'
  },
  {
    id: 'breakfast',
    name: 'Breakfast in bed made by kids',
    requiredStars: 28,
    cost: 0,
    category: 'parent',
    description: 'Special breakfast treat'
  },
  {
    id: 'no_nagging',
    name: 'No nagging from kids for a day',
    requiredStars: 30,
    cost: 0,
    category: 'parent',
    description: 'Peaceful day without complaints'
  },
  {
    id: 'sleep_in',
    name: 'Sleep in on weekend',
    requiredStars: 30,
    cost: 0,
    category: 'parent',
    description: 'Extra sleep on Saturday or Sunday'
  }
];
