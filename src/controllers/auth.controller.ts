import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { User } from "../models/user.model";
import { generateAccessAndRefreshToken } from "../utils/generateTokens";
import { Document } from "mongoose";
import ApiResponse from "../utils/ApiResponse";

interface IUser extends Document {
  _id: string;
  password?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
}

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if (!(username || email)) {
    // res.send(new ApiResponse(400, new ApiError(400, "Username or Email is required",)))
    throw new ApiError(400, "Username or Email is required");
    return;
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  }) as IUser | null;
  if (!user) {
    // res.send(new ApiResponse(404, new ApiError(404, "User does not exists")))
    throw new ApiError(404, "User does not exists");
    return;
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    // res.send(new ApiResponse(404, new ApiError(404, "Incorrect password")))
    throw new ApiError(401, "Incorrect password");
    return;
  }

  const data = await generateAccessAndRefreshToken(
    user._id
  );

  res
    .cookie('refreshToken', data.refreshToken, { httpOnly: true, sameSite: 'none', secure: true })
    .header('Authorization', data.accessToken)
    .json(new ApiResponse(200, null, "User logged in successfully"))
  return;
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res
    .cookie('refreshToken', null, { httpOnly: true, sameSite: 'none', secure: true })
    .header('Authorization', "")
    .json(new ApiResponse(200, null, "User logged out successfully"))
  return;
})