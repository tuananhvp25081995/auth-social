export interface AuthTokenPayload {
  sub: number;
  email: string;
  role: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MASTER_ADMIN = 'master_admin',
}
