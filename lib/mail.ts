import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials not configured. Email NOT sent.');
        console.log(`To: ${to}\nSubject: ${subject}\nBody: ${html}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"S&T Digital Log System" <${process.env.SMTP_USER}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });
        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        throw error;
    }
}
