import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
// import ApiError from "../utils/ApiError";
import { User } from "../models/user.model";
import ApiResponse from "../utils/ApiResponse";

interface CustomRequest extends Request {
  user?: any;
}
interface CustomJwtPayload extends JwtPayload {
  _id: string;
}

export const verifyJWT = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const accessToken = req.headers['authorization'];
  const refreshToken = req.cookies['refreshToken'];
  console.log("check token::::", accessToken, refreshToken);
  
  try {
    if (!accessToken && !refreshToken) {
      res.status(401).json(new ApiResponse(401, null, "Access Denied. No token provided."));
      return;
      // throw new ApiError(401,"Access Denied. No token provided.");
    }
    const secretAccessKey = process.env.ACCESS_SECRET_TOKEN;
    console.log("checkk secretAccessKey", secretAccessKey);
    
    if (accessToken && secretAccessKey) {
      console.log("goes into verfiy token");
      
      const decoded = jwt.verify(accessToken, secretAccessKey) as CustomJwtPayload;
      console.log("ccc", decoded)
      const user = await User.findById(decoded?._id).select("-password");
      if (!user) {
        // throw new ApiError(401, "Invalid access token");
        res.status(401).json(new ApiResponse(401, null, "Invalid access token"));
        return;
      }
      req.user = user;
      console.log("gooing next");
      
      next();
    }
  } catch (err) {
    const error = err as Error;
    console.log("come into the error", err);
    
    try {
      if (!refreshToken) {
        // throw new ApiError(401, "Access Denied. No refresh token provided.", [error.message]);
        res.status(401).json(new ApiResponse(401, null, "Access Denied. No refresh token provided",error));
        return;
      }
      const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET;
      let decoded;
      let accessToken;
      console.log("check secret", secretRefreshKey);
      
      if (secretRefreshKey) {
        decoded = jwt.verify(refreshToken, secretRefreshKey) as CustomJwtPayload;

        const secretAccessKey = process.env.ACCESS_SECRET_TOKEN;
        const user = await User.findById(decoded?._id).select("-password");
        if (!user) {
          // throw new ApiError(401, "Invalid refresh token");
          res.status(401).json(new ApiResponse(401, null, "Invalid refresh token", error));
          return;
        }
        if (secretAccessKey) {
          accessToken = jwt.sign({ user: user }, secretAccessKey, { expiresIn: '1h' });
        }
        req.user = user;
      }
      console.log("sending tokens:::");
      
      res
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'none', secure: true })
        .header('Authorization', accessToken)
      next();
    } catch (err) {
      const error = err as Error;
      console.log("err=> tokens:::", error);
      res.status(500).json(new ApiResponse(500, null, error.message, error));
      return;
      // throw new ApiError(400, "Invalid token.",[error.message]);
    }
  }
};

