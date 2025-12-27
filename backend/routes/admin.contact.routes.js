import express from "express";
import { protectAdmin } from "../middleware/auth.middleware.js";
import {
  getContactMessages,
  markRead,
  markReplied,
  deleteMessage,
} from "../controllers/admin.contact.controller.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getContactMessages);
router.patch("/:id/read", markRead);
router.patch("/:id/replied", markReplied);
router.delete("/:id", deleteMessage);

export default router;
