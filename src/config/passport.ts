import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // console.log('req.user: ', req.user)
  if (req.isAuthenticated()) {
    // console.log('Authorized Access!')
    return next();
  }
  res.status(403).json({ message: 'Login Expired. Please login again!' })
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  const user = req.user as IUser;
  // if (find(user.tokens, { kind: provider })) {
  //   next();
  // } else {
  //   res.redirect(`/auth/${provider}`);
  // }
};