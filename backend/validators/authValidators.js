const { z } = require('zod');

// User specifically requested to NOT have the 8-character limit
const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().email('Invalid email format, please enter a valid email address'),
        password: z.string().min(1, 'Password cannot be empty'),
        role: z.string().optional(),
        collegeId: z.string().optional()
    })
});

const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters'),
        email: z.string().trim().email('Invalid email format, please enter a valid email address'),
        password: z.string().min(1, 'Password cannot be empty'), // Relaxed password rule
        role: z.enum(['RECRUITER', 'ALUMNI'], {
            errorMap: () => ({ message: 'Invalid Role' })
        }),
        collegeId: z.string().trim().optional(),
    })
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(1, 'New password cannot be empty')
    }).strict()
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().trim().email('Invalid email format')
    }).strict()
});

const verifyOTPSchema = z.object({
    body: z.object({
        email: z.string().trim().email('Invalid email format'),
        otp: z.string().length(6, 'OTP must be 6 digits')
    }).strict()
});

const resetPasswordSchema = z.object({
    body: z.object({
        resetToken: z.string().min(1, 'Reset token is required'),
        newPassword: z.string().min(1, 'New password cannot be empty')
    }).strict()
});

module.exports = {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    verifyOTPSchema,
    resetPasswordSchema
};
