import { Response, Request, NextFunction } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { User } from "../models/user.model";
import ApiResponse from "../utils/ApiResponse";

interface CustomRequest extends Request {
  user?: any;
}
interface CustomJwtPayload extends JwtPayload {
  _id: string;
}

export const verifyJWT = async (req:CustomRequest, res:Response, next:NextFunction): Promise<void> => {
  const accessToken = req.headers['authorization'];
  const refreshToken = req.cookies['refreshToken'];

  try {
    if (!accessToken && !refreshToken) {
      throw new ApiError(401,"Access Denied. No token provided.");
    }
    const secretAccessKey = process.env.ACCESS_SECRET_TOKEN;
    if (accessToken && secretAccessKey) {
      const decoded = jwt.verify(accessToken, secretAccessKey) as CustomJwtPayload;
      console.log("ccc",decoded)
      const user = await User.findById(decoded?._id).select("-password");
      if (!user) {
        throw new ApiError(401, "Invalid access token");
      }
      req.user = user;
      
      next();
    }
  } catch (err) {
    const error = err as Error;
    
    try {
      if (!refreshToken) {
        throw new ApiError(401,"Access Denied. No refresh token provided.",[error.message]);
      }
      const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET;
      let decoded;
      let accessToken;
      if (secretRefreshKey) {
        decoded = jwt.verify(refreshToken, secretRefreshKey) as CustomJwtPayload;

        const secretAccessKey = process.env.ACCESS_SECRET_TOKEN;
        const user = await User.findById(decoded?._id).select("-password");
        if (!user) {
          throw new ApiError(401, "Invalid refresh token");
        }
        if (secretAccessKey) {
          accessToken = jwt.sign({ user: user }, secretAccessKey, { expiresIn: '1h' });
        }
        req.user = user;
      }
      res
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'none', secure: true })
        .header('Authorization', accessToken)
      next();
        // .send(decoded?.user);
    } catch (err) {
      
      const error = err as Error;
      // console.log("err=> ", error.errors);
      res.status(400).json(new ApiResponse(400,null,error.message,error));
      throw new ApiError(400, "Invalid token.",[error.message]);
    }
  }
};

