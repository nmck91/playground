import { SystemTag, UserTag } from './tag.model';

export interface Drill {
  id: string;
  user_id: string;
  url: string;
  title: string;
  notes?: string;
  created_at: string;
  system_tags?: SystemTag[];
  user_tags?: UserTag[];
}

export interface CreateDrillInput {
  url: string;
  title: string;
  notes?: string;
  systemTagIds: string[];
  userTagIds: string[];
}

export interface UpdateDrillInput extends CreateDrillInput {
  id: string;
}
