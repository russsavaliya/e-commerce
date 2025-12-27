const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: "hfqsqciqhspvrvbs",
        },
    });
};

const send_email = async ({ to, subject, text }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const send_html_email = async ({ to, subject, html, text = null }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
            text: text || 'Please enable HTML to view this email.',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`HTML email sent successfully to ${to}`);
        return info;
    } catch (error) {
        console.error('Error sending HTML email:', error);
        throw error;
    }
};

const renderEmailTemplate = (templateName, data) => {
    try {
        const templatePath = path.join(__dirname, 'html_templates', `${templateName}.html`);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templatePath}`);
        }

        let html = fs.readFileSync(templatePath, 'utf8');

        // Replace all template variables with actual data
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key] || '');
        });

        return html;
    } catch (error) {
        console.error(`Error rendering email template ${templateName}:`, error);
        throw error;
    }
};

module.exports = {
    send_email,
    send_html_email,
    renderEmailTemplate,
};