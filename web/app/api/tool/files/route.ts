import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRepoRoot() {
  return process.cwd();
}

function isPathAllowed(targetPath: string) {
  const repoRoot = getRepoRoot();
  const weeklyRoot = path.join(repoRoot, '..', 'weekly');
  const outputRoot = path.join(repoRoot, 'fetch-translate-tool', 'output');
  return targetPath.startsWith(weeklyRoot) || targetPath.startsWith(outputRoot);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const relativePath = searchParams.get('path');

  if (!relativePath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  const repoRoot = getRepoRoot();
  const resolved = path.resolve(repoRoot, relativePath);

  if (!isPathAllowed(resolved)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return NextResponse.json({ error: 'file not found' }, { status: 404 });
  }

  const content = fs.readFileSync(resolved);
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${path.basename(resolved)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
