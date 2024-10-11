import { Router } from "express";
import { loginUser, logout } from "../controllers/auth.controller";

const router = Router();

router.route("/login").post(loginUser);
router.route("/logout").get(logout);

export default router;