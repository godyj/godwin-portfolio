'use client';

import { useState, useEffect } from 'react';
import type { LockedProject } from '@/lib/auth/types';
import { Switch } from '@/components/ui/switch';

interface InlineProjectSelectorProps {
  lockedProjects: LockedProject[];
  selectedProjects: string[];  // Empty = all projects
  requestedProject?: string;   // Pre-check for pending viewers
  onChange: (projects: string[], selectAll: boolean) => void;
  disabled?: boolean;
}

export default function InlineProjectSelector({
  lockedProjects,
  selectedProjects,
  requestedProject,
  onChange,
  disabled = false
}: InlineProjectSelectorProps) {
  // Empty selectedProjects means "all projects"
  const isAllProjects = selectedProjects.length === 0 && !requestedProject;

  const [selectAll, setSelectAll] = useState(isAllProjects);
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (selectedProjects.length > 0) {
      return new Set(selectedProjects);
    }
    if (requestedProject) {
      return new Set([requestedProject]);
    }
    return new Set();
  });

  // Sync with parent when selectedProjects changes (for edit mode)
  // Use JSON.stringify to compare array contents, not reference
  const selectedProjectsKey = JSON.stringify(selectedProjects.slice().sort());
  useEffect(() => {
    if (selectedProjects.length === 0 && !requestedProject) {
      setSelectAll(true);
      setSelected(new Set());
    } else if (selectedProjects.length > 0) {
      setSelectAll(false);
      setSelected(new Set(selectedProjects));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectsKey, requestedProject]);

  // Notify parent of initial selection on mount
  useEffect(() => {
    if (selectedProjects.length > 0) {
      onChange(selectedProjects, false);
    } else if (requestedProject) {
      onChange([requestedProject], false);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelected(new Set());
      onChange([], true); // Empty + selectAll=true means all projects
    }
  };

  const handleProjectChange = (projectId: string, checked: boolean) => {
    // If "All projects" is selected and user clicks an individual project,
    // turn OFF that project and keep all others ON
    if (selectAll) {
      // Get all project IDs except the clicked one
      const allExceptClicked = lockedProjects
        .map(p => p.id)
        .filter(id => id !== projectId);
      const newSelected = new Set(allExceptClicked);
      setSelected(newSelected);
      setSelectAll(false);
      onChange(Array.from(newSelected), false);
      return;
    }

    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelected(newSelected);
    onChange(Array.from(newSelected), false);
  };

  return (
    <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-3 space-y-2">
      {/* Select All option */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-stone-700 dark:text-stone-300">
          All projects
          <span className="text-stone-500 dark:text-stone-400 ml-1">
            (includes future locked projects)
          </span>
        </span>
        <Switch
          checked={selectAll}
          onCheckedChange={handleSelectAllChange}
          disabled={disabled}
          aria-label="Select all projects"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700 my-2" />

      {/* Individual projects */}
      {lockedProjects.map((project) => {
        const isChecked = selectAll || selected.has(project.id);
        return (
          <div key={project.id} className="flex items-center justify-between gap-3">
            <span className={`text-sm ${selectAll ? 'text-stone-400' : 'text-stone-700 dark:text-stone-300'}`}>
              {project.title}
              {project.subtitle && (
                <span className="text-stone-500 dark:text-stone-400"> ({project.subtitle})</span>
              )}
            </span>
            <Switch
              checked={isChecked}
              onCheckedChange={(checked) => handleProjectChange(project.id, checked)}
              disabled={disabled}
              aria-label={`Toggle access for ${project.title}`}
            />
          </div>
        );
      })}

      {/* Warning if nothing selected */}
      {!selectAll && selected.size === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Select at least one project or "All projects"
        </p>
      )}
    </div>
  );
}