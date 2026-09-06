import React from 'react'
import { AppLayout } from '../layout/app-layout'
import { useGetResourceRange } from '@/hooks/use-library'
import PageRender from './page-render'

function LibraryContent() {
     const {
    data: content,
    isLoading,
    error,
  } = useGetResourceRange({
    id: 1,
    start: 0,
    end: 10,
  });

  if (isLoading) {
    return (
      <AppLayout hideHeaderOnZoom>
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-stone-500">
            Loading book...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout hideHeaderOnZoom>
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-red-500">
            Failed to load book.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideHeaderOnZoom>
      <div>
        {content?.map((page, index) => (
            <PageRender key={index} page={page} />
        ))}
      </div>
    </AppLayout>
  );
}

export default LibraryContent