import express from "express";
import {
  getTeamYears,
  getPublicTeam,
} from "../controllers/team.controller.js";

const router = express.Router();

router.get("/years", getTeamYears);
router.get("/", getPublicTeam);

export default router;
