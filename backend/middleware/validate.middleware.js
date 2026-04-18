const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        const issues = error.issues || error.errors || [];
        console.error('[Validation Error] Details:', JSON.stringify(issues, null, 2));
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            details: issues.map(e => `${e.path.join('.')}: ${e.message}`) || [error.message]
        });
    }
};

const authSchemas = {
    register: z.object({
        body: z.object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(['admin', 'vendor', 'customer']).optional()
        })
    }),
    login: z.object({
        body: z.object({
            email: z.string().email(),
            password: z.string()
        })
    })
};

const vehicleSchemas = {
    create: z.object({
        body: z.object({
            make: z.string(),
            model: z.string(),
            year: z.number().int().min(1900),
            licensePlate: z.string(),
            rentalPricePerDay: z.number().positive(),
            type: z.enum(['SUV', 'Sedan', 'Hatchback', 'Luxury']),
            fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
            transmission: z.enum(['Manual', 'Automatic']),
            city: z.string()
        })
    })
};

module.exports = { validate, authSchemas, vehicleSchemas };
