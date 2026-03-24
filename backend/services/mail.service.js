const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    // Check if SMTP is configured
    const isConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!isConfigured) {
        console.log('-----------------------------------------');
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        console.log('-----------------------------------------');
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"SPIMS+ Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset OTP - SPIMS+',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #6366f1; margin: 0;">SPIMS+</h1>
                        <p style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Career & Placement Portal</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="color: #333; margin-top: 0; text-align: center;">Secure Reset Code</h2>
                        <p style="color: #555; text-align: center; font-size: 16px;">You have requested to reset your password. Use the code below to proceed:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 15px; background-color: #f1f5f9; padding: 15px 25px; border-radius: 6px; border: 1px dashed #6366f160;">${otp}</span>
                        </div>
                        <p style="color: #888; text-align: center; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
                        &copy; ${new Date().getFullYear()} SPIMS+. Standardized Placement & Internship Management System.
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[SMTP] OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

module.exports = { sendOTP };
