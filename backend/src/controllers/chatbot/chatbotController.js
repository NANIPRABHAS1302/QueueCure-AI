import * as chatbotService from "../../services/chatbot/chatbotService.js";

export const getFAQ = async (req, res) => {
    try {
        const faqs = await chatbotService.getFAQList();
        res.json({ success: true, faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const handleMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: "message is required" });
        }

        const result = await chatbotService.queryChatbot(message);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
