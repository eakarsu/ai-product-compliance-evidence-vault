import { NextRequest, NextResponse } from 'next/server';
import { getEntitySet } from '@/lib/entityStore';
import { filterEntityRows, recordsToCsv } from '@/lib/featurePack';
import { requireSession } from '@/lib/requestAuth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const format = request.nextUrl.searchParams.get('format') || 'csv';
  if (format !== 'csv' && format !== 'json') {
    return NextResponse.json({ error: 'format must be csv or json' }, { status: 400 });
  }
  const slug = (await params).slug;
  const set = await getEntitySet(slug);
  if (!set) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const rows = filterEntityRows(set.rows, request.nextUrl.searchParams.get('q') || '', request.nextUrl.searchParams.get('status') || 'All');
  if (format === 'json') {
    return new NextResponse(JSON.stringify({ slug, title: set.title, exportedAt: new Date().toISOString(), total: rows.length, records: rows }, null, 2), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="' + slug + '-records.json"' },
    });
  }
  return new NextResponse(recordsToCsv(rows), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="' + slug + '-records.csv"' },
  });
}
