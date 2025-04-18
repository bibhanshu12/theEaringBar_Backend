import type { Request, Response, NextFunction } from 'express';

export const catchAsync = <
  T extends (req: Request, res: Response, next: NextFunction) => any
>(
  fn: T
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
