import { notFound } from 'next/navigation';
import FeaturePage from '@/components/unified/FeaturePage';
import { aiFeatureRegistry } from '@/lib/unifiedApp';
import { sourceCustomPageRegistry } from '@/lib/sourceCustomFeatures';

export default async function AiFeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = aiFeatureRegistry[(await params).slug] ?? sourceCustomPageRegistry[(await params).slug];
  if (!page) {
    notFound();
  }

  return <FeaturePage slug={(await params).slug} page={page} />;
}
