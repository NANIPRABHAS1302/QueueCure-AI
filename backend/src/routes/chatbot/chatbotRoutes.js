import express from "express";
import { handleMessage, getFAQ } from "../../controllers/chatbot/chatbotController.js";

const router = express.Router();

// Public routes (anyone can chat with chatbot)
router.post("/message", handleMessage);
router.get("/faq", getFAQ);

export default router;
