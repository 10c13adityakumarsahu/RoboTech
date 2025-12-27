import express from "express";
import { protectAdmin } from "../middleware/auth.middleware.js";
import { uploadAnnouncementFiles } from "../middleware/uploadAnnouncementFiles.js";
import { validateAnnouncement } from "../middleware/validateAnnouncement.js";
import * as ctrl from "../controllers/announcement.controller.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", ctrl.listAdminAnnouncements);
router.post("/", validateAnnouncement, ctrl.createAnnouncement);
router.post("/:id/publish", ctrl.publishAnnouncement);
router.put("/:id", validateAnnouncement, ctrl.updateAnnouncement);
router.post("/:id/archive", ctrl.archiveAnnouncement);
router.delete("/:id", ctrl.deleteAnnouncement);
router.post("/:id/files", uploadAnnouncementFiles.array("files"), ctrl.uploadAnnouncementFilesHandler);

export default router;
