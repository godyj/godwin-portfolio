'use client';

import { useState, useEffect } from 'react';
import type { LockedProject } from '@/lib/auth/types';

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projects: string[]) => void;
  viewerEmail: string;
  currentProjects: string[];
  requestedProject?: string; // Project the viewer originally requested access from
  mode: 'approve' | 'edit';
  lockedProjects: LockedProject[];
}

export default function ProjectSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  viewerEmail,
  currentProjects,
  requestedProject,
  mode,
  lockedProjects,
}: ProjectSelectionModalProps) {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize state based on mode and context when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'approve' && requestedProject) {
        // When approving, default to just the requested project
        setSelectAll(false);
        setSelectedProjects(new Set([requestedProject]));
      } else if (currentProjects.length === 0) {
        // Empty array means "all projects" access (for edit mode)
        setSelectAll(true);
        setSelectedProjects(new Set());
      } else {
        setSelectAll(false);
        setSelectedProjects(new Set(currentProjects));
      }
    }
  }, [isOpen, currentProjects, requestedProject, mode]);

  if (!isOpen) return null;

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Clear individual selections when "Select All" is checked
      setSelectedProjects(new Set());
    }
  };

  const handleProjectChange = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjects);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjects(newSelected);
    // Uncheck "Select All" when individual projects are selected
    if (newSelected.size > 0) {
      setSelectAll(false);
    }
  };

  const handleConfirm = () => {
    if (selectAll) {
      // Empty array = all projects access
      onConfirm([]);
    } else {
      onConfirm(Array.from(selectedProjects));
    }
  };

  // Confirm is disabled if nothing is selected
  const isConfirmDisabled = !selectAll && selectedProjects.size === 0;

  const title = mode === 'approve' ? 'Grant Project Access' : 'Edit Project Access';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          {title}
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-1">
          Viewer: <strong>{viewerEmail}</strong>
        </p>

        <p className="text-sm text-stone-500 dark:text-stone-500 mb-4">
          Select which projects this viewer can access:
        </p>

        {/* Select All checkbox */}
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAllChange(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-brand-yellow focus:ring-brand-yellow focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Select All
            </span>
          </label>
          {/* Tooltip trigger */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-4 h-4 rounded-full bg-stone-300 dark:bg-stone-600 text-stone-600 dark:text-stone-300 text-xs flex items-center justify-center"
            >
              ?
            </button>
            {showTooltip && (
              <div className="absolute left-6 top-0 w-48 p-2 bg-stone-800 dark:bg-stone-700 text-white text-xs rounded shadow-lg z-10">
                Grants access to all current and future locked projects
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-stone-200 dark:border-stone-700 my-3" />

        {/* Project checkboxes */}
        <div className="space-y-2 mb-4">
          {lockedProjects.map((project) => (
            <label key={project.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll || selectedProjects.has(project.id)}
                disabled={selectAll}
                onChange={(e) => handleProjectChange(project.id, e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-brand-yellow focus:ring-brand-yellow focus:ring-offset-0 disabled:opacity-50"
              />
              <span className={`text-sm text-stone-700 dark:text-stone-300 ${selectAll ? 'opacity-50' : ''}`}>
                {project.title}{project.subtitle ? ` (${project.subtitle})` : ''}
              </span>
            </label>
          ))}
        </div>

        {/* Note about empty selection */}
        {isConfirmDisabled && (
          <p className="text-sm text-stone-500 dark:text-stone-500 mb-4">
            Select at least one project to grant access.
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 px-4 py-2 font-medium hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="flex-1 bg-brand-yellow text-brand-brown-dark px-4 py-2 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}