/**
 * Email Helper Functions
 * Handles sending order-related emails to customers and admins
 */

const { send_html_email, renderEmailTemplate } = require('./mailer');
const path = require('path');

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹ ');
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const generateProductRows = (products, isAdmin = false) => {
    if (!products || products.length === 0) {
        return '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #6b7280;">No products found</td></tr>';
    }

    return products.map((product, index) => {
        const variantText = product.variant_name ? `<br><span style="color: #6b7280; font-size: 12px;">Variant: ${product.variant_name}</span>` : '';

        if (isAdmin) {
            // Admin email - includes index number and more details
            return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: #6b7280; font-size: 13px;">${index + 1}</td>
                    <td style="padding: 12px; color: #374151; font-size: 14px;">
                        <strong>${product.product_name}</strong>${variantText}
                    </td>
                    <td style="padding: 12px; text-align: center; color: #374151; font-size: 14px;">${product.quantity}</td>
                    <td style="padding: 12px; text-align: right; color: #374151; font-size: 14px;">₹ ${formatCurrency(product.unit_price)}</td>
                    <td style="padding: 12px; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">₹ ${formatCurrency(product.total)}</td>
                </tr>
            `;
        } else {
            // Customer email - simpler format
            return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: #374151; font-size: 14px;">
                        <strong>${product.product_name}</strong>${variantText}
                    </td>
                    <td style="padding: 12px; text-align: center; color: #374151; font-size: 14px;">${product.quantity}</td>
                    <td style="padding: 12px; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">₹ ${formatCurrency(product.total)}</td>
                </tr>
            `;
        }
    }).join('');
};

const getPaymentMethodName = (paymentMethod) => {
    const methods = {
        'cod': 'Cash on Delivery',
        'online': 'Online Payment',
    };
    return methods[paymentMethod] || paymentMethod;
};

const getPaymentStatusName = (paymentStatus) => {
    const statuses = {
        'paid': 'Paid',
        'pending': 'Pending',
        'failed': 'Failed',
        'refunded': 'Refunded',
    };
    return statuses[paymentStatus] || paymentStatus;
};

const sendOrderSuccessEmailToCustomer = async (orderData) => {
    try {
        const customerEmail = orderData.shipping_address?.email;
        if (!customerEmail) {
            throw new Error('Customer email is required');
        }

        // Prepare template data
        const logoUrl = process.env.BASE_URL
            ? `${process.env.BASE_URL}/images/logo.png`
            : `http://localhost:${process.env.PORT || 1200}/images/logo.png`;

        const templateData = {
            LOGO_URL: logoUrl,
            ORDER_ID: orderData.order_id || 'N/A',
            ORDER_DATE: formatDate(orderData.created_at),
            CUSTOMER_NAME: orderData.shipping_address?.fullName || 'Customer',
            CUSTOMER_EMAIL: customerEmail,
            CUSTOMER_PHONE: orderData.shipping_address?.phone || 'N/A',
            CUSTOMER_ADDRESS: orderData.shipping_address?.address || 'N/A',
            CUSTOMER_CITY_STATE_PIN: `${orderData.shipping_address?.city || ''}, ${orderData.shipping_address?.state || ''} - ${orderData.shipping_address?.pincode || ''}`,
            PRODUCT_ROWS: generateProductRows(orderData.products, false),
            SUBTOTAL: formatCurrency(orderData.sub_total || 0),
            SHIPPING_ROW: (orderData.shipping_amount && orderData.shipping_amount > 0)
                ? `<tr><td style="color: #6b7280; font-size: 14px;">Shipping</td><td align="right" style="color: #374151; font-size: 14px; font-weight: 600;">₹ ${formatCurrency(orderData.shipping_amount)}</td></tr>`
                : '<tr><td style="color: #6b7280; font-size: 14px;">Shipping</td><td align="right" style="color: #10b981; font-size: 14px; font-weight: 600;">Free</td></tr>',
            TAX_ROW: (orderData.total_tax && orderData.total_tax > 0)
                ? `<tr><td style="color: #6b7280; font-size: 14px;">Tax</td><td align="right" style="color: #374151; font-size: 14px; font-weight: 600;">₹ ${formatCurrency(orderData.total_tax)}</td></tr>`
                : '',
            COUPON_ROW: (orderData.coupon && orderData.coupon.discount_amount && orderData.coupon.discount_amount > 0)
                ? `<tr><td style="color: #6b7280; font-size: 14px;">Discount${orderData.coupon.coupon_code ? ` (${orderData.coupon.coupon_code})` : ''}</td><td align="right" style="color: #10b981; font-size: 14px; font-weight: 600;">- ₹ ${formatCurrency(orderData.coupon.discount_amount)}</td></tr>`
                : '',
            TOTAL: formatCurrency(orderData.total_amount || 0),
            PAYMENT_METHOD: getPaymentMethodName(orderData.payment_method),
            PAYMENT_STATUS_ROW: orderData.payment_method === 'online'
                ? `<p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</p><p style="margin: 0; color: #10b981; font-size: 16px; font-weight: 700;">${getPaymentStatusName(orderData.payment_status)}</p>`
                : '',
            SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || process.env.EMAIL || 'support@siyara.com',
            CURRENT_YEAR: new Date().getFullYear(),
        };

        // Render template
        const html = renderEmailTemplate('order_success_customer', templateData);

        // Send email
        const subject = `Order Confirmed - ${orderData.order_id} | SIYARA`;
        await send_html_email({
            to: customerEmail,
            subject,
            html,
        });

        return {
            success: true,
            message: 'Order confirmation email sent to customer',
            recipient: customerEmail,
        };
    } catch (error) {
        console.error('Error sending order success email to customer:', error);
        throw error;
    }
};

