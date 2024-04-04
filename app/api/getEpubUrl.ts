import { NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function GET() {
  const dir = await fs.readdir('public');
  const epubFiles = dir.filter((file) => file.endsWith('.epub'));
  
  if (epubFiles.length === 0) {
    return NextResponse.json(null);
  }
  
  const latestEpubFile = epubFiles.sort().pop();
  const epubUrl = `/${latestEpubFile}`;
  
  return NextResponse.json(epubUrl);
}