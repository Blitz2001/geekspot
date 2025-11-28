import { createTransport } from 'nodemailer';

// Create email transporter
const createTransporter = () => {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    if (emailService === 'gmail') {
        return createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, '')
            }
        });
    } else if (emailService === 'sendgrid') {
        return createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    } else {
        // Custom SMTP
        return createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
};

// Email templates
const getEmailTemplate = (type, subject, message) => {
    const baseTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #0a1628 0%, #1a2942 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #a3e635;
                }
                .content {
                    background: #ffffff;
                    padding: 30px;
                    border-left: 1px solid #e5e7eb;
                    border-right: 1px solid #e5e7eb;
                }
                .message {
                    font-size: 16px;
                    margin: 20px 0;
                    white-space: pre-wrap;
                }
                .cta-button {
                    display: inline-block;
                    background: #a3e635;
                    color: #0a1628;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    background: #f9fafb;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #6b7280;
                    border-radius: 0 0 10px 10px;
                    border: 1px solid #e5e7eb;
                }
                .unsubscribe {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">⚡ Geekspot</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your Tech Paradise</p>
            </div>
            <div class="content">
                <h2 style="color: #0a1628; margin-top: 0;">${subject}</h2>
                <div class="message">${message}</div>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">
                    Visit Geekspot
                </a>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Geekspot. All rights reserved.</p>
                <p style="margin: 10px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe" class="unsubscribe">
                        Unsubscribe from emails
                    </a>
                </p>
            </div>
        </body>
        </html>
    `;

    return baseTemplate;
};

// Send single email
export const sendEmail = async (to, subject, message, attachments = [], campaignType = 'announcement') => {
    try {
        const transporter = createTransporter();
        const htmlContent = getEmailTemplate(campaignType, subject, message);

        const mailOptions = {
            from: `Geekspot <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send bulk emails
export const sendBulkEmails = async (recipients, subject, message, campaignType = 'announcement') => {
    const results = {
        sent: 0,
        failed: 0,
        errors: []
    };

    for (const recipient of recipients) {
        const result = await sendEmail(recipient.email, subject, message, [], campaignType);
        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            results.errors.push({
                email: recipient.email,
                error: result.error
            });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
};

// Verify email configuration
export const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        console.error('Email configuration error:', error);
        return { success: false, error: error.message };
    }
};
