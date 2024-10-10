import { Response, Request, NextFunction } from "express";
import { Document } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";

interface CustomeRequest extends Request {
  user?: Document
}

export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { fullname, email, username, password } = req.body;
  if ([fullname, email, username, password].some((val) => val?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  let profilePhotoLocalPath: string | undefined;
  let profilePhoto;
  if (
    req.file
  ) {
    profilePhotoLocalPath = req.file.path;
    if (profilePhotoLocalPath) {
      profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
    }
  }
  const data = {
    ...req.body,
    fullname,
    profilePhoto: profilePhoto?.url ?? "",
    email,
    password,
    username: username.toLowerCase()
  };
  const user = await User.create(data);

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
  return;
});


export const getUsers = asyncHandler(async (req: CustomeRequest, res: Response): Promise<void> => {
  // console.log("reqq", req.headers.authorization, "\n\n")
  // console.log("aaa", req.cookies.refreshToken)
  const {page="1", limit="10", ...qr} = req.query;
  const query = {
    $or: [
      { workSpaceAdminId: req?.user?._id }, 
      { superAdminId: req?.user?._id }
    ], 
    ...qr
  };
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  const skip = (pageNumber - 1) * limitNumber;


  const employees = await User.find(query, { password: 0 }).skip(skip).limit(limitNumber);
  const data = {
    employees,
    pagination: {
      totalUsers: employees.length,
      totalPages: Math.ceil(employees.length / limitNumber),
      currentPage: page,
      pageSize: limit,
    },
  }
  res.status(200).json(new ApiResponse(200, data, "Successfully fetched employees"));
  return;
});

export const getUser = asyncHandler(async (req: CustomeRequest, res: Response) => {
  const user = await User.findById(req.user?._id, { password: 0 });
  res.status(200).json(new ApiResponse(200, user, "Successfully fetched user."));
  return
});

export const updateEmployee = asyncHandler(async (req:CustomeRequest, res: Response) => {
  const query = {
    $or: [
      { _id: req?.user?._id },
      {workSpaceAdminId: req?.user?._id},
      {superAdminId: req?.user?.id}
    ],
    ...req.query,
  };
  const data = {$set: {...req.body}};
  const updatedUser = await User.updateOne(query,data);
  res.status(200).json(new ApiResponse(200, updatedUser, "Successfully updated user."));
  return;
});