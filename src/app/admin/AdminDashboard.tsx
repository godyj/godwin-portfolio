'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ViewerAccess } from '@/lib/auth';
import type { LockedProject, ProjectWithStatus } from '@/lib/auth/types';
import InlineProjectSelector from '@/components/InlineProjectSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [expandedDeniedViewer, setExpandedDeniedViewer] = useState<string | null>(null);
  const [pendingSelections, setPendingSelections] = useState<Record<string, {
    selectAll: boolean;
    projects: Set<string>;
  }>>({});
  const [deniedSelections, setDeniedSelections] = useState<Record<string, {
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

  const updatePendingSelection = (email: string, projects: string[], selectAll: boolean) => {
    setPendingSelections(prev => ({
      ...prev,
      [email]: {
        selectAll,
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

  const updateDeniedSelection = (email: string, projects: string[], selectAll: boolean) => {
    setDeniedSelections(prev => ({
      ...prev,
      [email]: {
        selectAll,
        projects: new Set(projects)
      }
    }));
  };

  const toggleDeniedExpanded = (email: string) => {
    if (expandedDeniedViewer === email) {
      // Collapsing - discard pending changes
      setExpandedDeniedViewer(null);
      setDeniedSelections(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
    } else {
      // Expanding - initialize with empty selection
      setDeniedSelections(prev => ({
        ...prev,
        [email]: {
          selectAll: false,
          projects: new Set<string>()
        }
      }));
      setExpandedDeniedViewer(email);
    }
  };

  const handleApproveFromDeniedWithSelection = async (email: string) => {
    setActionLoading(email);
    try {
      const selection = deniedSelections[email];
      const projects = selection?.selectAll ? [] : Array.from(selection?.projects || []);

      // Sequential: approve first, then set projects
      await fetch('/admin/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      await fetch('/admin/api/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projects }),
      });

      await fetchViewers();
      setExpandedDeniedViewer(null);
      setDeniedSelections(prev => {
        const { [email]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to approve from denied with selection:', error);
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
    <TooltipProvider>
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
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-48 w-full" />
          </div>
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
                      <Switch
                        checked={project.locked}
                        onCheckedChange={(checked) => handleToggleLock(project.id, checked)}
                        disabled={lockLoading === project.id}
                      />
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
                  <Badge variant="pending" className="ml-2">{pendingViewers.length}</Badge>
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
                          onChange={(projects, selectAll) => updatePendingSelection(viewer.email, projects, selectAll)}
                        />
                      </div>

                      {/* Expiration selection */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Access expiration:
                        </p>
                        <div className="flex flex-wrap gap-3 items-center">
                          <Select
                            value={pendingExpirations[viewer.email]?.option || 'none'}
                            onValueChange={(value) => setPendingExpirations(prev => ({
                              ...prev,
                              [viewer.email]: {
                                option: value as ExpirationOption,
                                customDate: prev[viewer.email]?.customDate || ''
                              }
                            }))}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select expiration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No expiration</SelectItem>
                              <SelectItem value="7days">7 days</SelectItem>
                              <SelectItem value="30days">30 days</SelectItem>
                              <SelectItem value="90days">90 days</SelectItem>
                              <SelectItem value="custom">Custom date</SelectItem>
                            </SelectContent>
                          </Select>
                          {pendingExpirations[viewer.email]?.option === 'custom' && (
                            <Input
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
                              className="w-[180px]"
                            />
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoading === viewer.email}
                            >
                              {actionLoading === viewer.email ? '...' : 'Deny'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deny access request?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will deny the access request from {viewer.email}. They will need to submit a new request if they want access in the future.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeny(viewer.email)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deny
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={(!pendingSelections[viewer.email]?.selectAll && (pendingSelections[viewer.email]?.projects.size ?? 0) === 0) ? 0 : -1}>
                              <Button
                                size="sm"
                                onClick={() => handleApproveWithSelection(viewer.email)}
                                disabled={
                                  actionLoading === viewer.email ||
                                  (!pendingSelections[viewer.email]?.selectAll &&
                                   (pendingSelections[viewer.email]?.projects.size ?? 0) === 0)
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading === viewer.email ? 'Approving...' : 'Approve'}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {(!pendingSelections[viewer.email]?.selectAll && (pendingSelections[viewer.email]?.projects.size ?? 0) === 0) && (
                            <TooltipContent>
                              Select at least one project
                            </TooltipContent>
                          )}
                        </Tooltip>
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
                  <Badge variant="approved" className="ml-2">{approvedViewers.length}</Badge>
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
                                <Badge variant="expiring">{getExpirationDisplay(viewer.expiresAt)!.text}</Badge>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(viewer.email)}
                          >
                            Edit {expandedViewer === viewer.email ? '▲' : '▼'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === viewer.email}
                              >
                                Archive
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive viewer?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will move {viewer.email} to the archived list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleArchive(viewer.email)}
                                >
                                  Archive
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === viewer.email}
                                className="text-red-600 hover:text-red-700"
                              >
                                {actionLoading === viewer.email ? '...' : 'Revoke'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke access?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will revoke access for {viewer.email} and log them out of all sessions immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevoke(viewer.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Revoke
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                      <Collapsible open={expandedViewer === viewer.email}>
                        <CollapsibleContent className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Access:
                          </p>
                          <InlineProjectSelector
                            lockedProjects={lockedProjects}
                            selectedProjects={viewer.projects}
                            onChange={(projects, selectAll) => updatePendingSelection(viewer.email, projects, selectAll)}
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
                              <Select
                                value={editExpirations[viewer.email]?.option || 'none'}
                                onValueChange={(value) => setEditExpirations(prev => ({
                                  ...prev,
                                  [viewer.email]: {
                                    option: value as ExpirationOption,
                                    customDate: prev[viewer.email]?.customDate || ''
                                  }
                                }))}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select expiration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No expiration</SelectItem>
                                  <SelectItem value="7days">7 days from now</SelectItem>
                                  <SelectItem value="30days">30 days from now</SelectItem>
                                  <SelectItem value="90days">90 days from now</SelectItem>
                                  <SelectItem value="custom">Custom date</SelectItem>
                                </SelectContent>
                              </Select>
                              {editExpirations[viewer.email]?.option === 'custom' && (
                                <Input
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
                                  className="w-[180px]"
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={!hasChanges(viewer.email) ? 0 : -1}>
                                  <Button
                                    size="sm"
                                    onClick={() => saveProjectChanges(viewer.email)}
                                    disabled={!hasChanges(viewer.email) || actionLoading === viewer.email}
                                    className="bg-brand-yellow text-brand-brown-dark hover:bg-brand-yellow/90"
                                  >
                                    {actionLoading === viewer.email ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!hasChanges(viewer.email) && (
                                <TooltipContent>
                                  No changes to save
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
                  <Badge variant="denied" className="ml-2">{deniedViewers.length}</Badge>
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
                      className="p-4 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {viewer.email}
                          </p>
                          <p className="text-sm text-stone-500 dark:text-stone-400">
                            Requested {formatDate(viewer.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === viewer.email}
                              >
                                Archive
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive viewer?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will move {viewer.email} to the archived list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleArchive(viewer.email)}
                                >
                                  Archive
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDeniedExpanded(viewer.email)}
                            disabled={actionLoading === viewer.email}
                            className="text-green-600 hover:text-green-700"
                          >
                            Approve {expandedDeniedViewer === viewer.email ? '▲' : '▼'}
                          </Button>
                        </div>
                      </div>

                      {/* Expandable inline project selector */}
                      <Collapsible open={expandedDeniedViewer === viewer.email}>
                        <CollapsibleContent className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Grant access to:
                          </p>
                          <InlineProjectSelector
                            lockedProjects={lockedProjects}
                            selectedProjects={[]}
                            onChange={(projects, selectAll) => updateDeniedSelection(viewer.email, projects, selectAll)}
                          />

                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDeniedExpanded(viewer.email)}
                            >
                              Cancel
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={(!deniedSelections[viewer.email]?.selectAll && (deniedSelections[viewer.email]?.projects.size ?? 0) === 0) ? 0 : -1}>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveFromDeniedWithSelection(viewer.email)}
                                    disabled={
                                      actionLoading === viewer.email ||
                                      (!deniedSelections[viewer.email]?.selectAll &&
                                       (deniedSelections[viewer.email]?.projects.size ?? 0) === 0)
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {actionLoading === viewer.email ? 'Approving...' : 'Approve'}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {(!deniedSelections[viewer.email]?.selectAll && (deniedSelections[viewer.email]?.projects.size ?? 0) === 0) && (
                                <TooltipContent>
                                  Select at least one project
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
                  <Badge variant="archived" className="ml-2">{archivedViewers.length}</Badge>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(viewer.email)}
                        disabled={actionLoading === viewer.email}
                      >
                        {actionLoading === viewer.email ? '...' : 'Restore'}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        </div>
      </div>
    </TooltipProvider>
  );
}
