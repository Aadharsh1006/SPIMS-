const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    if (!schema || typeof schema.parse !== 'function') {
        return next(new Error('validate() called with an invalid or undefined schema'));
    }

    try {
        const validData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (validData.body) req.body = validData.body;

        if (validData.query) {
            Object.keys(req.query).forEach(key => delete req.query[key]);
            Object.assign(req.query, validData.query);
        }
        if (validData.params) {
            Object.keys(req.params).forEach(key => delete req.params[key]);
            Object.assign(req.params, validData.params);
        }

        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            // Zod v4 uses `err.issues`, Zod v3 used `err.errors`
            const issues = err.issues ?? err.errors ?? [];
            return res.status(400).json({
                message: 'Data validation failed',
                errors: issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        next(err);
    }
};

module.exports = validate;