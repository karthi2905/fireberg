import type React from 'react';
import Topbar from './Topbar';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[#F5760A] selection:text-white">
      {/* Command Center Top Navigation */}
      <Topbar onLogout={onLogout} onThemeToggle={toggleTheme} theme={theme} />

      {/* Main Command Workspace */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-5 lg:p-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
