import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  fullname: string;
  password: string;
  role: string;
  experience: number;
  isActive: boolean;
  profilePhoto?: string;
  company?: string;
  address?: string;
  dob?: string;
  dept?: string;
  phone?: string;
  doj?: string;
  company_address?: string;
  workspaceId?: object;
  superAdminId?: object;
  workSpaceAdminId?:object;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ["employee", "workspace_admin", "super_admin"]
    },
    experience: {
      type: Number,
      required: true
    },
    profilePhoto: {
      type: String,
    },
    company: {
      type: String,
    },
    dob: {
      type: String,
    },
    dept: {
      type: String,
    },
    company_address: {
      type: String,
    },
    address: {
      type: String,
    },
    doj: {
      type: String,
    },
    workspaceId: {
      type: String,
      ref: "users",
    },
    workSpaceAdminId: {
      type: String,
      ref: "users"
    },
    superAdminId: {
      type: String,
      ref: "users",
    },
    isActive: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 15);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_SECRET_TOKEN as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
