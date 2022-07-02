import crypto from "crypto";
import { Document, Schema, model, Model } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
  updatedAt: Date;
  forgotPassword: boolean,
  forgotPasswordVerificationCode: string,
  forgotPasswordVerificationExpirationDate: Date,
  setPassword: (password: string) => void,
  validPassword: (password: string) => boolean
}

export const userSchema: Schema<IUser> = new Schema<IUser>({
  id: String,
  email: { type: String, required: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  forgotPassword: { type: Boolean, required: false, default: false },
  forgotPasswordVerificationCode: { type: String, required: false },
  forgotPasswordVerificationExpirationDate: { type: Date, required: false },
});

userSchema.methods.setPassword = function(password: string) {
  this.passwordSalt = crypto.randomBytes(16).toString("hex");
  this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 1000, 64, "sha512").toString("hex"); 
};
userSchema.methods.validPassword = function(password: string) { 
  const passwordHash = crypto.pbkdf2Sync(password,  
  this.passwordSalt, 1000, 64, "sha512").toString("hex"); 
  return this.passwordHash === passwordHash; 
};


export const User: Model<IUser> = model<IUser>("User", userSchema);
