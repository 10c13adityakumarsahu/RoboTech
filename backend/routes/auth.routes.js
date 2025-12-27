import express from "express";
import {
  login,
  logout,
  forgotPassword,
  requestChangePassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", protectAdmin, logout);

router.post("/forgot-password", forgotPassword);
router.post("/request-change-password", protectAdmin, requestChangePassword);

router.post("/reset-password/:token", resetPassword);

router.get("/check", protectAdmin, checkAuth);

export default router;
