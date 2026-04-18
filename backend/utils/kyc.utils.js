/**
 * Masks Aadhaar number to show only last 4 digits.
 * @param {string} aadhaar 
 * @returns {string}
 */
const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return '';
    const cleaned = aadhaar.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    return 'XXXX-XXXX-' + cleaned.slice(-4);
};

module.exports = {
    maskAadhaar
};
