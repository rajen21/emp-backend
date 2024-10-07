import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { loginUser, logout } from "../controllers/auth.controller";


const router = Router();

router.route("/login").post(loginUser);
router.route("/logout").get(verifyJWT, logout);

export default router;