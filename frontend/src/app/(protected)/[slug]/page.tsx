import { notFound } from 'next/navigation';
import FeaturePage from '@/components/unified/FeaturePage';
import { pageRegistry } from '@/lib/unifiedApp';

export default async function SuitePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = pageRegistry[(await params).slug];
  if (!page) {
    notFound();
  }

  return <FeaturePage slug={(await params).slug} page={page} />;
}
