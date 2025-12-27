import express from "express";
import db from "../db.js";
import {
  getAdminTeam,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/team.controller.js";
import { uploadTeamImage } from "../middleware/uploadTeamImage.js";
import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ================= ADMIN PROTECTION ================= */
router.use(protectAdmin);

/* ================= TEAM GROUPS (IMPORTANT) ================= */
router.get("/team-groups", async (req, res) => {
  const { rows } = await db.query(
    "SELECT id, name FROM team_groups ORDER BY name"
  );
  res.json(rows);
});

/* ================= TEAM CRUD ================= */
router.get("/", getAdminTeam);

router.post("/member", (req, res, next) => {
  uploadTeamImage.single("image")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Image too large. Max size allowed is 400 KB.",
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createMember);
router.put("/member/:id", (req, res, next) => {
  uploadTeamImage.single("image")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Image too large. Max size allowed is 800 KB.",
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateMember);


router.delete("/member/:id", deleteMember);

export default router;
