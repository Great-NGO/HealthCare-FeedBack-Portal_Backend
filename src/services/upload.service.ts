import { supabaseAdmin } from "../config/database.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload service
 * Handles file uploads to Supabase Storage
 * Uses Prisma for database records
 */
export const uploadService = {
  /**
   * Uploads a voice message to storage
   * @param fileBuffer - File buffer
   * @param contentType - MIME type
   * @returns Public URL of uploaded file
   */
  async uploadVoiceMessage(
    fileBuffer: Buffer,
    contentType: string = "audio/webm"
  ): Promise<string> {
    const fileName = `voice-${Date.now()}-${uuidv4()}.webm`;
    const filePath = `voice-messages/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from("feedback-files")
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new AppError(500, "UPLOAD_ERROR", `Failed to upload voice message: ${error.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("feedback-files")
      .getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Uploads an evidence file to storage
   * @param feedbackId - Associated feedback ID
   * @param fileBuffer - File buffer
   * @param fileName - Original file name
   * @param contentType - MIME type
   * @param fileSize - File size in bytes
   * @returns Evidence record
   */
  async uploadEvidence(
    feedbackId: string,
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    fileSize: number
  ): Promise<{ id: string; file_url: string }> {
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `evidence/${feedbackId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("feedback-files")
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new AppError(500, "UPLOAD_ERROR", `Failed to upload evidence: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("feedback-files")
      .getPublicUrl(filePath);

    // Create evidence record in database using Prisma
    const evidence = await prisma.feedbackEvidence.create({
      data: {
        feedback_id: feedbackId,
        file_name: fileName,
        file_url: publicUrl,
        file_type: contentType,
        file_size: fileSize,
      },
      select: {
        id: true,
        file_url: true,
      },
    });

    return evidence;
  },
};
