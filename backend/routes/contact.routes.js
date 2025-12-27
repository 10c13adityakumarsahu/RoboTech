import express from "express";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

console.log("📦 contact.routes.js loaded");

router.post("/", submitContactForm);

export default router;
