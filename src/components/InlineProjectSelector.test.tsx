import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InlineProjectSelector from './InlineProjectSelector';
import type { LockedProject } from '@/lib/auth/types';

const mockProjects: LockedProject[] = [
  { id: 'jarvis', title: 'Jarvis', subtitle: 'Connected Car App' },
  { id: 'xcode-touch-bar', title: 'Apple Xcode', subtitle: 'Touch Bar' },
  { id: 'roblox-nux', title: 'Roblox', subtitle: 'New User Experience' },
];

// Helper to check if a toggle button is ON (checked)
const isToggleOn = (button: HTMLElement) => button.className.includes('bg-brand-yellow');
const isToggleOff = (button: HTMLElement) => button.className.includes('bg-stone-300');

describe('InlineProjectSelector', () => {
  let mockOnChange: (projects: string[]) => void;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe('rendering', () => {
    it('renders all projects', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Jarvis')).toBeInTheDocument();
      expect(screen.getByText('Apple Xcode')).toBeInTheDocument();
      expect(screen.getByText('Roblox')).toBeInTheDocument();
    });

    it('renders "All projects" option', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('All projects')).toBeInTheDocument();
    });

    it('renders subtitles in parentheses', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('(Connected Car App)')).toBeInTheDocument();
      expect(screen.getByText('(Touch Bar)')).toBeInTheDocument();
    });
  });

  describe('select all behavior', () => {
    it('checks "All projects" by default when selectedProjects is empty', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      const allProjectsButton = screen.getByRole('button', { name: /select all projects/i });
      expect(isToggleOn(allProjectsButton)).toBe(true);
    });

    it('keeps individual buttons enabled when "All projects" is checked', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      // First is "All projects", rest are individual projects - all should be enabled
      expect(buttons[1]).not.toBeDisabled();
      expect(buttons[2]).not.toBeDisabled();
      expect(buttons[3]).not.toBeDisabled();
    });

    it('switches to individual selection when clicking a project while "All projects" is checked', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      // "All projects" should be checked initially
      const allProjectsButton = screen.getByRole('button', { name: /select all projects/i });
      expect(isToggleOn(allProjectsButton)).toBe(true);

      // Click an individual project (Jarvis)
      const jarvisButton = screen.getByRole('button', { name: /toggle access for jarvis/i });
      fireEvent.click(jarvisButton);

      // Should switch to individual selection mode with all projects EXCEPT the clicked one
      // (clicking jarvis turns it OFF, keeps all other projects ON)
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['xcode-touch-bar', 'roblox-nux'])
      );
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.not.arrayContaining(['jarvis'])
      );
    });

    it('calls onChange with empty array when "All projects" is checked', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={['jarvis']}
          onChange={mockOnChange}
        />
      );

      const allProjectsButton = screen.getByRole('button', { name: /select all projects/i });
      fireEvent.click(allProjectsButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('individual project selection', () => {
    it('pre-selects projects from selectedProjects prop', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={['jarvis', 'roblox-nux']}
          onChange={mockOnChange}
        />
      );

      const allProjectsButton = screen.getByRole('button', { name: /select all projects/i });
      const jarvisButton = screen.getByRole('button', { name: /toggle access for jarvis/i });
      const xcodeButton = screen.getByRole('button', { name: /toggle access for apple xcode/i });
      const robloxButton = screen.getByRole('button', { name: /toggle access for roblox/i });

      // "All projects" should NOT be checked
      expect(isToggleOff(allProjectsButton)).toBe(true);
      // Jarvis and Roblox should be checked
      expect(isToggleOn(jarvisButton)).toBe(true);
      expect(isToggleOff(xcodeButton)).toBe(true);
      expect(isToggleOn(robloxButton)).toBe(true);
    });

    it('calls onChange with updated selection when checking a project', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={['jarvis']}
          onChange={mockOnChange}
        />
      );

      const xcodeButton = screen.getByRole('button', { name: /toggle access for apple xcode/i });
      fireEvent.click(xcodeButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['jarvis', 'xcode-touch-bar'])
      );
    });

    it('calls onChange with updated selection when unchecking a project', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={['jarvis', 'xcode-touch-bar']}
          onChange={mockOnChange}
        />
      );

      const jarvisButton = screen.getByRole('button', { name: /toggle access for jarvis/i });
      fireEvent.click(jarvisButton);

      expect(mockOnChange).toHaveBeenCalledWith(['xcode-touch-bar']);
    });
  });

  describe('requestedProject behavior', () => {
    it('pre-selects requestedProject for pending viewers', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          requestedProject="xcode-touch-bar"
          onChange={mockOnChange}
        />
      );

      const allProjectsButton = screen.getByRole('button', { name: /select all projects/i });
      const jarvisButton = screen.getByRole('button', { name: /toggle access for jarvis/i });
      const xcodeButton = screen.getByRole('button', { name: /toggle access for apple xcode/i });
      const robloxButton = screen.getByRole('button', { name: /toggle access for roblox/i });

      // "All projects" should NOT be checked when requestedProject is set
      expect(isToggleOff(allProjectsButton)).toBe(true);
      // Only xcode-touch-bar should be checked
      expect(isToggleOff(jarvisButton)).toBe(true);
      expect(isToggleOn(xcodeButton)).toBe(true);
      expect(isToggleOff(robloxButton)).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={['jarvis']}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('warning message', () => {
    it('shows warning when nothing is selected', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={['jarvis']}
          onChange={mockOnChange}
        />
      );

      // Uncheck the only selected project
      const jarvisButton = screen.getByRole('button', { name: /toggle access for jarvis/i });
      fireEvent.click(jarvisButton);

      expect(screen.getByText(/Select at least one project/)).toBeInTheDocument();
    });

    it('does not show warning when "All projects" is selected', () => {
      render(
        <InlineProjectSelector
          lockedProjects={mockProjects}
          selectedProjects={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText(/Select at least one project/)).not.toBeInTheDocument();
    });
  });
});
