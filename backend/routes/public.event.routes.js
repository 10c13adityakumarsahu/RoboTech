import express from "express";
import {
  getPublicEvents,
  getPublicEventById
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", getPublicEvents);
router.get("/:id", getPublicEventById);

export default router;
