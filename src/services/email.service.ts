import { Resend } from "resend";
import { prisma } from "../config/prisma.js";

/**
 * Initialize Resend client
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sender address
 */
const EMAIL_FROM = "MyVoiceMyHealth <no-reply@healthcare-feedback.i4nnova.com>";

/**
 * Default app URL for email links
 * Uses explicit production URL, falls back to env/local for non-prod.
 */
const getAppUrl = () =>
  process.env.APP_URL || "https://myvoicemyhealth.vercel.app" || "http://localhost:8080";

/**
 * Hosted logo URL used in all emails
 */
// Use the shared frontend public logo so emails and app stay consistent
const getLogoUrl = () => `${getAppUrl()}/logo.png`;
const LOGO_SOURCE_WIDTH = 396;
const LOGO_SOURCE_HEIGHT = 194;

const getScaledLogoSize = (targetWidthPx: number) => ({
  width: targetWidthPx,
  height: Math.round((targetWidthPx * LOGO_SOURCE_HEIGHT) / LOGO_SOURCE_WIDTH),
});

/** Brand colors for email templates (aligned with app) */
const BRAND_PRIMARY = "#1E6B4A"; // primary green
const BRAND_PRIMARY_SOFT = "#DCFCE7"; // soft green background

/** Logo HTML for email headers (logo image only) */
const getEmailHeaderLogo = (targetWidthPx = 236) => {
  const { width, height } = getScaledLogoSize(targetWidthPx);

  return `<img src="${getLogoUrl()}" alt="MyVoiceMyHealth" width="${width}" height="${height}" style="display: block; width: ${width}px; height: ${height}px; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />`;
};

/** Brand text for emails (single word mark) */
const emailBrandText = '<span style="color: #1E6B4A;">MyVoiceMyHealth</span>';

const EMAIL_BRAND_PLAIN = "MyVoiceMyHealth";

// Social media links (aligned with frontend FOOTER config)
const SOCIAL_LINKS: { label: string; url: string }[] = [
  {
    label: "Facebook",
    url: "https://web.facebook.com/profile.php?id=61588297084044",
  },
  {
    label: "X",
    url: "https://x.com/voice_my81040",
  },
  {
    label: "TikTok",
    url: "https://www.tiktok.com/@myvoicemyhealth0?lang=en-GB",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/myvoicemyhealth1/",
  },
];

const socialLinksHtml =
  SOCIAL_LINKS.length > 0
    ? `
    <div style="margin-top: 10px;">
      <span style="color: #64748b; font-size: 12px; display: block; margin-bottom: 6px;">Connect with us:</span>
      ${SOCIAL_LINKS.map(
      (link) =>
        `<a href="${link.url}" style="color: #1E6B4A; text-decoration: none; margin-right: 12px;">${link.label}</a>`,
    ).join("")}
    </div>
  `
    : "";

/**
 * Brand footer for emails – uses logo image and brand colors
 */
const brandFooter = `
  <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-top: 3px solid #1E6B4A; text-align: center;">
    <div style="margin-bottom: 15px;">
      <div style="font-size: 20px; font-weight: bold; font-family: Arial, sans-serif;">${emailBrandText}</div>
    </div>
    <p style="color: #475569; font-size: 14px; margin: 0 0 10px 0;">
      Your voice shapes care.
    </p>
    ${socialLinksHtml}
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      This is an automated message from ${emailBrandText}. Please do not reply directly to this email.
    </p>
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} MyVoiceMyHealth. All rights reserved.
      </p>
    </div>
  </div>
`;

