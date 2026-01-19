import { Resend } from "resend";
import { config } from "../config/env.js";

/**
 * Initialize Resend client
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Brand footer for emails
 */
const brandFooter = `
  <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-top: 3px solid #2563eb; text-align: center;">
    <div style="margin-bottom: 15px;">
      <span style="font-size: 24px; font-weight: bold; color: #2563eb;">MyVoice</span>
      <span style="font-size: 24px; font-weight: bold; color: #1e40af;"> MyHealth</span>
    </div>
    <p style="color: #475569; font-size: 14px; margin: 0 0 10px 0;">
      Your Voice Matters in Healthcare
    </p>
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} MyVoice MyHealth. All rights reserved.
      </p>
    </div>
  </div>
`;

/**
 * Email service for sending notifications
 */
export const emailService = {
  /**
   * Sends admin invite email with generated password
   */
  async sendAdminInvite(params: {
    email: string;
    fullName?: string | null;
    role: string;
    password: string;
    loginUrl?: string;
  }): Promise<boolean> {
    const { email, fullName, role, password, loginUrl = "http://localhost:8080/admin/login" } = params;

    try {
      const roleDisplay = role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

      await resend.emails.send({
        from: "MyVoice MyHealth <no-reply@healthcare-feedback.i4nnova.com>",
        to: [email],
        subject: "You've Been Added as an Admin - MyVoice MyHealth",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px 0; background-color: #2563eb; margin-bottom: 30px;">
              <span style="font-size: 28px; font-weight: bold; color: white;">MyVoice MyHealth</span>
            </div>
            <h1 style="color: #1e40af;">Welcome to the Admin Team!</h1>
            <p>Hello${fullName ? ` ${fullName}` : ''},</p>
            <p>You have been added as an administrator to the MyVoice MyHealth platform.</p>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin: 0 0 15px 0; color: #1e40af;">Your Login Credentials</h3>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 8px 0;"><strong>Password:</strong> <code style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
              <p style="margin: 15px 0 0 0;"><strong>Role:</strong> ${roleDisplay}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Security Notice:</strong> Please change your password after your first login.
              </p>
            </div>

            <p>You can now access the admin dashboard to manage feedback submissions, review pending entries, and help improve healthcare services.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Access Admin Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact your system administrator.
            </p>
            ${brandFooter}
          </div>
        `,
      });

      console.log(`Admin invite email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send admin invite email:", error);
      return false;
    }
  },

  /**
   * Sends password reset email
   */
  async sendPasswordReset(params: {
    email: string;
    fullName?: string | null;
    resetToken: string;
    resetUrl?: string;
  }): Promise<boolean> {
    const { email, fullName, resetToken, resetUrl = "http://localhost:8080/admin/reset-password" } = params;

    try {
      await resend.emails.send({
        from: "MyVoice MyHealth <no-reply@healthcare-feedback.i4nnova.com>",
        to: [email],
        subject: "Password Reset - MyVoice MyHealth",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px 0; background-color: #2563eb; margin-bottom: 30px;">
              <span style="font-size: 28px; font-weight: bold; color: white;">MyVoice MyHealth</span>
            </div>
            <h1 style="color: #1e40af;">Password Reset Request</h1>
            <p>Hello${fullName ? ` ${fullName}` : ''},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}?token=${resetToken}" 
                 style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            ${brandFooter}
          </div>
        `,
      });

      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return false;
    }
  },
};
