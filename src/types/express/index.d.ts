declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      publicAddress: string;
      role: string;
      refCode: string;
      level: number;
    };
  }
}
