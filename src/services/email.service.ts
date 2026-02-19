import { Resend } from "resend";
import { prisma } from "../config/prisma.js";

/**
 * Initialize Resend client
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sender address
 */
const EMAIL_FROM = "MYvoiceMYhealth <no-reply@healthcare-feedback.i4nnova.com>";

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

/** Brand colors for email templates (aligned with app) */
const BRAND_PRIMARY = "#1E6B4A"; // primary green
const BRAND_PRIMARY_SOFT = "#DCFCE7"; // soft green background

/** Logo HTML for email headers (logo image only) */
const getEmailHeaderLogo = (heightPx = 56) =>
  `<img src="${getLogoUrl()}" alt="MYvoiceMYhealth" style="height: ${heightPx}px; max-width: 100%; width: auto; display: block; margin: 0 auto;" />`;

/** Two-tone brand text for light backgrounds (MyVoice #505050, MyHealth #1E6B4A) */
const emailBrandText = '<span style="color: #505050;">MyVoice</span><span style="color: #1E6B4A;">MyHealth</span>';

/**
 * Brand footer for emails – uses logo image and brand colors
 */
const brandFooter = `
  <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-top: 3px solid #1E6B4A; text-align: center;">
    <div style="margin-bottom: 15px;">
      <div style="font-size: 20px; font-weight: bold; font-family: Arial, sans-serif;">${emailBrandText}</div>
    </div>
    <p style="color: #475569; font-size: 14px; margin: 0 0 10px 0;">
      Your Voice Matters in Healthcare
    </p>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      This is an automated message from ${emailBrandText}. Please do not reply directly to this email.
    </p>
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} ${emailBrandText}. All rights reserved.
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
    const { email, fullName, role, password, loginUrl = `${getAppUrl()}/admin/login` } = params;

    try {
      const roleDisplay = role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: "You've Been Added as an Admin - MYvoiceMYhealth",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0; background-color: ${BRAND_PRIMARY}; margin-bottom: 30px;">
              ${getEmailHeaderLogo(64)}
            </div>
            <h1 style="color: ${BRAND_PRIMARY};">Welcome to the Admin Team!</h1>
            <p>Hello${fullName ? ` ${fullName}` : ''},</p>
            <p>You have been added as an administrator to the MYvoiceMYhealth platform.</p>
            
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
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: ${BRAND_PRIMARY}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
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
    const { email, fullName, resetToken, resetUrl = `${getAppUrl()}/admin/reset-password` } = params;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: "Password Reset - MYvoiceMYhealth",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0; background-color: ${BRAND_PRIMARY}; margin-bottom: 30px;">
              ${getEmailHeaderLogo(64)}
            </div>
            <h1 style="color: ${BRAND_PRIMARY};">Password Reset Request</h1>
            <p>Hello${fullName ? ` ${fullName}` : ''},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}?token=${resetToken}" 
                 style="background-color: ${BRAND_PRIMARY}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0; background-color: ${BRAND_PRIMARY}; margin-bottom: 30px;">
              ${getEmailHeaderLogo(64)}
            </div>
            <h1 style="color: ${BRAND_PRIMARY};">Thank You for Your Feedback</h1>
            <p>We have successfully received your feedback submission.</p>
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <p style="margin: 0;"><strong>Reference Number:</strong> ${referenceId}</p>
            </div>
            <p>Please keep this reference number for your records. You can use it to track the status of your submission.</p>
            <p>Our team will review your feedback and take appropriate action.</p>
            ${brandFooter}
          </div>
        `,
      });

      console.log(`Feedback confirmation email sent to ${email} for ${referenceId}`);
      return true;
    } catch (error) {
      console.error("Failed to send feedback confirmation email:", error);
      return false;
    }
  },

  /**
   * Sends follow-up email with survey link to the reporter
   * @param params - Email parameters including survey token
   * @returns Promise<boolean> - Whether the email was sent successfully
   */
  async sendFeedbackFollowup(params: {
    email: string;
    referenceId: string;
    surveyToken: string;
  }): Promise<boolean> {
    const { email, referenceId, surveyToken } = params;
    const appUrl = getAppUrl();
    const surveyLink = `${appUrl}/survey?token=${surveyToken}`;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: `Follow Up on Feedback (Reference: ${referenceId})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0; background-color: ${BRAND_PRIMARY}; margin-bottom: 30px;">
              ${getEmailHeaderLogo(64)}
            </div>
            <h1 style="color: ${BRAND_PRIMARY};">We Value Your Opinion</h1>
            <p>Thank you for submitting your feedback (Reference: <strong>${referenceId}</strong>).</p>
            <p>To help us continuously improve our services, we'd appreciate if you could take a moment to complete a brief survey about your experience.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${surveyLink}" 
                 style="background-color: ${BRAND_PRIMARY}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Complete Survey
              </a>
            </div>
            <p style="color: #e5f6ed; font-size: 14px;">
              This survey should only take 2-3 minutes to complete.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              <a href="${surveyLink}" style="color: ${BRAND_PRIMARY};">${surveyLink}</a>
            </p>
            ${brandFooter}
          </div>
        `,
      });

      console.log(`Feedback follow-up email sent to ${email} for ${referenceId}`);
      return true;
    } catch (error) {
      console.error("Failed to send feedback follow-up email:", error);
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

      const adminEmails = admins.map((a) => a.email);
      const appUrl = getAppUrl();
      const feedbackTypeLabel = feedbackType
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      console.log(`Sending admin notifications to ${adminEmails.length} admin(s)`);

      await resend.emails.send({
        from: EMAIL_FROM,
        to: adminEmails,
        subject: `New ${feedbackTypeLabel} Submitted - Reference: ${referenceId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 16px 0; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px;">
              ${getEmailHeaderLogo(32)}
            </div>
            <h1 style="color: ${BRAND_PRIMARY}; text-align: center; margin: 0 0 16px 0;">New Feedback Submission</h1>
            <p>A new ${feedbackTypeLabel.toLowerCase()} has been submitted and requires your attention.</p>
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <p style="margin: 0 0 8px 0;"><strong>Reference Number:</strong> ${referenceId}</p>
              <p style="margin: 0;"><strong>Type:</strong> ${feedbackTypeLabel}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/admin/feedback/${feedbackId}" 
                 style="background-color: ${BRAND_PRIMARY}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                View in Admin Dashboard
              </a>
            </div>
            ${brandFooter}
          </div>
        `,
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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px 0; background-color: ${BRAND_PRIMARY}; margin-bottom: 30px;">
              ${getEmailHeaderLogo(44)}
            </div>
            <h1 style="color: ${BRAND_PRIMARY};">Your Case Has Been Resolved</h1>
            <p>Dear Respondent,</p>
            <p>We are pleased to inform you that your feedback submission has been reviewed and the case has been resolved.</p>
            <div style="background-color: ${BRAND_PRIMARY_SOFT}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_PRIMARY};">
              <p style="margin: 0 0 8px 0;"><strong>Reference Number:</strong> ${referenceId}</p>
              <p style="margin: 0;"><strong>Status:</strong> Closed</p>
            </div>
            <p>Thank you for taking the time to share your feedback with us. Your input is valuable in helping us improve healthcare services for everyone.</p>
            <p>If you have any further concerns or would like to provide additional feedback, please don't hesitate to submit a new report through our portal.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}" 
                 style="background-color: ${BRAND_PRIMARY}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Visit ${emailBrandText}
              </a>
            </div>
            <p>Best regards,<br>The ${emailBrandText} Team</p>
            ${brandFooter}
          </div>
        `,
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
    surveyToken: string;
    feedbackType: string;
  }): Promise<{
    confirmationSent: boolean;
    followupSent: boolean;
    adminNotificationSent: boolean;
  }> {
    const { email, referenceId, feedbackId, surveyToken, feedbackType } = params;

    // Send all emails in parallel for better performance
    const [confirmationSent, followupSent, adminNotificationSent] = await Promise.all([
      this.sendFeedbackConfirmation({ email, referenceId, feedbackId }),
      this.sendFeedbackFollowup({ email, referenceId, surveyToken }),
      this.sendAdminNotification({ referenceId, feedbackType, feedbackId }),
    ]);

    // Update feedback record with email status
    try {
      await prisma.feedbackSubmission.update({
        where: { id: feedbackId },
        data: {
          confirmation_email_sent: confirmationSent,
          followup_email_sent: followupSent,
        },
      });
    } catch (error) {
      console.error("Failed to update feedback email status:", error);
    }

    return { confirmationSent, followupSent, adminNotificationSent };
  },
};
