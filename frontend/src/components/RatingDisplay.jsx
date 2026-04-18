import React from 'react';
import { Box, Typography } from '@mui/material';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';

const RatingDisplay = ({ rating, totalRatings, size = 'small', showCount = true }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(<Star key={i} sx={{ color: '#f59e0b', fontSize: size === 'small' ? 16 : 24 }} />);
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars.push(<StarHalf key={i} sx={{ color: '#f59e0b', fontSize: size === 'small' ? 16 : 24 }} />);
        } else {
            stars.push(<StarBorder key={i} sx={{ color: '#e2e8f0', fontSize: size === 'small' ? 16 : 24 }} />);
        }
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ display: 'flex' }}>
                {stars}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, ml: 0.5 }}>
                {rating.toFixed(1)}
            </Typography>
            {showCount && totalRatings !== undefined && (
                <Typography variant="caption" color="text.secondary">
                    ({totalRatings} reviews)
                </Typography>
            )}
        </Box>
    );
};

export default RatingDisplay;
