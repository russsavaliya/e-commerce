const { send_email } = require('../../helper/mailer');

exports.send_support_email = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        status: false,
        message: 'Name, email and message are required',
      });
    }

    const supportEmail = process.env.EMAIL;
    if (!supportEmail) {
      return res.status(500).json({
        status: false,
        message: 'Support email is not configured',
      });
    }

    const subject = `New support query from ${name}`;
    const text = `Support query from contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    await send_email({
      to: supportEmail,
      subject,
      text,
    });

    return res.status(200).json({
      status: true,
      message: 'Your message has been sent successfully. We will contact you soon.',
    });
  } catch (error) {
    console.error('Error sending support email:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to send your message',
      error: error.message || 'Unknown error',
    });
  }
};


