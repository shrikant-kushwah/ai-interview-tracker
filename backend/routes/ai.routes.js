import express from "express";
import {
    chat,
  generateColdEmail,
  generateFollowUp,
  generateQuestions,
  generateResumeFeedback,
} from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.use(protect);

router.post("/cold-email", generateColdEmail);
router.post("/followup", generateFollowUp);
router.post("/questions", generateQuestions);
router.post("/resume-feedback",  upload.single("resume"),generateResumeFeedback);
router.post("/chat", chat);

export default router;