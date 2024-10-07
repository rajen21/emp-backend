import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "./asyncHandler";
import { User } from "../models/user.model";

export const exportUsersToCSV = asyncHandler(async (qr, ) => {
  const user = User.find(qr,{password: 0});
  const fields = ['username', 'email', 'fullname'];
  
})