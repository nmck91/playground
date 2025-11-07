export interface FamilyMember {
  name: string;
  color: string;
  className: string;
}

export interface FamilyMemberDB {
  id: string;
  name: string;
  display_order: number;
  created_at?: string;
}
