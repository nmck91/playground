export interface SystemTag {
  id: string;
  name: string;
  sort_order: number;
}

export interface UserTag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// Unified type for UI display
export type Tag = (SystemTag | UserTag) & { is_system: boolean };

export interface CreateUserTagInput {
  name: string;
}
