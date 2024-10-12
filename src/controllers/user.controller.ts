import { Response, Request, NextFunction } from "express";
import { Document } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { IUser, User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";

interface CustomeRequest extends Request {
  user?: Document;
}

export const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullname, email, username, password } = req.body;
    if (
      [fullname, email, username, password].some((val) => val?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existedUser) {
      throw new ApiError(409, "User already exists");
    }

    let profilePhoto;
    if (req.file) {
      profilePhoto = await uploadOnCloudinary(req.file.path);
    }
    const data = {
      ...req.body,
      fullname,
      profilePhoto: profilePhoto?.url ?? "",
      email,
      password,
      username: username.toLowerCase(),
    };
    const user = await User.create(data);

    if (!user) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }
    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
    return;
  }
);

export const getUsers = asyncHandler(
  async (req: CustomeRequest, res: Response): Promise<void> => {
    // console.log("reqq", req.headers.authorization, "\n\n")
    // console.log("aaa", req.cookies.refreshToken)
    const { page = "1", limit = "10", _id, ...qr } = req.query;
    let query;

    if (_id) {
      query = {
        $and: [
          {_id},
          {
            $or: [
              { workSpaceAdminId: req?.user?._id?.toString() },
              { superAdminId: req?.user?._id?.toString() },
            ]
          }
        ],
        ...qr
      }
    } else {
      query = {
        $or: [
          { workSpaceAdminId: req?.user?._id?.toString() },
          { superAdminId: req?.user?._id?.toString() },
        ],
        ...qr,
      };
    }

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;
    
    const employees = await User.find(query, { password: 0 })
    .skip(skip)
    .limit(limitNumber);

    const empCount = await User.countDocuments(query);
    const hasMore = empCount > skip + employees.length;

    const data = {
      employees,
      pagination: {
        totalUsers: employees.length,
        totalPages: Math.ceil(employees.length / limitNumber),
        currentPage: page,
        pageSize: limit,
        hasMore
      },
    };
    res
      .status(200)
      .json(new ApiResponse(200, data, "Successfully fetched employees"));
    return;
  }
);

export const getUser = asyncHandler(
  async (req: CustomeRequest, res: Response) => {
    const user = await User.findById(req.user?._id, { password: 0 });
    res
      .status(200)
      .json(new ApiResponse(200, user, "Successfully fetched user."));
    return;
  }
);

export const updateEmployee = asyncHandler(
  async (req: CustomeRequest, res: Response) => {
    const { password, ...body } = req.body;
    const { _id } = req.query;
    const user = await User.findById(_id);
    if (user) {
      if (password) {
        user.password = password;
      }
      if (body.username) {
        user.username = body.username;
      }
      if (body.email) {
        user.email = body.email;
      }
      if (body.fullname) {
        user.fullname = body.fullname;
      }
      if (body.phone) {
        user.phone = body.phone;
      }
      if (body.role) {
        user.role = body.role;
      }
      if (body.experience) {
        user.experience = body.experience;
      }
      if (req.file) {
        const photo = await uploadOnCloudinary(req.file.path);
        user.profilePhoto = photo?.url;
      }
      if (body.company) {
        user.company = body.company;
      }
      if (body.dob) {
        user.dob = body.dob;
      }
      if (body.dept) {
        user.dept = body.dept;
      }
      if (body.company_address) {
        user.company_address = body.company_address;
      }
      if (body.address) {
        user.address = body.address;
      }
      if (body.doj) {
        user.doj = body.doj;
      }
      if (body.workspaceId) {
        user.workspaceId = body.workspaceId;
      }
      if (body.workSpaceAdminId) {
        user.workSpaceAdminId = body.workSpaceAdminId;
      }
      if (body.superAdminId) {
        user.superAdminId = body.superAdminId;
      }
      if (body.isActive) {
        user.isActive = body.isActive;
      }
    }
    const savedUser = await user?.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, savedUser, "Successfully updated user."));
    return;
  }
);
