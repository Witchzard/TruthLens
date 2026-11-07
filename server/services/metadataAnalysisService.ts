import exifr from 'exifr';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';

const execFileAsync = promisify(execFile);

export interface ImageMetadataResult {
  hasExif: boolean;
  make?: string;
  model?: string;
  software?: string;
  createDate?: string;
  modifyDate?: string;
  dimensions?: { width?: number; height?: number };
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  hasGps: boolean;
  c2paDetected: boolean;
  c2paDetails?: string;
  rawTagsCount: number;
  forensicNotes: string[];
}

export interface VideoMetadataResult {
  durationSeconds: number;
  width: number;
  height: number;
  resolution: string;
  fps: number;
  videoCodec: string;
  audioCodec?: string;
  hasAudio: boolean;
  bitRate?: number;
  creationTime?: string;
  forensicNotes: string[];
}

export interface DocumentMetadataResult {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modDate?: string;
  revisionCount?: number;
  totalEditingTimeMinutes?: number;
  isEncrypted?: boolean;
  pdfVersion?: string;
  forensicNotes: string[];
}

/**
 * Inspects Image EXIF, TIFF, XMP, IPTC, and C2PA Content Credentials
 */
export async function analyzeImageMetadata(buffer: Buffer): Promise<ImageMetadataResult> {
  const notes: string[] = [];
  let hasExif = false;
  let parsedExif: any = null;

  try {
    parsedExif = await exifr.parse(buffer, {
      tiff: true,
      xmp: true,
      icc: true,
      iptc: true,
      jfif: true,
    });
    hasExif = Boolean(parsedExif && Object.keys(parsedExif).length > 0);
  } catch (err) {
    notes.push('EXIF parsing returned no standard metadata header.');
  }

  // Scan for C2PA JUMBF Box / Content Credentials marker (ISO 19566-5)
  // C2PA manifests contain 'jumb' box type or 'c2pa' claim signature
  const c2paDetected = checkForC2paManifest(buffer);
  let c2paDetails = 'Content Credentials (C2PA) manifest: Not detected. (Standard for most consumer photography, social media re-encodings, and non-signed generative outputs).';

  if (c2paDetected) {
    c2paDetails = 'Content Credentials (C2PA) cryptographic manifest detected. Asset carries provenance assertions or digital signing.';
    notes.push('C2PA provenance manifest discovered in container metadata.');
  }

  const rawTagsCount = parsedExif ? Object.keys(parsedExif).length : 0;

  if (hasExif) {
    if (parsedExif.Software) {
      notes.push(`Editing software identified in metadata: "${parsedExif.Software}".`);
    }
    if (parsedExif.Make || parsedExif.Model) {
      notes.push(`Hardware capture device: ${parsedExif.Make || ''} ${parsedExif.Model || ''}`.trim());
    }
    if (parsedExif.CreateDate && parsedExif.ModifyDate) {
      const created = new Date(parsedExif.CreateDate).getTime();
      const modified = new Date(parsedExif.ModifyDate).getTime();
      if (!isNaN(created) && !isNaN(modified) && modified - created > 60000) {
        notes.push(`Creation timestamp differs from modification timestamp by ${Math.round((modified - created) / 60000)} minutes.`);
      }
    }
  } else {
    notes.push('No EXIF metadata found. Notice: Missing EXIF is normal for social media uploads (WhatsApp, Twitter, Reddit strip metadata) and does NOT alone establish manipulation.');
  }

  return {
    hasExif,
    make: parsedExif?.Make,
    model: parsedExif?.Model,
    software: parsedExif?.Software,
    createDate: parsedExif?.CreateDate ? new Date(parsedExif.CreateDate).toISOString() : undefined,
    modifyDate: parsedExif?.ModifyDate ? new Date(parsedExif.ModifyDate).toISOString() : undefined,
    dimensions: {
      width: parsedExif?.ImageWidth || parsedExif?.ExifImageWidth,
      height: parsedExif?.ImageHeight || parsedExif?.ExifImageHeight,
    },
    exposureTime: parsedExif?.ExposureTime,
    fNumber: parsedExif?.FNumber,
    iso: parsedExif?.ISO,
    hasGps: Boolean(parsedExif?.latitude || parsedExif?.longitude),
    c2paDetected,
    c2paDetails,
    rawTagsCount,
    forensicNotes: notes,
  };
}

/**
 * Searches buffer for C2PA JUMBF box indicators
 */
