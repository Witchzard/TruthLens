import crypto from 'crypto';
import path from 'path';
import { ValidatedFile } from '../types/forensic.js';

const MAX_FILE_SIZE = 35 * 1024 * 1024; // 35MB

/**
 * Validates file signature (magic numbers), detects true MIME type, computes SHA-256 hash.
 * Never trusts client-reported MIME type.
 */
export function validateFile(buffer: Buffer, originalName: string, declaredMime: string): ValidatedFile {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const sizeBytes = buffer.length;
  const ext = path.extname(originalName).toLowerCase().replace(/^\./, '');

  if (!buffer || buffer.length === 0) {
    return {
      buffer,
      originalName,
      detectedMime: 'application/octet-stream',
      declaredMime,
      sizeBytes: 0,
      sha256,
      extension: ext,
      isValid: false,
      error: 'File content is empty (0 bytes).',
    };
  }

  if (sizeBytes > MAX_FILE_SIZE) {
    return {
      buffer,
      originalName,
      detectedMime: 'application/octet-stream',
      declaredMime,
      sizeBytes,
      sha256,
      extension: ext,
      isValid: false,
      error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 35 MB.`,
    };
  }

  const detectedMime = detectMimeFromMagicBytes(buffer, ext);

  if (!detectedMime) {
    return {
      buffer,
      originalName,
      detectedMime: 'application/octet-stream',
      declaredMime,
      sizeBytes,
      sha256,
      extension: ext,
      isValid: false,
      error: `Unrecognized or invalid file signature. The file does not conform to supported JPG, PNG, WEBP, MP4, WEBM, MOV, PDF, DOCX, or TXT formats.`,
    };
  }

  // Cross-verify extension compatibility
  const isCompatible = checkExtensionMatchesMime(ext, detectedMime);
  if (!isCompatible) {
    return {
      buffer,
      originalName,
      detectedMime,
      declaredMime,
      sizeBytes,
      sha256,
      extension: ext,
      isValid: false,
      error: `File signature mismatch: File extension ".${ext}" does not match detected binary structure (${detectedMime}). Possible disguised executable or misnamed container.`,
    };
  }

  return {
    buffer,
    originalName,
    detectedMime,
    declaredMime,
    sizeBytes,
    sha256,
    extension: ext,
    isValid: true,
  };
}

function detectMimeFromMagicBytes(buffer: Buffer, extHint: string): string | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: 'RIFF' .... 'WEBP'
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  // PDF: %PDF- (25 50 44 46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // DOCX / ZIP: 50 4B 03 04 (PK..)
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    // Check if it's a docx or generic zip
    const headStr = buffer.subarray(0, Math.min(buffer.length, 2048)).toString('ascii');
    if (headStr.includes('word/') || headStr.includes('[Content_Types].xml') || extHint === 'docx') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  }

  // MP4 / MOV: check for 'ftyp' at offset 4
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('ascii').toLowerCase();
    if (brand.includes('qt')) {
      return 'video/quicktime';
    }
    return 'video/mp4';
  }

  // WebM / Matroska: 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return 'video/webm';
  }

  // Plain Text: if hint is txt/text/log/md, or if all sample bytes are valid printable ASCII / UTF-8
  if (['txt', 'text', 'log', 'md', ''].includes(extHint) || extHint.length === 0) {
    let isText = true;
    const checkLen = Math.min(buffer.length, 4096);
    for (let i = 0; i < checkLen; i++) {
      const byte = buffer[i];
      // Byte 0 is null byte, binary file indicator
      if (byte === 0) {
        isText = false;
        break;
      }
    }
    if (isText && buffer.length > 0) return 'text/plain';
  }

  return null;
}

function checkExtensionMatchesMime(ext: string, detectedMime: string): boolean {
  switch (detectedMime) {
    case 'image/jpeg':
      return ['jpg', 'jpeg', 'jpe'].includes(ext);
    case 'image/png':
      return ext === 'png';
    case 'image/webp':
      return ext === 'webp';
    case 'application/pdf':
      return ext === 'pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return ext === 'docx';
    case 'video/mp4':
      return ['mp4', 'm4v'].includes(ext);
    case 'video/webm':
      return ext === 'webm';
    case 'video/quicktime':
      return ['mov', 'qt', 'mp4'].includes(ext);
    case 'text/plain':
      return ['txt', 'text', 'log', 'md', ''].includes(ext);
    default:
      return false;
  }
}
