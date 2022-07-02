import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { User, IUser } from "../models/User";

export const checkIsAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ message: "authorized" });
    return next();
  }
  res.status(403).json({ message: "unauthorized" });
};

export const passportLoginCallback = (req: Request, res: Response, next: any) => {
  passport.authenticate("local", function (err, user: IUser, info) {

    if (err) {
      console.log("err: ", err);
      return res.status(500).send(err);
    }
    // console.log('user: ', user)
    // console.log('info: ', info)
    // return res.status(200).send({...info})
    if (user) {
      req.logIn(user, function (err) { // I added req.login() here and now deserializeUser is being called and req.user is being set correctly.
        if (err) {
          return res.status(401).json(err);
        } else {
          user.passwordHash = "";
          user.passwordSalt = "";
          user.forgotPassword = false;
          return res.status(200).json({ message: "Login Success", user });
        }
      });
    } else {
      res.status(400).json({ message: "Invalid email or password." });
    }
    // handle succes or failure

  })(req, res, next);
};

export const authUser = async (email: string, password: string, done: any) => {
  console.log(`login email: ${email}`);
  console.log(`login password: ${password}`);

  try {
    const _user = await User.findOne({ email: email });
    console.log("_user: ", _user);
    if (_user && _user.validPassword(password)) {
      console.log("password is valid.");
      return done(null, _user);
    }

    return done(null, false);
    // return done(null, false, { message: 'Email or Password didn\'t match' })
  } catch (error) {
    return done(error, false);
    // return done(error, false, { message: 'Something wrong. Please try again!' })
  }

};

export const logout = function (req: Request, res: Response, next: NextFunction) {
  req.logout({ keepSessionInfo: false }, (err) => {
    console.log('error: ', err)
  })
  req.session.destroy(function (err) {
    if (err) throw err;
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout Successfull!" });
  });
};

