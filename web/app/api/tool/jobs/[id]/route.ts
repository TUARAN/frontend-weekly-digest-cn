import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface JobRecord {
  id: string;
  createdAt: number;
  status: 'running' | 'done' | 'error';
  total: number;
  done: number;
  logs: string[];
  results: Array<{
    issue?: string;
    url: string;
    success: boolean;
    title?: string;
    filename?: string;
    fileUrl?: string;
    error?: string;
  }>;
}

const jobStore = (globalThis as { __toolJobs?: Map<string, JobRecord> }).__toolJobs ?? new Map<string, JobRecord>();
(globalThis as { __toolJobs?: Map<string, JobRecord> }).__toolJobs = jobStore;

const JOBS_DIR = path.join(process.cwd(), '.tool-jobs');

function jobFilePath(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: 'job id missing' }, { status: 400 });
  }

  const cached = jobStore.get(id);
  if (cached) {
    return NextResponse.json(cached);
  }

  const filePath = jobFilePath(id);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const job = JSON.parse(raw) as JobRecord;
    jobStore.set(id, job);
    return NextResponse.json(job);
  }

  return NextResponse.json({ error: 'job not found' }, { status: 404 });
}
