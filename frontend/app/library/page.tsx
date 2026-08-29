"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/components/auth/auth-provider";

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <LibraryContent />
    </ProtectedRoute>
  );
}

function LibraryContent() {
  const { user } = useAuth();

  return (
    <AppLayout hideHeaderOnZoom={true}>
      <div className="library-page">
        <div className="library-content">
          <div className="library-welcome">
            <h1 className="font-reading">
              Your <em>library</em>
            </h1>
            <p className="library-subtitle">
              Welcome back, {user?.email?.split("@")[0] || "reader"}. Your reading
              space is ready.
            </p>
          </div>

          <div className="library-empty">
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2>Your library is empty</h2>
              <p>Start building your reading collection.</p>
              <button className="add-book-button">Add your first book</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
