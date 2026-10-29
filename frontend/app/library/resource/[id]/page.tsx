'use client';

import { use } from 'react';
import ResourceContent from '@/components/library/resource-content';

// BOOK READER PAGE at /library/resource/[id]
// Shows a specific book in the reader

export default function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;

  return <ResourceContent bookId={bookId} />;
}
