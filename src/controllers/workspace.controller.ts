import { Request, Response } from "express";
import { Document } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Workspace } from "../models/workspace.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../models/user.model";

interface CustomeRequest extends Request {
  user?: Document
}

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const { name, owner, admin, isActive = false, email, phone, address } = req.body;
  
  if ([name, owner, admin, email, phone, address].some((val) => !val?.trim())) {
    throw new ApiError(400, "All fields are required");
  }
  const [isValidAdmin] = await User.find({ _id: admin, role: "super_admin" }, { password: 0 });
  const [isValidOwner] = await User.find({ _id: owner, role: "workspace_admin" });
  if (!isValidAdmin) {
    throw new ApiError(400, "Admin is not valid");
  }
  if (!isValidOwner) {
    throw new ApiError(400, "Workspace admin is not valid.");
  }

  let logo;
  if (req.file) {
    logo = await uploadOnCloudinary(req.file.path);
  }

  const data = {
    ...req.body,
    name,
    owner,
    admin,
    isActive,
    logo: logo?.url ?? "",
    email,
    phone,
    address
  };
  const workspace = await Workspace.create(data);

  if (!workspace) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  res.status(201).json(new ApiResponse(201, workspace, "Successfully created workspace."));
  return;
});

export const getWorkspace = asyncHandler(async (req: CustomeRequest, res: Response) => {
  const query = {$or: [{owner: req?.user?._id}, {admin: req?.user?._id}],...req.query};
  const workspace = await Workspace.find(query);
  res.status(200).json(new ApiResponse(200,workspace, "Successfully fetched Workspace data."));
  return;
});


export const updateWorkspace = asyncHandler(async (req: CustomeRequest, res: Response) => {
  const query = {
    $or: [
      { owner: req?.user?._id },
      { admin: req?.user?._id }
    ],
    ...req.query
  };
  const data = {
    $set: {
      ...req.body
    }
  }
  const updatedWorkspace = await Workspace.updateOne(query, data);
  res.status(200).json(new ApiResponse(200, updatedWorkspace, "Successfully updated workspace."))
});
