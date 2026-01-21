'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ViewerAccess } from '@/lib/auth';
import type { LockedProject } from '@/lib/auth/types';
import ProjectSelectionModal from '@/components/ProjectSelectionModal';

interface AdminDashboardProps {
  adminEmail: string;
}

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  const [viewers, setViewers] = useState<ViewerAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedViewer, setSelectedViewer] = useState<ViewerAccess | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'edit'>('approve');
  const [lockedProjects, setLockedProjects] = useState<LockedProject[]>([]);

  const fetchViewers = useCallback(async () => {
    try {
      const res = await fetch('/admin/api/viewers');
      const data = await res.json();
      setViewers(data.viewers || []);
    } catch (error) {
      console.error('Failed to fetch viewers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViewers();
  }, [fetchViewers]);

  useEffect(() => {
    fetchLockedProjects();
  }, []);

  const fetchLockedProjects = async () => {
    try {
      const response = await fetch('/admin/api/locked-projects');
      if (response.ok) {
        const data = await response.json();
        setLockedProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch locked projects:', error);
    }
  };

  const openApproveModal = (viewer: ViewerAccess) => {
    setSelectedViewer(viewer);
    setModalMode('approve');
    setShowProjectModal(true);
  };

  const openEditModal = (viewer: ViewerAccess) => {
    setSelectedViewer(viewer);
    setModalMode('edit');
    setShowProjectModal(true);
  };

  const handleApproveWithProjects = async (email: string, projects: string[]) => {
    try {
      // First approve the viewer
      const approveResponse = await fetch('/admin/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!approveResponse.ok) {
        throw new Error('Failed to approve viewer');
      }

      // Then set their project access
      const updateResponse = await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projects }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update project access');
      }

      // Close modal and refresh
      setShowProjectModal(false);
      setSelectedViewer(null);
      fetchViewers();
    } catch (error) {
      console.error('Failed to approve with projects:', error);
    }
  };

  const handleEditProjects = async (email: string, projects: string[]) => {
    try {
      const response = await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projects }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project access');
      }

      setShowProjectModal(false);
      setSelectedViewer(null);
      fetchViewers();
    } catch (error) {
      console.error('Failed to update projects:', error);
    }
  };

  const handleApprove = async (email: string) => {
    setActionLoading(email);
    try {
      const res = await fetch('/admin/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        await fetchViewers();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (email: string) => {
    setActionLoading(email);
    try {
      const res = await fetch('/admin/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deny: true }),
      });
      if (res.ok) {
        await fetchViewers();
      }
    } catch (error) {
      console.error('Failed to deny:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (email: string) => {
    if (!confirm(`Revoke access for ${email}? This will log them out of all sessions.`)) {
      return;
    }
    setActionLoading(email);
    try {
      const res = await fetch('/admin/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        await fetchViewers();
      }
    } catch (error) {
      console.error('Failed to revoke:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const pendingViewers = viewers.filter((v) => v.status === 'pending');
  const approvedViewers = viewers.filter((v) => v.status === 'approved');
  const deniedViewers = viewers.filter((v) => v.status === 'denied');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-page pt-[70px]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              Admin Dashboard
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              Logged in as {adminEmail}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading...</div>
        ) : (
          <>
            {/* Pending Requests */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Pending Requests
                {pendingViewers.length > 0 && (
                  <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm px-2 py-0.5 rounded-full">
                    {pendingViewers.length}
                  </span>
                )}
              </h2>
              {pendingViewers.length === 0 ? (
                <p className="text-stone-500 dark:text-stone-400 py-4">
                  No pending requests.
                </p>
              ) : (
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
                  {pendingViewers.map((viewer) => (
                    <div
                      key={viewer.email}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                          {viewer.email}
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Requested {formatDate(viewer.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openApproveModal(viewer)}
                          disabled={actionLoading === viewer.email}
                          className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === viewer.email ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeny(viewer.email)}
                          disabled={actionLoading === viewer.email}
                          className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === viewer.email ? '...' : 'Deny'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Approved Viewers */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Approved Viewers
                {approvedViewers.length > 0 && (
                  <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-2 py-0.5 rounded-full">
                    {approvedViewers.length}
                  </span>
                )}
              </h2>
              {approvedViewers.length === 0 ? (
                <p className="text-stone-500 dark:text-stone-400 py-4">
                  No approved viewers yet.
                </p>
              ) : (
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
                  {approvedViewers.map((viewer) => (
                    <div
                      key={viewer.email}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                          {viewer.email}
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Approved {viewer.approvedAt ? formatDate(viewer.approvedAt) : 'N/A'}
                          {viewer.expiresAt && (
                            <span className="ml-2">
                              · Expires {formatDate(viewer.expiresAt)}
                            </span>
                          )}
                        </p>
                        {viewer.status === 'approved' && (
                          <p className="text-sm text-stone-500 dark:text-stone-500">
                            Access: {viewer.projects.length === 0
                              ? 'All projects'
                              : viewer.projects.length === 1
                                ? lockedProjects.find(p => p.id === viewer.projects[0])?.title || viewer.projects[0]
                                : `${viewer.projects.length} projects`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        {viewer.status === 'approved' && (
                          <button
                            onClick={() => openEditModal(viewer)}
                            className="px-3 py-1 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            Edit Access
                          </button>
                        )}
                        <button
                          onClick={() => handleRevoke(viewer.email)}
                          disabled={actionLoading === viewer.email}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading === viewer.email ? '...' : 'Revoke'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Denied Viewers */}
            {deniedViewers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                  Denied
                  <span className="ml-2 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm px-2 py-0.5 rounded-full">
                    {deniedViewers.length}
                  </span>
                </h2>
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
                  {deniedViewers.map((viewer) => (
                    <div
                      key={viewer.email}
                      className="flex items-center justify-between p-4 opacity-60"
                    >
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                          {viewer.email}
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Requested {formatDate(viewer.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApprove(viewer.email)}
                        disabled={actionLoading === viewer.email}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium disabled:opacity-50"
                      >
                        {actionLoading === viewer.email ? '...' : 'Approve'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showProjectModal && selectedViewer && (
        <ProjectSelectionModal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedViewer(null);
          }}
          onConfirm={async (projects) => {
            if (modalMode === 'approve') {
              await handleApproveWithProjects(selectedViewer.email, projects);
            } else {
              await handleEditProjects(selectedViewer.email, projects);
            }
          }}
          viewerEmail={selectedViewer.email}
          currentProjects={selectedViewer.projects}
          requestedProject={selectedViewer.requestedProject}
          mode={modalMode}
          lockedProjects={lockedProjects}
        />
      )}
    </div>
  );
}
