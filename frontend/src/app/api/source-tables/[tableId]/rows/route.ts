import { NextRequest, NextResponse } from 'next/server';
import { addSourceTableRow, deleteSourceTableRow, listSourceTableRows, updateSourceTableRow } from '@/lib/sourceTableRowsStore';
import { requireSession } from '@/lib/requestAuth';

type RouteContext = {
  params: Promise<{
    tableId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;
  const rows = await listSourceTableRows(decodeURIComponent((await context.params).tableId));
  return NextResponse.json({ rows });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;
  const body = await request.json().catch(() => ({}));
  const row = await addSourceTableRow(decodeURIComponent((await context.params).tableId), body.values || {});
  return NextResponse.json({ row, rows: await listSourceTableRows(decodeURIComponent((await context.params).tableId)) });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;
  const body = await request.json().catch(() => ({}));
  const row = await updateSourceTableRow(decodeURIComponent((await context.params).tableId), body.rowId || '', body.values || {});
  if (!row) return NextResponse.json({ error: 'Row not found' }, { status: 404 });
  return NextResponse.json({ row, rows: await listSourceTableRows(decodeURIComponent((await context.params).tableId)) });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;
  const body = await request.json().catch(() => ({}));
  const ok = await deleteSourceTableRow(decodeURIComponent((await context.params).tableId), body.rowId || '');
  if (!ok) return NextResponse.json({ error: 'Row not found' }, { status: 404 });
  return NextResponse.json({ ok: true, rows: await listSourceTableRows(decodeURIComponent((await context.params).tableId)) });
}
