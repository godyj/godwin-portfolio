'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ViewerAccess } from '@/lib/auth';
import type { LockedProject, ProjectWithStatus } from '@/lib/auth/types';
import InlineProjectSelector from '@/components/InlineProjectSelector';

// Expiration option type
type ExpirationOption = 'none' | '7days' | '30days' | '90days' | 'custom';

interface AdminDashboardProps {
  adminEmail: string;
}

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  const [viewers, setViewers] = useState<ViewerAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lockedProjects, setLockedProjects] = useState<LockedProject[]>([]);

  // Project Settings state
  const [allProjects, setAllProjects] = useState<ProjectWithStatus[]>([]);
  const [lockLoading, setLockLoading] = useState<string | null>(null);

  // Inline selection state
  const [expandedViewer, setExpandedViewer] = useState<string | null>(null);
  const [pendingSelections, setPendingSelections] = useState<Record<string, {
    selectAll: boolean;
    projects: Set<string>;
  }>>({});

  // Expiration state for pending viewers
  const [pendingExpirations, setPendingExpirations] = useState<Record<string, {
    option: ExpirationOption;
    customDate: string;
  }>>({});

  // Expiration state for editing approved viewers
  const [editExpirations, setEditExpirations] = useState<Record<string, {
    option: ExpirationOption;
    customDate: string;
  }>>({});

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

  const fetchAllProjects = async () => {
    try {
      const res = await fetch('/admin/api/projects');
      const data = await res.json();
      setAllProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch all projects:', error);
    }
  };

  useEffect(() => {
    fetchViewers();
    fetchLockedProjects();
    fetchAllProjects();
  }, [fetchViewers]);

  const handleToggleLock = async (projectId: string, locked: boolean) => {
    setLockLoading(projectId);
    try {
      await fetch('/admin/api/toggle-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, locked }),
      });
      await fetchAllProjects();
      await fetchLockedProjects();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    } finally {
      setLockLoading(null);
    }
  };

  const updatePendingSelection = (email: string, projects: string[]) => {
    setPendingSelections(prev => ({
      ...prev,
      [email]: {
        selectAll: projects.length === 0,
        projects: new Set(projects)
      }
    }));
  };

  const handleApproveWithSelection = async (email: string) => {
    setActionLoading(email);
    try {
      const selection = pendingSelections[email];
      const projects = selection?.selectAll ? [] : Array.from(selection?.projects || []);

      // Get expiration settings
      const expSettings = pendingExpirations[email];
      const expiresAt = expSettings
        ? getExpirationTimestamp(expSettings.option, expSettings.customDate)
        : null;

      // Sequential: approve first, then set projects and expiration
      await fetch('/admin/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projects, expiresAt }),
      });

      await fetchViewers();
      setPendingSelections(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
      setPendingExpirations(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to approve with selection:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const saveProjectChanges = async (email: string) => {
    setActionLoading(email);
    try {
      const selection = pendingSelections[email];
      const projects = selection?.selectAll ? [] : Array.from(selection?.projects || []);

      // Get expiration settings
      const expSettings = editExpirations[email];
      const expiresAt = expSettings
        ? getExpirationTimestamp(expSettings.option, expSettings.customDate)
        : null;

      await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projects, expiresAt }),
      });

      await fetchViewers();
      setExpandedViewer(null);
      setPendingSelections(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
      setEditExpirations(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to save project changes:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const hasChanges = (email: string): boolean => {
    const selection = pendingSelections[email];
    const viewer = approvedViewers.find(v => v.email === email);
    if (!viewer) return false;

    // Check project selection changes
    if (selection) {
      const currentIsAll = viewer.projects.length === 0;
      if (currentIsAll !== selection.selectAll) return true;

      if (!selection.selectAll) {
        const currentSet = new Set(viewer.projects);
        if (currentSet.size !== selection.projects.size) return true;

        for (const id of selection.projects) {
          if (!currentSet.has(id)) return true;
        }
      }
    }

    // Check expiration changes
    const expSettings = editExpirations[email];
    if (expSettings) {
      const currentExpiresAt = viewer.expiresAt;
      const newExpiresAt = getExpirationTimestamp(expSettings.option, expSettings.customDate);

      if (currentExpiresAt !== newExpiresAt) {
        // Handle null comparison
        if (!currentExpiresAt && !newExpiresAt) return false;
        if (!currentExpiresAt || !newExpiresAt) return true;
        // Allow small differences due to timestamp precision
        if (Math.abs(currentExpiresAt - newExpiresAt) > 60000) return true;
      }
    }

    return false;
  };

  const toggleExpanded = (email: string) => {
    if (expandedViewer === email) {
      // Collapsing - discard pending changes
      setExpandedViewer(null);
      setPendingSelections(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
      setEditExpirations(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
    } else {
      // Expanding - initialize with current values
      const viewer = approvedViewers.find(v => v.email === email);
      if (viewer) {
        setPendingSelections(prev => ({
          ...prev,
          [email]: {
            selectAll: viewer.projects.length === 0,
            projects: new Set(viewer.projects)
          }
        }));
        // Initialize expiration state
        setEditExpirations(prev => ({
          ...prev,
          [email]: {
            option: viewer.expiresAt ? 'custom' : 'none',
            customDate: viewer.expiresAt
              ? new Date(viewer.expiresAt).toISOString().split('T')[0]
              : ''
          }
        }));
      }
      setExpandedViewer(email);
    }
  };

  const getProjectTitle = (projectId: string): string => {
    const project = lockedProjects.find(p => p.id === projectId);
    if (!project) return projectId;
    return project.subtitle ? `${project.title} (${project.subtitle})` : project.title;
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

  const handleApproveFromDenied = async (email: string) => {
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

  const handleRemoveProjectAccess = async (email: string, projectId: string) => {
    setActionLoading(email);
    try {
      const viewer = approvedViewers.find(v => v.email === email);
      if (!viewer) return;

      // Remove the project from the viewer's access list
      const updatedProjects = viewer.projects.filter(p => p !== projectId);

      await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projects: updatedProjects }),
      });

      await fetchViewers();
    } catch (error) {
      console.error('Failed to remove project access:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  // Archive handler
  const handleArchive = async (email: string) => {
    if (!confirm(`Archive ${email}? They will be moved to the archived list.`)) {
      return;
    }
    setActionLoading(email);
    try {
      const res = await fetch('/admin/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        await fetchViewers();
      }
    } catch (error) {
      console.error('Failed to archive:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Restore handler
  const handleRestore = async (email: string) => {
    setActionLoading(email);
    try {
      const res = await fetch('/admin/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, restore: true }),
      });
      if (res.ok) {
        await fetchViewers();
      }
    } catch (error) {
      console.error('Failed to restore:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate expiration timestamp from option
  const getExpirationTimestamp = (option: ExpirationOption, customDate: string): number | null => {
    const now = Date.now();
    switch (option) {
      case 'none':
        return null;
      case '7days':
        return now + 7 * 24 * 60 * 60 * 1000;
      case '30days':
        return now + 30 * 24 * 60 * 60 * 1000;
      case '90days':
        return now + 90 * 24 * 60 * 60 * 1000;
      case 'custom':
        return customDate ? new Date(customDate).getTime() : null;
      default:
        return null;
    }
  };

  // Get expiration display text
  const getExpirationDisplay = (expiresAt: number | undefined | null): { text: string; color: string } | null => {
    if (!expiresAt) return null;

    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) {
      return { text: 'Expired', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' };
    }

    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));

    if (days <= 7) {
      return { text: `Expires in ${days} day${days === 1 ? '' : 's'}`, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' };
    }

    return { text: `Expires in ${days} days`, color: 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300' };
  };

  // Set expiration for approved viewer
  const handleSetExpiration = async (email: string) => {
    const expSettings = editExpirations[email];
    if (!expSettings) return;

    setActionLoading(email);
    try {
      const expiresAt = getExpirationTimestamp(expSettings.option, expSettings.customDate);

      await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, expiresAt }),
      });

      await fetchViewers();
    } catch (error) {
      console.error('Failed to set expiration:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingViewers = viewers.filter((v) => v.status === 'pending');
  const approvedViewers = viewers.filter((v) => v.status === 'approved');
  const deniedViewers = viewers.filter((v) => v.status === 'denied');
  const archivedViewers = viewers.filter((v) => v.status === 'archived');

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
            {/* Project Settings */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Project Settings
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Control which projects require authentication to view.
              </p>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
                {allProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {project.title}
                        {project.subtitle && (
                          <span className="text-stone-500 dark:text-stone-400 font-normal">
                            {' '}({project.subtitle})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-stone-500">
                        {project.locked ? 'Locked' : 'Public'}
                      </span>
                      <button
                        onClick={() => handleToggleLock(project.id, !project.locked)}
                        disabled={lockLoading === project.id}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          project.locked
                            ? 'bg-green-600'
                            : 'bg-stone-300 dark:bg-stone-600'
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            project.locked ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

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
                    <div key={viewer.email} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {viewer.email}
                          </p>
                          <p className="text-sm text-stone-500 dark:text-stone-400">
                            Requested {formatDate(viewer.createdAt)}
                            {viewer.requestedProject && (
                              <span> · from {getProjectTitle(viewer.requestedProject)}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Inline project selection */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Grant access to:
                        </p>
                        <InlineProjectSelector
                          lockedProjects={lockedProjects}
                          selectedProjects={viewer.requestedProject ? [viewer.requestedProject] : []}
                          requestedProject={viewer.requestedProject}
                          onChange={(projects) => updatePendingSelection(viewer.email, projects)}
                        />
                      </div>

                      {/* Expiration selection */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Access expiration:
                        </p>
                        <div className="flex flex-wrap gap-3 items-center">
                          <select
                            value={pendingExpirations[viewer.email]?.option || 'none'}
                            onChange={(e) => setPendingExpirations(prev => ({
                              ...prev,
                              [viewer.email]: {
                                option: e.target.value as ExpirationOption,
                                customDate: prev[viewer.email]?.customDate || ''
                              }
                            }))}
                            className="px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                          >
                            <option value="none">No expiration</option>
                            <option value="7days">7 days</option>
                            <option value="30days">30 days</option>
                            <option value="90days">90 days</option>
                            <option value="custom">Custom date</option>
                          </select>
                          {pendingExpirations[viewer.email]?.option === 'custom' && (
                            <input
                              type="date"
                              value={pendingExpirations[viewer.email]?.customDate || ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setPendingExpirations(prev => ({
                                ...prev,
                                [viewer.email]: {
                                  ...prev[viewer.email],
                                  customDate: e.target.value
                                }
                              }))}
                              className="px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                            />
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDeny(viewer.email)}
                          disabled={actionLoading === viewer.email}
                          className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === viewer.email ? '...' : 'Deny'}
                        </button>
                        <button
                          onClick={() => handleApproveWithSelection(viewer.email)}
                          disabled={
                            actionLoading === viewer.email ||
                            (!pendingSelections[viewer.email]?.selectAll &&
                             (pendingSelections[viewer.email]?.projects.size ?? 0) === 0)
                          }
                          className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === viewer.email ? 'Approving...' : 'Approve'}
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
                    <div key={viewer.email} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {viewer.email}
                          </p>
                          <p className="text-sm text-stone-500 dark:text-stone-400">
                            Approved {viewer.approvedAt ? formatDate(viewer.approvedAt) : 'N/A'}
                            {getExpirationDisplay(viewer.expiresAt) && expandedViewer !== viewer.email && (
                              <>
                                {' · '}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getExpirationDisplay(viewer.expiresAt)!.color}`}>
                                  {getExpirationDisplay(viewer.expiresAt)!.text}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => toggleExpanded(viewer.email)}
                            className="px-3 py-1 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            Edit {expandedViewer === viewer.email ? '▲' : '▼'}
                          </button>
                          <button
                            onClick={() => handleArchive(viewer.email)}
                            disabled={actionLoading === viewer.email}
                            className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 text-sm font-medium disabled:opacity-50"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => handleRevoke(viewer.email)}
                            disabled={actionLoading === viewer.email}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === viewer.email ? '...' : 'Revoke'}
                          </button>
                        </div>
                      </div>

                      {/* Access chips and expiration badge - shown when collapsed */}
                      {expandedViewer !== viewer.email && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {viewer.projects.length === 0 ? (
                            // All projects access - single chip, no X button
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                              All projects
                            </span>
                          ) : (
                            // Individual project chips with X buttons
                            viewer.projects.map((projectId) => (
                              <span
                                key={projectId}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                              >
                                {getProjectTitle(projectId)}
                                <button
                                  onClick={() => handleRemoveProjectAccess(viewer.email, projectId)}
                                  disabled={actionLoading === viewer.email}
                                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 disabled:opacity-50"
                                  title={`Remove access to ${getProjectTitle(projectId)}`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      )}

                      {/* Expandable inline editor */}
                      {expandedViewer === viewer.email && (
                        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Access:
                          </p>
                          <InlineProjectSelector
                            lockedProjects={lockedProjects}
                            selectedProjects={viewer.projects}
                            onChange={(projects) => updatePendingSelection(viewer.email, projects)}
                          />

                          {/* Expiration editor */}
                          <div className="mt-4">
                            <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                              Expiration:
                            </p>
                            {/* Warning if already expired */}
                            {viewer.expiresAt && viewer.expiresAt < Date.now() && (
                              <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                                This viewer&apos;s access has expired. Update expiration to restore access.
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3 items-center">
                              <select
                                value={editExpirations[viewer.email]?.option || 'none'}
                                onChange={(e) => setEditExpirations(prev => ({
                                  ...prev,
                                  [viewer.email]: {
                                    option: e.target.value as ExpirationOption,
                                    customDate: prev[viewer.email]?.customDate || ''
                                  }
                                }))}
                                className="px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                              >
                                <option value="none">No expiration</option>
                                <option value="7days">7 days from now</option>
                                <option value="30days">30 days from now</option>
                                <option value="90days">90 days from now</option>
                                <option value="custom">Custom date</option>
                              </select>
                              {editExpirations[viewer.email]?.option === 'custom' && (
                                <input
                                  type="date"
                                  value={editExpirations[viewer.email]?.customDate || ''}
                                  min={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => setEditExpirations(prev => ({
                                    ...prev,
                                    [viewer.email]: {
                                      ...prev[viewer.email],
                                      customDate: e.target.value
                                    }
                                  }))}
                                  className="px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                                />
                              )}
                              {viewer.expiresAt && (
                                <span className="text-sm text-stone-500 dark:text-stone-400">
                                  Currently: {formatDate(viewer.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => saveProjectChanges(viewer.email)}
                              disabled={!hasChanges(viewer.email) || actionLoading === viewer.email}
                              className="bg-brand-yellow text-brand-brown-dark px-4 py-2 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === viewer.email ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Denied Viewers */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Denied
                {deniedViewers.length > 0 && (
                  <span className="ml-2 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm px-2 py-0.5 rounded-full">
                    {deniedViewers.length}
                  </span>
                )}
              </h2>
              {deniedViewers.length === 0 ? (
                <p className="text-stone-500 dark:text-stone-400 py-4">
                  No denied viewers.
                </p>
              ) : (
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
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleArchive(viewer.email)}
                          disabled={actionLoading === viewer.email}
                          className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 text-sm font-medium disabled:opacity-50"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleApproveFromDenied(viewer.email)}
                          disabled={actionLoading === viewer.email}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading === viewer.email ? '...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Archived Viewers */}
            {archivedViewers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                  Archived
                  <span className="ml-2 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-500 text-sm px-2 py-0.5 rounded-full">
                    {archivedViewers.length}
                  </span>
                </h2>
                <div className="bg-stone-50 dark:bg-stone-800/30 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
                  {archivedViewers.map((viewer) => (
                    <div
                      key={viewer.email}
                      className="flex items-center justify-between p-4 opacity-50"
                    >
                      <div>
                        <p className="font-medium text-stone-700 dark:text-stone-400">
                          {viewer.email}
                        </p>
                        <p className="text-sm text-stone-400 dark:text-stone-500">
                          Archived {viewer.archivedAt ? formatDate(viewer.archivedAt) : 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestore(viewer.email)}
                        disabled={actionLoading === viewer.email}
                        className="text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-sm font-medium disabled:opacity-50"
                      >
                        {actionLoading === viewer.email ? '...' : 'Restore'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
