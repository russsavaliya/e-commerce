const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const send_email = async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    send_email,
};