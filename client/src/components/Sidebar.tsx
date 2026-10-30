import { Link, useLocation } from 'react-router-dom';
import { Flame, LayoutDashboard, Map, Bell, FileText, MapPin, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/zones', label: 'Zones', icon: MapPin },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[var(--border-hairline)] bg-[var(--bg-panel)] transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo row */}
      <div className="h-[64px] flex items-center border-b border-[var(--border-hairline)]">
        {isCollapsed ? (
          <div className="w-full flex justify-center">
            <Flame size={22} className="text-[var(--text-primary)]" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-6">
            <Flame size={22} className="text-[var(--text-primary)]" />
            <span className="text-[16px] font-medium text-[var(--text-primary)]">FireBerg</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center h-[44px] mx-2 rounded-[10px] transition-colors',
                isActive
                  ? 'bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
              )}
            >
              <Icon size={18} className={cn(isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')} />
              {!isCollapsed && <span className="text-[13px]">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-[var(--border-hairline)]">
        <button
          onClick={onToggle}
          className="w-full h-[36px] flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
