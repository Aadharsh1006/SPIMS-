const { z } = require('zod');

const jobSchema = z.object({
    body: z.object({
        title: z.string().trim().min(3, 'Title must be at least 3 characters'),
        company: z.string().trim().min(2, 'Company name must be at least 2 characters'),
        location: z.string().trim().min(2, 'Location is required'),
        type: z.enum(['FULL_TIME', 'INTERNSHIP'], {
            errorMap: () => ({ message: 'Job type must be FULL_TIME or INTERNSHIP' })
        }),
        description: z.string().trim().min(10, 'Description must be at least 10 characters'),
        requirements: z.object({
            minCgpa: z.coerce.number().min(0).max(10).optional(),
            branchesAllowed: z.array(z.string()).optional(),
            skillsRequired: z.array(z.string()).optional(),
            batchYear: z.coerce.number().int().min(2000).max(2100).optional()
        }).optional(),
        salaryRange: z.object({
            min: z.coerce.number().min(0).optional(),
            max: z.coerce.number().min(0).optional(),
            currency: z.string().optional()
        }).optional(),
        collegeId: z.string().optional(),
    })
});

module.exports = {
    jobSchema
};
