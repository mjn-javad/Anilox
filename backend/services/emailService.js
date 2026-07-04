// services/email.service.js
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mohammadnorouzi308@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email, code) {
    const mailOption = {
      from: "mohammadnorouzi308@gmail.com",
      to: email,
      subject: "Registration Verification - Activation Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>Anilox</h1>
          <h2>Your Registration Verification Code</h2>
          <p>To complete your registration, please enter the code below:</p>
          <h1 style="text-align: center; padding: 10px; background: #f0f0f0;">${code}</h1>
          <p>This code is valid for 5 minutes.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOption);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, message: "Failed to send email" };
    }
  }

  async sendPasswordResetEmail(email, resetLink, userName = "") {
    const mailOption = {
      from: "mohammadnorouzi308@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Anilox</h1>
          <h2>Password Reset Request</h2>
          ${userName ? `<p>Hello <strong>${userName}</strong>,</p>` : "<p>Hello,</p>"}
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">${resetLink}</p>
          <p>This link is valid for <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">For security, never share this link with anyone.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOption);
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      console.error("Password reset email error:", error);
      return { success: false, message: "Failed to send reset email" };
    }
  }

  // ارسال ایمیل تأیید سفارش به مشتری
  async sendOrderConfirmationEmail(orderDetails) {
    const {
      customerEmail,
      customerName,
      orderId,
      orderDate,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    } = orderDetails;

    // ساخت لیست محصولات سفارش داده شده
    const itemsList = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: center;">${item.size || "-"}</td>
        <td style="padding: 10px; text-align: right; text-decoration: line-through;">${item.price.toFixed(2)} AED</td>
        <td style="padding: 10px; text-align: right;">${item.discount_price.toFixed(2)} AED</td>
        <td style="padding: 10px; text-align: right;">${(item.discount_price * item.quantity).toFixed(2)} AED</td>
      </tr>
    `,
      )
      .join("");

    const mailOption = {
      from: "mohammadnorouzi308@gmail.com",
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Anolx</h1>
            <p style="color: #666;">Thank you for your purchase!</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; margin-top: 0;">Order Confirmed ✓</h2>
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderId}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${orderDate}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 10px; background: #f5f5f5;">Product</th>
                  <th style="text-align: center; padding: 10px; background: #f5f5f5;">Qty</th>
                  <th style="text-align: center; padding: 10px; background: #f5f5f5;">Size</th>
                  <th style="text-align: right; padding: 10px; background: #f5f5f5;">Price Without Discount</th>
                  <th style="text-align: right; padding: 10px; background: #f5f5f5;">Price With Discount</th>
                  <th style="text-align: right; padding: 10px; background: #f5f5f5;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #ddd;">
                  <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50;">${totalAmount.toFixed(2)} AED</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${shippingAddress.full_name}</p>
            <p style="margin: 5px 0;">${shippingAddress.phone}</p>
            <p style="margin: 5px 0;">${shippingAddress.address}</p>
            <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.province}</p>
            <p style="margin: 5px 0;">Postal Code: ${shippingAddress.postal_code}</p>
          </div>

          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0;">We'll notify you once your order ships!</p>
          </div>
          
          <hr style="margin: 20px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">
            Need help? Contact us at mohammadnorouzi308@gmail.com<br>
            © ${new Date().getFullYear()} Anilox. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOption);
      return {
        success: true,
        message: "Order confirmation email sent to customer",
      };
    } catch (error) {
      console.error("Order confirmation email error:", error);
      return { success: false, message: "Failed to send order confirmation" };
    }
  }

  // ارسال ایمیل به کارگر (ادمین) برای اطلاع از سفارش جدید
  async sendNewOrderNotificationToWorker(orderDetails) {
    const {
      customerName,
      customerEmail,
      orderId,
      orderDate,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    } = orderDetails;

    // ساخت لیست محصولات سفارش داده شده
    const itemsList = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: center;">${item.size || "-"}</td>
        <td style="padding: 10px; text-align: right; text-decoration: line-through;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; text-align: right;">${item.discount_price.toFixed(2)} AED</td>
        <td style="padding: 10px; text-align: right;">${(item.price * item.quantity).toFixed(2)} AED</td>
      </tr>
    `,
      )
      .join("");

    const mailOption = {
      from: "mohammadnorouzi308@gmail.com",
      to: "saeid_loveline110@yahoo.com", // ایمیل کارگر/ادمین
      subject: `⚠️ NEW ORDER - Order #${orderId} - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #fff3e0; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px; background: #ff9800; padding: 20px; border-radius: 8px;">
            <h1 style="color: white; margin: 0;">⚠️ NEW ORDER RECEIVED</h1>
            <p style="color: white; margin: 5px 0 0;">Action Required - Process This Order</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #ff9800; margin-top: 0;">Customer Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p><strong>Customer Name:</strong> ${customerName}</p>
              <p><strong>Customer Email:</strong> ${customerEmail}</p>
              <p><strong>Order Number:</strong> #${orderId}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #ff9800; color: white;">
                  <th style="text-align: left; padding: 10px;">Product</th>
                  <th style="text-align: center; padding: 10px;">Qty</th>
                  <th style="text-align: center; padding: 10px;">Size</th>
                  <th style="text-align: right; padding: 10px;">Price Without Discount</th>
                  <th style="text-align: right; padding: 10px;">Price With Discount</th>
                  <th style="text-align: right; padding: 10px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #ddd;">
                  <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #ff9800; font-size: 18px;">${totalAmount.toFixed(2)} AED</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;"><strong>Recipient:</strong> ${shippingAddress.full_name}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${shippingAddress.phone}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${shippingAddress.address}</p>
            <p style="margin: 5px 0;"><strong>City:</strong> ${shippingAddress.city}, ${shippingAddress.province}</p>
            <p style="margin: 5px 0;"><strong>Postal Code:</strong> ${shippingAddress.postal_code}</p>
          </div>

          <div style="background: #ffebcc; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0;"><strong>⚠️ Action Required:</strong> Please process this order and prepare for shipment.</p>
            <p style="margin: 5px 0 0;">Order requires attention within 24 hours.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
            <a href="http://localhost:3000/admin/orders/${orderId}" 
               style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>
          
          <hr style="margin: 20px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">
            This is an automated notification from Anilox.<br>
            Please process this order as soon as possible.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOption);
      return { success: true, message: "Order notification sent to worker" };
    } catch (error) {
      console.error("Worker notification email error:", error);
      return { success: false, message: "Failed to send worker notification" };
    }
  }

  // متد جامع برای ارسال هر دو ایمیل (به مشتری و کارگر)
  async sendOrderNotifications(orderDetails) {
    try {
      // ارسال ایمیل تأیید به مشتری
      const customerResult =
        await this.sendOrderConfirmationEmail(orderDetails);

      // ارسال ایمیل به کارگر (ادمین)
      const workerResult =
        await this.sendNewOrderNotificationToWorker(orderDetails);

      return {
        success: customerResult.success && workerResult.success,
        customer: customerResult,
        worker: workerResult,
      };
    } catch (error) {
      console.error("Order notifications error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new EmailService();
