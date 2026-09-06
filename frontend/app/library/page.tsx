"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import LibraryContent from "@/components/library/library-content"
export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <LibraryContent />
    </ProtectedRoute>
  );
}
