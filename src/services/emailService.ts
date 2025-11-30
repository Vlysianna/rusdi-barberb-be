import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      return false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Rusdi Barber" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOTP(
    email: string,
    otp: string,
    userName?: string,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kode OTP Reset Password - Rusdi Barber</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background-color: #1a1a2e; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✂️ Rusdi Barber</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; text-align: center;">Kode OTP Reset Password</h2>
                    <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                      Halo${userName ? ` <strong>${userName}</strong>` : ""},
                    </p>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                      Gunakan kode OTP berikut untuk reset password akun Anda:
                    </p>
                    
                    <!-- OTP Code -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 30px 0;">
                          <div style="display: inline-block; padding: 20px 40px; background-color: #f8f8f8; border-radius: 12px; border: 2px dashed #1a1a2e;">
                            <span style="font-size: 36px; font-weight: bold; color: #1a1a2e; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                    
                    <p style="margin: 0 0 10px; color: #999999; font-size: 14px; line-height: 1.6; text-align: center;">
                      ⏱️ Kode OTP ini akan kadaluarsa dalam <strong>10 menit</strong>.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6; text-align: center;">
                      Jika Anda tidak meminta reset password, abaikan email ini.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                      © ${new Date().getFullYear()} Rusdi Barber. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      Email ini dikirim secara otomatis, mohon tidak membalas email ini.
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

    const text = `
Kode OTP Reset Password - Rusdi Barber

Halo${userName ? ` ${userName}` : ""},

Gunakan kode OTP berikut untuk reset password akun Anda:

${otp}

Kode OTP ini akan kadaluarsa dalam 10 menit.

Jika Anda tidak meminta reset password, abaikan email ini.

© ${new Date().getFullYear()} Rusdi Barber. All rights reserved.
    `;

    return this.sendEmail({
      to: email,
      subject: "🔐 Kode OTP Reset Password - Rusdi Barber",
      html,
      text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Selamat Datang - Rusdi Barber</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background-color: #1a1a2e; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✂️ Rusdi Barber</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <h2 style="margin: 0 0 20px; color: #333333; font-size: 28px;">🎉 Selamat Datang!</h2>
                    <p style="margin: 0 0 20px; color: #666666; font-size: 18px; line-height: 1.6;">
                      Halo <strong>${userName}</strong>,
                    </p>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                      Terima kasih telah bergabung dengan Rusdi Barber! Kami siap memberikan pengalaman grooming terbaik untuk Anda.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                    
                    <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                      Mulai booking layanan favorit Anda sekarang!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #999999; font-size: 14px;">
                      © ${new Date().getFullYear()} Rusdi Barber. All rights reserved.
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

    return this.sendEmail({
      to: email,
      subject: "🎉 Selamat Datang di Rusdi Barber!",
      html,
    });
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(
    email: string,
    bookingDetails: {
      userName: string;
      serviceName: string;
      stylistName: string;
      date: string;
      time: string;
      totalPrice: number;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Konfirmasi Booking - Rusdi Barber</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background-color: #1a1a2e; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✂️ Rusdi Barber</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">✅ Booking Dikonfirmasi!</h2>
                    <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                      Halo <strong>${bookingDetails.userName}</strong>,
                    </p>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                      Booking Anda telah berhasil dikonfirmasi. Berikut detail booking Anda:
                    </p>
                    
                    <!-- Booking Details -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f8f8; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 10px 0; color: #666666; font-size: 14px;">Layanan:</td>
                              <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold; text-align: right;">${bookingDetails.serviceName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; color: #666666; font-size: 14px;">Stylist:</td>
                              <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold; text-align: right;">${bookingDetails.stylistName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; color: #666666; font-size: 14px;">Tanggal:</td>
                              <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold; text-align: right;">${bookingDetails.date}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; color: #666666; font-size: 14px;">Waktu:</td>
                              <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold; text-align: right;">${bookingDetails.time}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-top: 1px solid #dddddd; color: #666666; font-size: 16px;">Total:</td>
                              <td style="padding: 10px 0; border-top: 1px solid #dddddd; color: #1a1a2e; font-size: 18px; font-weight: bold; text-align: right;">Rp ${bookingDetails.totalPrice.toLocaleString("id-ID")}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                    
                    <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                      Harap datang 10 menit sebelum jadwal booking Anda. Sampai jumpa!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #999999; font-size: 14px;">
                      © ${new Date().getFullYear()} Rusdi Barber. All rights reserved.
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

    return this.sendEmail({
      to: email,
      subject: "✅ Booking Dikonfirmasi - Rusdi Barber",
      html,
    });
  }
}

export default new EmailService();
