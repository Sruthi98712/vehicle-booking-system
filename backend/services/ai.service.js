const ChatMessage = require('../models/chat.model');

/**
 * AI Service for support chatbot.
 * Integrates with OpenAI or provides context-aware mocked responses.
 */
const getAIResponse = async (userId, userMessage, context = {}) => {
    try {
        console.log(`[AI Service] Processing message from user ${userId}: ${userMessage}`);

        // 1. Store user message in DB
        const userMsg = new ChatMessage({
            userId,
            sender: 'user',
            message: userMessage,
            context
        });
        await userMsg.save();

        // 2. Fetch Chat History for Context
        const history = await ChatMessage.find({ userId }).sort({ createdAt: -1 }).limit(10);

        // 3. Generate Response (Mocked Logic for Intelligent Support)
        let aiResponseText = "";
        const lowerMsg = userMessage.toLowerCase();

        if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
            aiResponseText = "Our pricing is dynamic! We consider weekend demand and peak hours. You can see the estimated price on each vehicle page.";
        } else if (lowerMsg.includes('extension') || lowerMsg.includes('extend')) {
            aiResponseText = "You can request a booking extension from your 'My Bookings' section. Once requested, the vendor will review it and the price will be updated automatically.";
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            aiResponseText = "Hello! I am your Smart Mobility assistant. How can I help you today?";
        } else if (lowerMsg.includes('vehicle') || lowerMsg.includes('suggest')) {
            aiResponseText = "I can help with that! Are you looking for a 'cheap' bike, a 'luxury' car, or something 'fuel efficient'? Try our semantic search!";
        } else {
            aiResponseText = "I'm here to help with your vehicle rentals. You can ask about pricing, extensions, or vehicle suggestions.";
        }

        // 4. Store AI response in DB
        const aiMsg = new ChatMessage({
            userId,
            sender: 'ai',
            message: aiResponseText,
            context: { relatedTo: userMsg._id }
        });
        await aiMsg.save();

        return aiResponseText;
    } catch (error) {
        console.error('[AI Service Error]', error);
        throw new Error('AI Service is currently unavailable.');
    }
};

const getChatHistory = async (userId) => {
    return await ChatMessage.find({ userId }).sort({ createdAt: 1 });
};

module.exports = {
    getAIResponse,
    getChatHistory
};
