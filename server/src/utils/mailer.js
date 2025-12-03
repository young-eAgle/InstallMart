import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Email templates
const emailTemplates = {
  paymentReminder: (user, installment, order) => ({
    subject: '⏰ InstallMart - Payment Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Payment Reminder</h1>
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${user.fullName}</strong>,</p>

          <p style="font-size: 14px; color: #666;">This is a friendly reminder that your upcoming installment payment is due soon:</p>

          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Order ID:</strong></td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Amount Due:</strong></td>
                <td style="padding: 8px 0; color: #667eea; font-size: 18px; font-weight: bold; text-align: right;">Rs. ${installment.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Due Date:</strong></td>
                <td style="padding: 8px 0; color: #e74c3c; font-size: 14px; font-weight: bold; text-align: right;">${new Date(installment.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Please ensure your payment is made on time to avoid any late fees or service interruptions.
          </p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;"><strong>💳 Payment Methods Available:</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">JazzCash • EasyPaisa • Bank Transfer</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 14px;">View Dashboard</a>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 0;">
          <p style="margin: 0; font-size: 12px; color: #999;">Thank you for choosing InstallMart!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
  }),

  paymentConfirmation: (user, installment, order) => ({
    subject: '✅ InstallMart - Payment Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed</h1>
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${user.fullName}</strong>,</p>

          <p style="font-size: 14px; color: #666;">Great news! We've received your payment for your installment. Thank you!</p>

          <div style="background: linear-gradient(135deg, #10b98115 0%, #05966915 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Order ID:</strong></td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: bold; text-align: right;">Rs. ${installment.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Payment Date:</strong></td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${new Date(installment.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ${installment.transactionId ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Transaction ID:</strong></td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${installment.transactionId}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #10b981;">
            <p style="margin: 0; font-size: 14px; color: #059669;">✓ Your payment has been successfully processed</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #059669;">✓ Your installment is now marked as paid</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 14px;">View Dashboard</a>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 0;">
          <p style="margin: 0; font-size: 12px; color: #999;">Thank you for choosing InstallMart!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
  }),

  orderConfirmation: (user, order) => ({
    subject: '🎉 InstallMart - Order Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${user.fullName}</strong>,</p>

          <p style="font-size: 14px; color: #666;">Your order has been successfully placed! Here are the details:</p>

          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Order ID:</strong></td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; color: #667eea; font-size: 18px; font-weight: bold; text-align: right;">Rs. ${order.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Installment Plan:</strong></td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${order.installmentMonths} months</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Monthly Payment:</strong></td>
                <td style="padding: 8px 0; color: #667eea; font-size: 16px; font-weight: bold; text-align: right;">Rs. ${order.monthlyPayment.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 20px;"><strong>Order Items:</strong></p>
          ${order.items.map(item => `
            <div style="background-color: #f8f9fa; padding: 12px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 0; font-size: 14px; color: #333;"><strong>${item.name}</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Quantity: ${item.quantity} × Rs. ${item.price.toLocaleString()}</p>
            </div>
          `).join('')}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 14px;">Track Your Order</a>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 0;">
          <p style="margin: 0; font-size: 12px; color: #999;">Thank you for shopping with InstallMart!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Your order will be processed shortly.</p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = emailTemplates[template](data.user, data.installment || data.order, data.order);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'InstallMart <noreply@installmart.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
