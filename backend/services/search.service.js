const Vehicle = require('../models/Vehicle');

/**
 * Semantic Search Service.
 * In a full production env, this would use MongoDB Atlas Vector Search or Pinecone.
 * Here we implement a smart mapping logic that handles natural language intent.
 */
const semanticSearch = async (query, filters = {}) => {
    try {
        const lowerQuery = query.toLowerCase();
        let queryObj = { ...filters, status: 'available' };

        // 1. Intent: Price Keywords
        if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('under')) {
            const priceLimit = extractNumber(lowerQuery) || 1500;
            queryObj.rentalPricePerDay = { $lte: priceLimit };
        }

        // 2. Intent: Vehicle Type Keywords
        if (lowerQuery.includes('bike') || lowerQuery.includes('scooter')) {
            queryObj.type = 'Bike';
        } else if (lowerQuery.includes('car') || lowerQuery.includes('sedan') || lowerQuery.includes('suv')) {
            // Further refine if possible
            if (lowerQuery.includes('suv')) queryObj.type = 'SUV';
            else if (lowerQuery.includes('sedan')) queryObj.type = 'Sedan';
        }

        // 3. Intent: Feature Keywords
        if (lowerQuery.includes('luxury') || lowerQuery.includes('premium')) {
            queryObj.rentalPricePerDay = { $gte: 3000 };
        }

        if (lowerQuery.includes('fuel efficient') || lowerQuery.includes('mileage')) {
            queryObj.fuelType = 'EV'; // Or specific efficient models
        }

        // 4. Location Awareness
        if (lowerQuery.includes('near me') || lowerQuery.includes('in')) {
            // Simplified: extract city name if possible, or use provided filter
        }

        console.log(`[Semantic Search] Query: "${query}" -> Mapped to:`, queryObj);

        return await Vehicle.find(queryObj).populate('vendorId', 'businessName rating');
    } catch (error) {
        console.error('[Semantic Search Error]', error);
        throw error;
    }
};

// Helper to extract numbers (e.g., "under 2000")
const extractNumber = (str) => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : null;
};

module.exports = {
    semanticSearch
};
