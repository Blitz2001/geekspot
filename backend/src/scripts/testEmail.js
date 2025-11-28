import dotenv from 'dotenv';
import { verifyEmailConfig, sendEmail } from '../services/emailService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testEmail = async () => {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'MISSING');

    // Verify config
    const verifyResult = await verifyEmailConfig();
    if (verifyResult.success) {
        console.log('✅ Configuration is valid!');

        // Try sending a test email
        console.log('Sending test email...');
        const sendResult = await sendEmail(
            process.env.EMAIL_USER, // Send to self
            'Test Email from Geekspot',
            'This is a test email to verify your configuration.'
        );

        if (sendResult.success) {
            console.log('✅ Test email sent successfully!');
            console.log('Message ID:', sendResult.messageId);
        } else {
            console.error('❌ Failed to send email:', sendResult.error);
        }
    } else {
        console.error('❌ Configuration invalid:', verifyResult.error);
    }
};

testEmail();
