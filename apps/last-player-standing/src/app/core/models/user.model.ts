export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
