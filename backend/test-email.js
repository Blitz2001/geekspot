import dotenv from 'dotenv';
import { createTransport } from 'nodemailer';

dotenv.config();

const testEmail = async () => {
    console.log('Testing email configuration...');
    console.log('User:', process.env.EMAIL_USER);

    // Remove spaces from password if present
    const password = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s/g, '') : '';
    console.log('Password Length (cleaned):', password.length);

    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: password
        }
    });

    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('✅ Transporter verification successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Geekspot Email Test',
            text: 'If you see this, your email configuration is working correctly!'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error(error);
    }
};

testEmail();
