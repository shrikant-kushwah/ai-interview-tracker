import Application from "../models/application.model.js";
import {
  buildColdEmailPrompt,
  buildChatSystemPrompt,
  buildFollowUpPrompt,
  buildInterviewQuestionsPrompt,
  buildResumeFeedbackPrompt,
} from "../utils/promptBuilder.js";
import { callAI, streamAI, streamChat } from "../services/ai.services.js";
import { PDFParse } from "pdf-parse";

export const generateColdEmail = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    const prompt = buildColdEmailPrompt(application);
    await streamAI(prompt, 0.7, res);
  } catch (error) {
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Streaming failed" })}\n\n`,
      );
      return res.end();
    }
    res.status(500).json({ message: error.message });
  }
};

export const generateFollowUp = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    const prompt = buildFollowUpPrompt(application);
    await streamAI(prompt, 0.6, res);
  } catch (error) {
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Streaming failed" })}\n\n`,
      );
      return res.end();
    }
    res.status(500).json({ message: error.message });
  }
};

export const generateQuestions = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    const prompt = buildInterviewQuestionsPrompt(application);
    await streamAI(prompt, 0.5, res);
  } catch (error) {
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Streaming failed" })}\n\n`,
      );
      return res.end();
    }
    res.status(500).json({ message: error.message });
  }
};

export const generateResumeFeedback = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    if (!jobDescription) {
      return res.status(400).json({
        message: "Job Description is required",
      });
    }

    // Extract text from PDF buffer
    const parser = new PDFParse({ data: file.buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        message:
          "Could not extract text from PDF. Make sure it's not a scanned image.",
      });
    }

    const prompt = buildResumeFeedbackPrompt(resumeText, jobDescription);
    const result = await callAI(prompt, 0.4);
    res.json({ success: true, result });
  } catch (error) {
    if (res.headersSent) {
      return res.end();
    }
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/chat
export const chat = async (req, res) => {
  try {
    const { messages, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const recentHistory = (messages || []).slice(-6);
    const systemPrompt = buildChatSystemPrompt();

    await streamChat(
      {
        systemPrompt,
        history: recentHistory,
        message,
      },
      0.7,
      res,
    );
  } catch (error) {
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Streaming failed" })}\n\n`,
      );
      return res.end();
    }
    res.status(500).json({ message: error.message });
  }
};
