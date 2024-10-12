import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createWorkspace, getWorkspace, updateWorkspace } from "../controllers/workspace.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/create-workspace").post(verifyJWT,
  upload.single("logo"), 
  createWorkspace);
router.route("/get-workspace").get(verifyJWT, getWorkspace);
router.route("/update-workspace").patch(verifyJWT, upload.single("logo"), updateWorkspace);

export default router;