function checkForC2paManifest(buffer: Buffer): boolean {
  const scanLimit = Math.min(buffer.length, 1024 * 512); // Check first 512KB
  const slice = buffer.subarray(0, scanLimit);

  // Look for 'jumb' (6A 75 6D 62) or 'c2pa' (63 32 70 61) box type identifiers
  const jumbIndex = slice.indexOf(Buffer.from('jumb', 'ascii'));
  const c2paIndex = slice.indexOf(Buffer.from('c2pa', 'ascii'));

  return jumbIndex !== -1 || c2paIndex !== -1;
}

/**
 * Inspects Video metadata using system ffprobe
 */
export async function analyzeVideoMetadata(videoPath: string): Promise<VideoMetadataResult> {
  const notes: string[] = [];

  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      videoPath,
    ]);

    const data = JSON.parse(stdout);
    const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
    const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');

    const durationSeconds = parseFloat(data.format?.duration || videoStream?.duration || '0');
    const width = parseInt(videoStream?.width || '0', 10);
    const height = parseInt(videoStream?.height || '0', 10);
    const resolution = `${width}x${height}`;

    // Compute FPS
    let fps = 30;
    if (videoStream?.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split('/');
      if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
        fps = Math.round((parseInt(parts[0], 10) / parseInt(parts[1], 10)) * 10) / 10;
      }
    }

    const videoCodec = videoStream?.codec_name || 'unknown';
    const audioCodec = audioStream?.codec_name;
    const hasAudio = Boolean(audioStream);
    const bitRate = parseInt(data.format?.bit_rate || '0', 10);
    const creationTime = data.format?.tags?.creation_time;

    notes.push(`Container format: ${data.format?.format_name || 'mp4'} · Video Codec: ${videoCodec.toUpperCase()} · Framerate: ${fps} fps`);

    if (hasAudio) {
      notes.push(`Audio stream present: ${audioCodec?.toUpperCase()} (${audioStream?.sample_rate || 44100} Hz).`);
    } else {
      notes.push('No audio stream detected in video container.');
    }

    if (creationTime) {
      notes.push(`Container creation timestamp: ${creationTime}`);
    }

    return {
      durationSeconds: Math.round(durationSeconds * 10) / 10,
      width,
      height,
      resolution,
      fps,
      videoCodec,
      audioCodec,
      hasAudio,
      bitRate,
      creationTime,
      forensicNotes: notes,
    };
  } catch (err: any) {
    notes.push(`ffprobe inspection encountered an issue: ${err.message || 'Inspection failed'}`);
    return {
      durationSeconds: 0,
      width: 0,
      height: 0,
      resolution: 'Unknown',
      fps: 0,
      videoCodec: 'unknown',
      hasAudio: false,
      forensicNotes: notes,
    };
  }
}

/**
 * Inspects DOCX internal XML metadata using AdmZip
 */
export function analyzeDocxMetadata(buffer: Buffer): DocumentMetadataResult {
  const notes: string[] = [];
  try {
    const zip = new AdmZip(buffer);
    const coreXml = zip.readAsText('docProps/core.xml');
    const appXml = zip.readAsText('docProps/app.xml');

    const author = extractTag(coreXml, 'dc:creator');
    const modBy = extractTag(coreXml, 'cp:lastModifiedBy');
    const creationDate = extractTag(coreXml, 'dcterms:created');
    const modDate = extractTag(coreXml, 'dcterms:modified');
    const revision = parseInt(extractTag(coreXml, 'cp:revision') || '1', 10);
    const totalTime = parseInt(extractTag(appXml, 'TotalTime') || '0', 10);
    const app = extractTag(appXml, 'Application');

    if (app) notes.push(`Document created/edited with: ${app}.`);
    if (author) notes.push(`Original author: ${author}.`);
    if (modBy && modBy !== author) notes.push(`Last modified by different entity: ${modBy}.`);
    if (revision > 1) notes.push(`Document revision count: ${revision} edits recorded.`);
    if (totalTime > 0) notes.push(`Total tracked editing duration: ${totalTime} minutes.`);

    return {
      author,
      creator: author,
      producer: app,
      creationDate,
      modDate,
      revisionCount: revision,
      totalEditingTimeMinutes: totalTime,
      forensicNotes: notes,
    };
  } catch (err: any) {
    notes.push('Unable to read DOCX internal XML properties.');
    return {
      forensicNotes: notes,
    };
  }
}

function extractTag(xml: string, tag: string): string | undefined {
  if (!xml) return undefined;
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : undefined;
}
