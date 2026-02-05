import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = jobStore.get(params.id);
  if (!job) {
    return NextResponse.json({ error: 'job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
}
