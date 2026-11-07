import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthenticityReport } from '../types/forensic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'reports.json');

// In-memory cache synced to persistent disk JSON
let reportsCache: AuthenticityReport[] = [];
let initialized = false;

async function ensureDbInitialized(): Promise<void> {
  if (initialized) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      reportsCache = JSON.parse(data);
    } catch {
      // Initialize with empty array if file does not exist
      reportsCache = [];
      await fs.writeFile(DB_FILE, JSON.stringify(reportsCache, null, 2), 'utf-8');
    }
    initialized = true;
  } catch (err) {
    console.error('Failed to initialize reports database:', err);
    reportsCache = [];
    initialized = true;
  }
}

export async function saveReportToDb(report: AuthenticityReport): Promise<void> {
  await ensureDbInitialized();
  // Filter out any existing report with same ID and prepend new one
  reportsCache = [report, ...reportsCache.filter((r) => r.id !== report.id)];

  try {
    await fs.writeFile(DB_FILE, JSON.stringify(reportsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting report to disk:', err);
  }
}

export async function getReportByIdFromDb(id: string): Promise<AuthenticityReport | undefined> {
  await ensureDbInitialized();
  return reportsCache.find((r) => r.id === id);
}

export async function getAllReportsFromDb(filters?: {
  fileType?: string;
  classification?: string;
  search?: string;
}): Promise<AuthenticityReport[]> {
  await ensureDbInitialized();
  let results = [...reportsCache];

  if (filters?.fileType && filters.fileType !== 'all') {
    results = results.filter((r) => r.fileType === filters.fileType);
  }

  if (filters?.classification && filters.classification !== 'all') {
    results = results.filter((r) => r.classification === filters.classification);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.fileName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.classification.toLowerCase().includes(q)
    );
  }

  return results;
}

export async function deleteReportFromDb(id: string): Promise<boolean> {
  await ensureDbInitialized();
  const initialLen = reportsCache.length;
  reportsCache = reportsCache.filter((r) => r.id !== id);

  if (reportsCache.length !== initialLen) {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(reportsCache, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing to reports DB:', err);
      return false;
    }
  }
  return false;
}
