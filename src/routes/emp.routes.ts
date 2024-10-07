import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { registerUser, getEmployees, getUser, updateEmployee } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register-user").post(
  upload.single("profilePhoto"),
  registerUser
);

router.route("/get-employees").get(verifyJWT, getEmployees);
router.route("/get-user-details").get(verifyJWT, getUser);
router.route("/update-employee").patch(verifyJWT, updateEmployee);

export default router;