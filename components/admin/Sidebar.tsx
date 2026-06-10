import React from 'react';
import { LayoutDashboard, FilePlus, EyeOff, LogOut, Terminal, User, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'blogs' | 'new' | 'drafts' | 'settings' | 'edit';
  onNavigate: (tab: 'dashboard' | 'blogs' | 'new' | 'drafts' | 'settings') => void;
  userEmail?: string;
  userFullName?: string;
  userAvatarUrl?: string;
  onSignOut: () => void;
}

export default function Sidebar({
  currentTab,
  onNavigate,
  userEmail = 'vandulinus@gmail.com',
  userFullName = 'Vandulinus Arewa',
  userAvatarUrl,
  onSignOut,
}: SidebarProps) {
  
  const navItems = [
    {
      id: 'dashboard',
      label: 'ANALYTICS',
      icon: LayoutDashboard,
    },
    {
      id: 'blogs',
      label: 'ARTICLES INDEX',
      icon: FileText,
    },
    {
      id: 'new',
      label: 'NEW ARTICLE',
      icon: FilePlus,
    },
    {
      id: 'drafts',
      label: 'STAGED DRAFTS',
      icon: EyeOff,
    },
    {
      id: 'settings',
      label: 'SECURITY & PREFS',
      icon: Settings,
    },
  ] as const;

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between h-full py-6 select-none" id="admin-sidebar-wrapper">
      <div className="space-y-8">
        {/* Editorial Logo */}
        <div className="px-6 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center animate-pulse">
            <Terminal className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-[#f4f4f5]">
            AREWA.ADMIN
          </span>
        </div>

        {/* Minimal Navigation items with a sharp colored border indicator */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id || (item.id === 'blogs' && currentTab === 'edit');
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex items-center gap-3.5 pl-6 py-3.5 text-left text-xs font-mono tracking-wider transition-all duration-150 relative cursor-pointer border-l-2 ${
                  isActive
                    ? 'border-accent text-accent-light bg-zinc-900/10 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:border-zinc-800'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <IconComponent className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-accent' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Administrator Foot Card with minimal details */}
      <div className="px-6 pt-6 border-t border-zinc-900 flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-900">
          {userAvatarUrl ? (
            <img 
              src={userAvatarUrl} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-sm object-cover border border-zinc-805"
            />
          ) : (
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest leading-none">
              {userFullName}
            </p>
            <p className="text-[10px] font-mono text-zinc-300 truncate mt-1">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Sign out indicator */}
        <button
          onClick={onSignOut}
          className="flex items-center justify-center gap-2 px-3 py-2 border border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 font-mono text-[10px] tracking-wider rounded transition uppercase select-none cursor-pointer"
          id="btn-sidebar-signout"
        >
          <LogOut className="w-3 h-3 text-zinc-600" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
}