const renderEmailLayout = (
  contentHtml: string,
  options?: {
    headerLogoWidth?: number;
    headerBackground?: string;
    headerBorderBottomColor?: string;
  },
) => `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${EMAIL_BRAND_PLAIN}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; background-color:#f3f4f6;">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse; max-width:600px; width:100%; background-color:#ffffff;">
            <tr>
              <td align="center" style="background-color:${options?.headerBackground ?? BRAND_PRIMARY}; padding:24px 16px; ${options?.headerBorderBottomColor ? `border-bottom: 1px solid ${options.headerBorderBottomColor};` : ""
  }">
                ${getEmailHeaderLogo(options?.headerLogoWidth ?? 236)}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 20px 24px 20px; font-family: Arial, sans-serif; font-size:14px; line-height:1.5; color:#111827;">
                ${contentHtml}
                ${brandFooter}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
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
    const { email, fullName, role, password, loginUrl = `${getAppUrl()}/admin/login` } = params;

    try {
      const roleDisplay = role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: "You've Been Added as an Admin - MyVoiceMyHealth",
        html: renderEmailLayout(
          `
            <h1 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0;">Welcome to the Admin Team!</h1>
            <p>Hello${fullName ? ` ${fullName}` : ''},</p>
            <p>You have been added as an administrator to the MyVoiceMyHealth platform.</p>
            
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND_PRIMARY};">Your Login Credentials</h3>
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
            
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 30px auto;">
              <tr>
                <td align="center" bgcolor="${BRAND_PRIMARY}" style="border-radius: 8px;">
                  <a href="${loginUrl}" 
                     style="display: inline-block; padding: 14px 28px; font-weight: bold; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; text-decoration: none;">
                    Access Admin Dashboard
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact your system administrator.
            </p>
          `,
          { headerLogoWidth: 256 },
        ),
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
    const { email, fullName, resetToken, resetUrl = `${getAppUrl()}/admin/reset-password` } = params;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: "Password Reset - MyVoiceMyHealth",
        html: renderEmailLayout(
          `
            <h1 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0;">Password Reset Request</h1>
            <p>Hello${fullName ? ` ${fullName}` : ''},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 30px auto;">
              <tr>
                <td align="center" bgcolor="${BRAND_PRIMARY}" style="border-radius: 8px;">
                  <a href="${resetUrl}?token=${resetToken}" 
                     style="display: inline-block; padding: 14px 28px; font-weight: bold; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; text-decoration: none;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          `,
          { headerLogoWidth: 256 },
        ),
      });

      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return false;
    }
  },

  /**
   * Sends feedback confirmation email to the reporter
   * @param params - Email parameters including feedback details
   * @returns Promise<boolean> - Whether the email was sent successfully
   */
  async sendFeedbackConfirmation(params: {
    email: string;
    referenceId: string;
    feedbackId: string;
  }): Promise<boolean> {
    const { email, referenceId } = params;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: `Feedback Received - Reference: ${referenceId}`,
        html: renderEmailLayout(
          `
            <h1 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0;">Thank You for Your Feedback</h1>
            <p>We have successfully received your feedback submission.</p>
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <p style="margin: 0;"><strong>Reference Number:</strong> ${referenceId}</p>
            </div>
            <p>Please keep this reference number for your records. You can use it to track the status of your submission.</p>
            <p>Our team will review your feedback and take appropriate action.</p>
          `,
          { headerLogoWidth: 256 },
        ),
      });

      console.log(`Feedback confirmation email sent to ${email} for ${referenceId}`);
      return true;
    } catch (error) {
      console.error("Failed to send feedback confirmation email:", error);
      return false;
    }
  },

  /**
   * Sends notification email to all active admins about new feedback
   * @param params - Email parameters including feedback details
   * @returns Promise<boolean> - Whether the emails were sent successfully
   */
  async sendAdminNotification(params: {
    referenceId: string;
    feedbackType: string;
    feedbackId: string;
  }): Promise<boolean> {
    const { referenceId, feedbackType, feedbackId } = params;

    try {
      // Get all active admin emails
      const admins = await prisma.admin.findMany({
        where: { is_active: true },
        select: { email: true },
      });

      if (!admins || admins.length === 0) {
        console.log("No active admins to notify");
        return true; // Not an error, just no admins
      }

      // Manually exclude specific emails from notifications
      const adminEmails = admins
        .map((a) => a.email)
        .filter((email) => email.toLowerCase() !== "kelechi.nwosu@i4nnova.com");

      const appUrl = getAppUrl();
      const feedbackTypeLabel = feedbackType
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      console.log(`Sending admin notifications to ${adminEmails.length} admin(s)`);

      await resend.emails.send({
        from: EMAIL_FROM,
        to: adminEmails,
        subject: `New ${feedbackTypeLabel} Submitted - Reference: ${referenceId}`,
        html: renderEmailLayout(
          `
            <h1 style="color: ${BRAND_PRIMARY}; text-align: center; margin: 0 0 16px 0;">New Feedback Submission</h1>
            <p>A new ${feedbackTypeLabel.toLowerCase()} has been submitted and requires your attention.</p>
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <p style="margin: 0 0 8px 0;"><strong>Reference Number:</strong> ${referenceId}</p>
              <p style="margin: 0;"><strong>Type:</strong> ${feedbackTypeLabel}</p>
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 30px auto;">
              <tr>
                <td align="center" bgcolor="${BRAND_PRIMARY}" style="border-radius: 8px;">
                  <a href="${appUrl}/admin/feedback/${feedbackId}" 
                     style="display: inline-block; padding: 14px 28px; font-weight: bold; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; text-decoration: none;">
                    View in Admin Dashboard
                  </a>
                </td>
              </tr>
            </table>
          `,
          { headerLogoWidth: 192, headerBackground: "#f9fafb", headerBorderBottomColor: "#e5e7eb" },
        ),
      });

      console.log("Admin notification emails sent");
      return true;
    } catch (error) {
      console.error("Failed to send admin notification emails:", error);
      return false;
    }
  },

  /**
   * Sends case closed notification email to the reporter
   * @param params - Email parameters including feedback details
   * @returns Promise<boolean> - Whether the email was sent successfully
   */
  async sendCaseClosedEmail(params: {
    email: string;
    referenceId: string;
  }): Promise<boolean> {
    const { email, referenceId } = params;
    const appUrl = getAppUrl();

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: `Case Resolved - Reference: ${referenceId}`,
        html: renderEmailLayout(
          `
            <h1 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0;">Your Case Has Been Resolved</h1>
            <p>Dear Respondent,</p>
            <p>We are pleased to inform you that your feedback submission has been reviewed and the case has been resolved.</p>
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <p style="margin: 0 0 8px 0;"><strong>Reference Number:</strong> ${referenceId}</p>
              <p style="margin: 0;"><strong>Status:</strong> Closed</p>
            </div>
            <p>Thank you for taking the time to share your feedback with us. Your input is valuable in helping us improve healthcare services for everyone.</p>
            <p>If you have any further concerns or would like to provide additional feedback, please don't hesitate to submit a new report through our portal.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 30px auto;">
              <tr>
                <td align="center" bgcolor="${BRAND_PRIMARY}" style="border-radius: 8px;">
                  <a href="${appUrl}" 
                     style="display: inline-block; padding: 14px 28px; font-weight: bold; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; text-decoration: none;">
                    Visit ${emailBrandText}
                  </a>
                </td>
              </tr>
            </table>
            <p>Best regards,<br>The ${emailBrandText} Team</p>
          `,
          { headerLogoWidth: 236 },
        ),
      });

      console.log(`Case closed email sent to ${email} for ${referenceId}`);
      return true;
    } catch (error) {
      console.error("Failed to send case closed email:", error);
      return false;
    }
  },

  /**
   * Sends all feedback-related emails (confirmation, follow-up, admin notification)
   * This is the main method to call after feedback is created
   * @param params - Complete feedback email parameters
   * @returns Promise with status of each email type
   */
  async sendFeedbackEmails(params: {
    email: string;
    referenceId: string;
    feedbackId: string;
    feedbackType: string;
  }): Promise<{
    confirmationSent: boolean;
    followupSent: boolean;
    adminNotificationSent: boolean;
  }> {
    const { email, referenceId, feedbackId, feedbackType } = params;

    const [confirmationSent, adminNotificationSent] = await Promise.all([
      this.sendFeedbackConfirmation({ email, referenceId, feedbackId }),
      this.sendAdminNotification({ referenceId, feedbackType, feedbackId }),
    ]);

    try {
      await prisma.feedbackSubmission.update({
        where: { id: feedbackId },
        data: {
          confirmation_email_sent: confirmationSent,
          followup_email_sent: false,
        },
      });
    } catch (error) {
      console.error("Failed to update feedback email status:", error);
    }

    return { confirmationSent, followupSent: false, adminNotificationSent };
  },
};
