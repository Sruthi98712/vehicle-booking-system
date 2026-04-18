const aiService = require('../services/ai.service');
const searchService = require('../services/search.service');

const handleAIChat = async (req, res) => {
    try {
        const { message, context } = req.body;
        const response = await aiService.getAIResponse(req.user._id, message, context);
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const history = await aiService.getChatHistory(req.user._id);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const performSmartSearch = async (req, res) => {
    try {
        const { query, ...filters } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        const results = await searchService.semanticSearch(query, filters);
        res.status(200).json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    handleAIChat,
    getChatHistory,
    performSmartSearch
};
