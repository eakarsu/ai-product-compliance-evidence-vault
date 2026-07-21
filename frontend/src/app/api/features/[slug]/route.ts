import { NextRequest, NextResponse } from 'next/server';
import { aiFeatureRegistry, pageRegistry } from '@/lib/unifiedApp';
import { sourceCustomPageRegistry } from '@/lib/sourceCustomFeatures';

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const page = aiFeatureRegistry[(await params).slug] ?? pageRegistry[(await params).slug] ?? sourceCustomPageRegistry[(await params).slug];
  if (!page) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(page);
}