const sendOrderNotificationEmailToAdmin = async (orderData) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            throw new Error('Admin email is not configured');
        }

        // Prepare template data
        const logoUrl = process.env.BASE_URL
            ? `${process.env.BASE_URL}/images/logo.png`
            : `http://localhost:${process.env.PORT || 1200}/images/logo.png`;

        const templateData = {
            LOGO_URL: logoUrl,
            ORDER_ID: orderData.order_id || 'N/A',
            ORDER_DATE: formatDate(orderData.created_at),
            ORDER_STATUS: (orderData.order_status || 'pending').charAt(0).toUpperCase() + (orderData.order_status || 'pending').slice(1),
            PAYMENT_STATUS: getPaymentStatusName(orderData.payment_status),
            CUSTOMER_NAME: orderData.shipping_address?.fullName || 'N/A',
            CUSTOMER_EMAIL: orderData.shipping_address?.email || 'N/A',
            CUSTOMER_PHONE: orderData.shipping_address?.phone || 'N/A',
            CUSTOMER_ADDRESS: orderData.shipping_address?.address || 'N/A',
            CUSTOMER_CITY_STATE_PIN: `${orderData.shipping_address?.city || ''}, ${orderData.shipping_address?.state || ''} - ${orderData.shipping_address?.pincode || ''}`,
            LANDMARK_ROW: orderData.shipping_address?.landmark
                ? `<p style="margin: 0; color: #374151; font-size: 14px;">Landmark: ${orderData.shipping_address.landmark}</p>`
                : '',
            PRODUCT_ROWS: generateProductRows(orderData.products, true),
            SUBTOTAL: formatCurrency(orderData.sub_total || 0),
            SHIPPING_ROW: (orderData.shipping_amount && orderData.shipping_amount > 0)
                ? `<tr><td style="color: #6b7280; font-size: 14px;">Shipping</td><td align="right" style="color: #374151; font-size: 14px; font-weight: 600;">₹ ${formatCurrency(orderData.shipping_amount)}</td></tr>`
                : '<tr><td style="color: #6b7280; font-size: 14px;">Shipping</td><td align="right" style="color: #10b981; font-size: 14px; font-weight: 600;">Free</td></tr>',
            TAX_ROW: (orderData.total_tax && orderData.total_tax > 0)
                ? `<tr><td style="color: #6b7280; font-size: 14px;">Tax</td><td align="right" style="color: #374151; font-size: 14px; font-weight: 600;">₹ ${formatCurrency(orderData.total_tax)}</td></tr>`
                : '',
            COUPON_ROW: (orderData.coupon && orderData.coupon.discount_amount && orderData.coupon.discount_amount > 0)
                ? `<tr><td style="color: #6b7280; font-size: 14px;">Discount${orderData.coupon.coupon_code ? ` (${orderData.coupon.coupon_code})` : ''}</td><td align="right" style="color: #10b981; font-size: 14px; font-weight: 600;">- ₹ ${formatCurrency(orderData.coupon.discount_amount)}</td></tr>`
                : '',
            TOTAL: formatCurrency(orderData.total_amount || 0),
            PAYMENT_METHOD: getPaymentMethodName(orderData.payment_method),
            RAZORPAY_DETAILS: (orderData.payment_method === 'online' && orderData.razorpay_payment_id)
                ? `<tr><td style="padding: 5px 0; color: #6b7280; font-size: 13px;">Razorpay Payment ID:</td><td style="padding: 5px 0; color: #374151; font-size: 13px; font-family: monospace;">${orderData.razorpay_payment_id}</td></tr>`
                : '',
            CURRENT_YEAR: new Date().getFullYear(),
        };

        // Render template
        const html = renderEmailTemplate('order_success_admin', templateData);

        // Send email
        const subject = `New Order #${orderData.order_id} - ${getPaymentMethodName(orderData.payment_method)} | SIYARA`;
        await send_html_email({
            to: adminEmail,
            subject,
            html,
        });

        return {
            success: true,
            message: 'Order notification email sent to admin',
            recipient: adminEmail,
        };
    } catch (error) {
        console.error('Error sending order notification email to admin:', error);
        throw error;
    }
};

