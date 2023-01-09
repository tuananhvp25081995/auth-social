declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      username: string;
      role: string;
      refCode: string;
      level: number;
    };
  }
}
