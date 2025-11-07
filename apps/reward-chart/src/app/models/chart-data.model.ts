import { FamilyMember } from './family-member.model';
import { Reward } from './reward.model';

export interface StarCompletion {
  member_id: string;
  habit_index: number;
  day_index: number;
  is_completed: boolean;
  updated_at?: string;
}

export interface StarsData {
  [personIndex: number]: {
    [habitIndex: number]: boolean[];
  };
}

export interface ChartData {
  children: FamilyMember[];
  parents: FamilyMember[];
  kidsHabits: string[];
  parentHabits: string[];
  days: string[];
  kidsRewards: Reward[];
  parentsRewards: Reward[];
  kidsStars: StarsData;
  parentsStars: StarsData;
  parentsVisible: boolean;
}