/**
 * Send order success emails (both customer and admin)
 * @param {Object} orderData - Order data object
 * @returns {Promise<Object>} Email send results
 */
const sendOrderSuccessEmail = async (orderData) => {
    const results = {
        customer: null,
        admin: null,
        errors: [],
    };

    // Send email to customer
    try {
        results.customer = await sendOrderSuccessEmailToCustomer(orderData);
    } catch (error) {
        console.error('Failed to send email to customer:', error);
        results.errors.push({
            type: 'customer',
            error: error.message || 'Unknown error',
        });
    }

    // Send email to admin
    try {
        results.admin = await sendOrderNotificationEmailToAdmin(orderData);
    } catch (error) {
        console.error('Failed to send email to admin:', error);
        results.errors.push({
            type: 'admin',
            error: error.message || 'Unknown error',
        });
    }

    return results;
};

const sendOrderCancellationEmail = async (orderData) => {
    const results = {
        customer: { success: false, error: null },
        admin: { success: false, error: null },
        errors: [],
    };

    const {
        order_id,
        total_amount,
        cancellation_reason,
        cancelled_at,
        shipping_address,
    } = orderData;
    // Format data
    const formattedDate = formatDate(cancelled_at);
    const formattedAmount = formatCurrency(total_amount || 0);

    // Customer Email
    const customerSubject = `Order ${order_id} - Cancellation Confirmation`;
    const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #481d6f 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Order Cancelled</h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                        Dear ${shipping_address?.fullName || 'Customer'},
                                    </p>
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                        Your order <strong style="color: #481d6f;">${order_id}</strong> has been cancelled as per your request.
                                    </p>

                                    <!-- Order Details Box -->
                                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Order ID:</td>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 600;">${order_id}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Order Amount:</td>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 600;">${formattedAmount}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Cancelled On:</td>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 600;">${formattedDate}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px; vertical-align: top;">Reason:</td>
                                                <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 600;">${cancellation_reason || 'Not specified'}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 15px;">
                                        If you have any questions or concerns, please don't hesitate to contact our support team.
                                    </p>
                                    
                                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
                                        Thank you for your understanding.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 13px; margin: 0;">
                                        © ${new Date().getFullYear()} SIYARA. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // Admin Email
    const adminSubject = `Order ${order_id} - Cancelled by Customer`;
    const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">⚠️ Order Cancelled</h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                        A customer has cancelled their order. Details below:
                                    </p>

                                    <!-- Order Details Box -->
                                    <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Order ID:</td>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; text-align: right; font-weight: 600;">${order_id}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Customer Name:</td>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; text-align: right; font-weight: 600;">${shipping_address?.fullName || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Email:</td>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; text-align: right; font-weight: 600;">${shipping_address?.email || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Order Amount:</td>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; text-align: right; font-weight: 600;">${formattedAmount}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Cancelled On:</td>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; text-align: right; font-weight: 600;">${formattedDate}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; vertical-align: top;">Cancellation Reason:</td>
                                                <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px; text-align: right; font-weight: 600;">${cancellation_reason || 'Not specified'}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
                                        Please update the order status in the admin panel if necessary.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 13px; margin: 0;">
                                        © ${new Date().getFullYear()} SIYARA Admin System
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // Send customer email
    try {
        await send_html_email(
            {
                to: shipping_address?.email || '',
                subject: customerSubject,
                html: customerHtml
            });
        results.customer.success = true;
    } catch (error) {
        console.error('Failed to send cancellation email to customer:', error);
        results.customer.error = error.message || 'Unknown error';
        results.errors.push({
            type: 'customer',
            error: error.message || 'Unknown error',
        });
    }

    // Send admin email
    try {
        await send_html_email({
            to: process.env.ADMIN_EMAIL,
            subject: adminSubject,
            html: adminHtml
        });
        results.admin.success = true;
    } catch (error) {
        console.error('Failed to send cancellation email to admin:', error);
        results.admin.error = error.message || 'Unknown error';
        results.errors.push({
            type: 'admin',
            error: error.message || 'Unknown error',
        });
    }

    return results;
};

module.exports = {
    sendOrderSuccessEmail,
    sendOrderSuccessEmailToCustomer,
    sendOrderNotificationEmailToAdmin,
    sendOrderCancellationEmail,
};

