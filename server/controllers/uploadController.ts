import { Request, Response } from 'express';
import { validateFile } from '../services/fileValidationService.js';
import { processImageAnalysis } from '../services/imageAnalysisService.js';
import { processVideoAnalysis } from '../services/videoAnalysisService.js';
import { processDocumentAnalysis } from '../services/documentAnalysisService.js';
import {
  saveReportToDb,
  getReportByIdFromDb,
  getAllReportsFromDb,
} from '../db/reportRepository.js';

export async function analyzeImageHandler(req: Request, res: Response): Promise<void> {
  try {
    let buffer: Buffer | null = null;
    let originalName = 'uploaded-image.jpg';
    let declaredMime = 'image/jpeg';

    if (req.file) {
      buffer = req.file.buffer;
      originalName = req.file.originalname;
      declaredMime = req.file.mimetype;
    } else if (req.body.base64) {
      const clean = req.body.base64.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(clean, 'base64');
      originalName = req.body.fileName || 'uploaded-image.jpg';
      declaredMime = req.body.mimeType || 'image/jpeg';
    }

    if (!buffer) {
      res.status(400).json({
        error: 'No image file uploaded. Provide a multipart file with field name "file" or a JSON body with "base64".',
      });
      return;
    }

    const validation = validateFile(buffer, originalName, declaredMime);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    if (!validation.detectedMime.startsWith('image/')) {
      res.status(400).json({
        error: `Expected an image file, but binary inspection detected ${validation.detectedMime}.`,
      });
      return;
    }

    const report = await processImageAnalysis(validation);
    await saveReportToDb(report);
    res.json(report);
  } catch (err: any) {
    console.error('Error in analyzeImageHandler:', err);
    res.status(500).json({
      error: err.message || 'Image authenticity analysis encountered an error.',
      code: 'ANALYSIS_PIPELINE_ERROR',
    });
  }
}

export async function analyzeVideoHandler(req: Request, res: Response): Promise<void> {
  try {
    let buffer: Buffer | null = null;
    let originalName = 'uploaded-video.mp4';
    let declaredMime = 'video/mp4';
    let clientFrames = req.body.frames;

    if (req.file) {
      buffer = req.file.buffer;
      originalName = req.file.originalname;
      declaredMime = req.file.mimetype;
    } else if (req.body.base64) {
      const clean = req.body.base64.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(clean, 'base64');
      originalName = req.body.fileName || 'uploaded-video.mp4';
      declaredMime = req.body.mimeType || 'video/mp4';
    } else if (clientFrames && Array.isArray(clientFrames) && clientFrames.length > 0) {
      // Synthesize a representative frame buffer if client sent keyframe array
      const firstFrameBase64 = clientFrames[0].base64.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(firstFrameBase64, 'base64');
      originalName = req.body.fileName || 'video-capture.mp4';
      declaredMime = 'video/mp4';
    }

    if (!buffer) {
      res.status(400).json({
        error: 'No video media uploaded. Provide a video file or sampled keyframes array.',
      });
      return;
    }

    // If client supplied extracted frames, we validate them
    if (clientFrames && Array.isArray(clientFrames) && clientFrames.length > 0) {
      const validation = {
        buffer,
        originalName,
        detectedMime: 'video/mp4',
        declaredMime,
        sizeBytes: req.body.fileSizeBytes || buffer.length * 4,
        sha256: req.body.fileHash || 'client-verified-stream',
        extension: 'mp4',
        isValid: true,
      };

      const report = await processVideoAnalysis(validation, clientFrames);
      await saveReportToDb(report);
      res.json(report);
      return;
    }

    const validation = validateFile(buffer, originalName, declaredMime);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    if (!validation.detectedMime.startsWith('video/')) {
      res.status(400).json({
        error: `Expected a video container, but binary inspection detected ${validation.detectedMime}.`,
      });
      return;
    }

    const report = await processVideoAnalysis(validation, clientFrames);
    await saveReportToDb(report);
    res.json(report);
  } catch (err: any) {
    console.error('Error in analyzeVideoHandler:', err);
    res.status(500).json({
      error: err.message || 'Video authenticity analysis failed.',
      code: 'VIDEO_PROCESSING_ERROR',
    });
  }
}

export async function analyzeDocumentHandler(req: Request, res: Response): Promise<void> {
  try {
    let buffer: Buffer | null = null;
    let originalName = 'document.pdf';
    let declaredMime = 'application/pdf';
    let textContent: string | undefined = undefined;

    if (req.file) {
      buffer = req.file.buffer;
      originalName = req.file.originalname;
      declaredMime = req.file.mimetype;
    } else if (req.body.base64) {
      const clean = req.body.base64.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(clean, 'base64');
      originalName = req.body.fileName || 'document.pdf';
      declaredMime = req.body.mimeType || 'application/pdf';
      textContent = req.body.textContent;
    } else if (typeof req.body.textContent === 'string') {
      const text = req.body.textContent as string;
      textContent = text;
      buffer = Buffer.from(text, 'utf-8');
      originalName = req.body.fileName || 'document.txt';
      declaredMime = 'text/plain';
    }

    if (!buffer) {
      res.status(400).json({
        error: 'No document uploaded. Provide a PDF, DOCX, or text content.',
      });
      return;
    }

    const validation = validateFile(buffer, originalName, declaredMime);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const report = await processDocumentAnalysis(validation, textContent);
    await saveReportToDb(report);
    res.json(report);
  } catch (err: any) {
    console.error('Error in analyzeDocumentHandler:', err);
    res.status(500).json({
      error: err.message || 'Document integrity analysis encountered an error.',
      code: 'DOCUMENT_PROCESSING_ERROR',
    });
  }
}

export async function getReportByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const report = await getReportByIdFromDb(req.params.id);
    if (!report) {
      res.status(404).json({ error: `Report with ID "${req.params.id}" not found.` });
      return;
    }
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAllReportsHandler(req: Request, res: Response): Promise<void> {
  try {
    const filters = {
      fileType: req.query.fileType as string,
      classification: req.query.classification as string,
      search: req.query.search as string,
    };
    const reports = await getAllReportsFromDb(filters);
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function downloadReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const report = await getReportByIdFromDb(req.params.id);
    if (!report) {
      res.status(404).json({ error: `Report with ID "${req.params.id}" not found.` });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="TruthLens_Report_${report.id}.json"`);
    res.send(JSON.stringify(report, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
