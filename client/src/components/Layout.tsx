import { useState, useEffect } from 'react';
import Topbar from './Topbar';

interface LayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0A09] text-[#F7F5F2] selection:bg-[#F5760A] selection:text-white">
      {/* Command Center Top Navigation */}
      <Topbar onLogout={onLogout} onThemeToggle={toggleTheme} theme={theme} />

      {/* Main Command Workspace */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-5 lg:p-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
