import express, { Request, Response, RequestHandler } from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import { Strategy as LocalStrategy } from 'passport-local'
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

// Controllers (route handlers)
import { authUser } from "./controllers/auth";
// import * as homeController from "./controllers/home";
// import * as userController from "./controllers/user";
// import * as apiController from "./controllers/api";
// import * as contactController from "./controllers/contact";

//Routes 
import authRouter from './routes/auth'
import userRouter from './routes/user'

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import { IUser, User } from "./models/User";

// Create Express server
const app = express();

// Connect to MongoDB
mongoose.Promise = bluebird;
const MONGODB_URI_LOCAL = MONGODB_URI;
const mongooseOptions: any = {
  useNewUrlParser: true, useUnifiedTopology: true
};


mongoose.connect(MONGODB_URI_LOCAL, mongooseOptions,
  
).then((value) => {
  console.log('Connected Version: ', value.version)
  console.log('MongoDB connected successfully!\n')
  console.info("Press CTRL-C to stop\n-----------------------------------------------------------------\n\n");
},).catch(err => {
  console.log(`MongoDB connection error. Please make sure MongoDB is running. Error: ${err}`);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use((req, res, next) => {
  const allowedOrigins = ['*', 'http://127.0.0.1:9001'];
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return next();
})
app.use(compression());
app.use(bodyParser.json() as RequestHandler);
app.use(express.urlencoded({ extended: true }) as RequestHandler);

app.use(session({
  secret: (SESSION_SECRET || ""),
  cookie: {
    maxAge: 7200000,
    httpOnly: true,
    secure: false, //@20210122
  },
  store: new MongoStore({
    mongoUrl: MONGODB_URI_LOCAL,
    ttl: 7200000,
    collectionName: 'sessions'
  }),
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);


app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

passport.use(new LocalStrategy({
  usernameField: 'email',
}, authUser))


passport.serializeUser(function (user: any, done) {
  console.log('serialize user: ')
  done(null, user._id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err: any, user: IUser) {
    if (err) {
      console.log("Error deserializing user: ", err);
    }
    done(err, user);
  });
});

/**
 * Primary app routes.
 */

app.use('/api/auth', authRouter)
app.use('/api/user', passportConfig.isAuthenticated, userRouter)


export default app;
