import { AppError } from "../middleware/errorHandler.js";

/**
 * Allowed file types for voice messages
 */
export const ALLOWED_VOICE_TYPES = [
  'audio/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
];

/**
 * Allowed file types for evidence files
 */
export const ALLOWED_EVIDENCE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  // Audio (for evidence)
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
];

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  voice: 10 * 1024 * 1024, // 10MB for voice messages
  evidence: 10 * 1024 * 1024, // 10MB per evidence file
};

/**
 * Validates voice message file
 * @param file - Multer file object
 * @throws AppError if validation fails
 */
export function validateVoiceFile(file: Express.Multer.File): void {
  if (!file) {
    throw new AppError(400, "NO_FILE", "No voice file provided");
  }

  // Check file size
  if (file.size > FILE_SIZE_LIMITS.voice) {
    throw new AppError(
      400,
      "FILE_TOO_LARGE",
      `Voice file exceeds maximum size of ${FILE_SIZE_LIMITS.voice / (1024 * 1024)}MB`
    );
  }

  // Check file type
  if (!ALLOWED_VOICE_TYPES.includes(file.mimetype)) {
    throw new AppError(
      400,
      "INVALID_FILE_TYPE",
      `Invalid file type. Allowed types: ${ALLOWED_VOICE_TYPES.map(t => t.split('/')[1]).join(', ')}`
    );
  }
}

/**
 * Validates evidence file
 * @param file - Multer file object
 * @throws AppError if validation fails
 */
export function validateEvidenceFile(file: Express.Multer.File): void {
  if (!file) {
    throw new AppError(400, "NO_FILE", "No evidence file provided");
  }

  // Check file size
  if (file.size > FILE_SIZE_LIMITS.evidence) {
    throw new AppError(
      400,
      "FILE_TOO_LARGE",
      `File exceeds maximum size of ${FILE_SIZE_LIMITS.evidence / (1024 * 1024)}MB`
    );
  }

  // Check file type
  if (!ALLOWED_EVIDENCE_TYPES.includes(file.mimetype)) {
    const allowedExtensions = [
      'JPEG', 'JPG', 'PNG', 'GIF', 'WEBP',
      'PDF', 'DOC', 'DOCX',
      'MP4', 'MPEG', 'MOV', 'AVI', 'WEBM',
      'MP3', 'WAV', 'OGG'
    ].join(', ');
    
    throw new AppError(
      400,
      "INVALID_FILE_TYPE",
      `Invalid file type. Allowed types: ${allowedExtensions}`
    );
  }
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validates file extension matches MIME type
 * @param filename - Original filename
 * @param mimetype - MIME type
 * @returns true if extension matches type
 */
export function validateFileExtension(filename: string, mimetype: string): boolean {
  const extension = getFileExtension(filename);
  const typeMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'video/mp4': ['mp4'],
    'video/mpeg': ['mpeg', 'mpg'],
    'video/quicktime': ['mov'],
    'video/x-msvideo': ['avi'],
    'video/webm': ['webm'],
    'audio/webm': ['webm'],
    'audio/mpeg': ['mp3', 'mpeg'],
    'audio/mp3': ['mp3'],
    'audio/wav': ['wav'],
    'audio/ogg': ['ogg'],
    'audio/m4a': ['m4a'],
    'audio/x-m4a': ['m4a'],
    'audio/aac': ['aac'],
  };

  const allowedExtensions = typeMap[mimetype];
  if (!allowedExtensions) return false;
  
  return allowedExtensions.includes(extension);
}
