import express from "express";
import {
  getApplication,
  getDashboardStats,
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  addInterview,
} from "../controllers/application.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); 
router.get("/stats", getDashboardStats);
router.get("/", getApplications);
router.post("/", createApplication);
router.get("/:id", getApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.post("/:id/interviews", addInterview);

export default router;
