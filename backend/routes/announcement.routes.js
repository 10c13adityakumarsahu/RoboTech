import express from "express";
import {
  listPublicAnnouncements,
  getPublicAnnouncement
} from "../controllers/announcement.controller.js";
import { downloadAnnouncementFile } from "../controllers/announcementFile.controller.js";

const router = express.Router();

router.get("/", listPublicAnnouncements);

router.get("/files/:fileId", downloadAnnouncementFile);
router.get("/:id", getPublicAnnouncement);

export default router;
