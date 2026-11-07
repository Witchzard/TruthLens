import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  analyzeImageHandler,
  analyzeVideoHandler,
  analyzeDocumentHandler,
  getReportByIdHandler,
  getAllReportsHandler,
  downloadReportHandler,
} from './server/controllers/uploadController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 50MB limits for base64 / frame arrays
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup multer memory storage with 35MB limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 35 * 1024 * 1024,
  },
});

// Middleware to safely wrap multer upload so multer errors return clean JSON instead of crashing or falling through
const uploadSingleFile = (fieldName = 'file') => {
  const multerHandler = upload.single(fieldName);
  return (req: Request, res: Response, next: express.NextFunction) => {
    multerHandler(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          res.status(400).json({
            error: `File upload error: ${err.message} (${err.code})`,
            code: err.code,
          });
          return;
        }
        res.status(400).json({
          error: err.message || 'File upload processing failed.',
          code: 'UPLOAD_ERROR',
        });
        return;
      }
      next();
    });
  };
};

// Health check endpoint
app.get(['/api/health', '/api/health/'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'TruthLens AI',
    engineVersion: '2.4.0-forensic',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    ffmpegAvailable: true,
    supportedModalities: ['image', 'video', 'document'],
    timestamp: new Date().toISOString(),
  });
});

// Modular REST API Endpoints with trailing-slash tolerance
app.post(['/api/analyze/image', '/api/analyze/image/'], uploadSingleFile('file'), analyzeImageHandler);
app.post(['/api/analyze/video', '/api/analyze/video/'], uploadSingleFile('file'), analyzeVideoHandler);
app.post(['/api/analyze/document', '/api/analyze/document/'], uploadSingleFile('file'), analyzeDocumentHandler);

app.get(['/api/reports', '/api/reports/'], getAllReportsHandler);
app.get(['/api/reports/:id', '/api/reports/:id/'], getReportByIdHandler);
app.get(['/api/reports/:id/download', '/api/reports/:id/download/'], downloadReportHandler);

// Backward-compatible fallback routes
app.post(['/api/analyze-video', '/api/analyze-video/'], uploadSingleFile('file'), analyzeVideoHandler);
app.post(['/api/analyze-document', '/api/analyze-document/'], uploadSingleFile('file'), analyzeDocumentHandler);
app.post(['/api/analyze-image', '/api/analyze-image/'], uploadSingleFile('file'), analyzeImageHandler);

app.post(['/api/analyze', '/api/analyze/'], uploadSingleFile('file'), async (req: Request, res: Response): Promise<void> => {
  const mime = req.file?.mimetype || req.body?.mimeType || '';
  const originalName = req.file?.originalname || req.body?.fileName || '';
  const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(originalName);
  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(originalName);

  if (isImage) {
    return analyzeImageHandler(req, res);
  } else if (isVideo) {
    return analyzeVideoHandler(req, res);
  } else {
    return analyzeDocumentHandler(req, res);
  }
});

// CRITICAL: Strict JSON 404 handler for any unmatched /api route.
// Prevents API calls from ever falling through to vite.middlewares and returning index.html
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
    availableEndpoints: [
      'POST /api/analyze/document',
      'POST /api/analyze/image',
      'POST /api/analyze/video',
      'POST /api/analyze',
      'GET /api/reports',
      'GET /api/reports/:id',
      'GET /api/reports/:id/download',
      'GET /api/health',
    ],
  });
});

// CRITICAL: Global error-handling middleware for all /api routes.
// Ensures any thrown error is ALWAYS returned as valid JSON, never HTML.
app.use('/api', (err: any, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('API Error handler intercepted error:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred during media verification.',
    code: err.code || 'API_INTERNAL_ERROR',
  });
});

// Start server with Vite dev middleware in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthLens AI Forensic Server running on http://0.0.0.0:${PORT} [mode: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TruthLens AI server:', err);
  process.exit(1);
});
