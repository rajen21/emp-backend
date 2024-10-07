import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};
