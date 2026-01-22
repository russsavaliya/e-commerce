const axios = require('axios');

/**
 * Format phone number for WhatsApp (E.164 without "+")
 * Falls back to WHATSAPP_DEFAULT_COUNTRY_CODE (default: 91)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  const digits = phone.toString().replace(/\D/g, '');
  if (!digits) return null;

  const countryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91';

  if (digits.startsWith(countryCode)) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `${countryCode}${digits.slice(1)}`;
  }

  return `${countryCode}${digits}`;
};

/**
 * Send a plain text WhatsApp message using Meta WhatsApp Cloud API
 * Requires: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 */
const sendWhatsAppMessage = async ({ to, body }) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('WhatsApp not configured: missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );
};

/**
 * Send order success notification via WhatsApp
 */
const sendOrderSuccessWhatsApp = async (orderData = {}) => {
  const {
    order_id,
    total_amount,
    created_at,
    shipping_address,
  } = orderData;

  const to = formatPhoneNumber(shipping_address?.phone);
  if (!to) {
    console.warn('WhatsApp send skipped: invalid or missing phone number');
    return;
  }

  const customerName = shipping_address?.fullName || 'Customer';
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(total_amount || 0);

  const formattedDate = created_at
    ? new Date(created_at).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'today';

  const supportContact =
    process.env.SUPPORT_PHONE ||
    process.env.SUPPORT_EMAIL ||
    'our support team';

  const message = [
    `Hi ${customerName},`,
    `Your order ${order_id} is confirmed.`,
    `Amount: ${formattedAmount}`,
    `Date: ${formattedDate}`,
    `Need help? Contact ${supportContact}.`,
    `Thank you for shopping with us!`,
  ].join('\n');

  await sendWhatsAppMessage({ to, body: message });
};

module.exports = {
  sendOrderSuccessWhatsApp,
};
