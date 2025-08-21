import React from 'react';
import type { AppView } from '../types';
import { BuildIcon } from './icons/BuildIcon';
import { ApiIcon } from './icons/ApiIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const NavItem: React.FC<{
  label: string;
  view: AppView;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center w-full text-left p-3 rounded-lg transition-colors duration-200";
  const activeClasses = "bg-indigo-600 text-white shadow-lg";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { view: 'build' as AppView, label: 'Build', icon: <BuildIcon className="h-6 w-6" /> },
    { view: 'api' as AppView, label: 'API Manager', icon: <ApiIcon className="h-6 w-6" /> },
    { view: 'history' as AppView, label: 'History', icon: <HistoryIcon className="h-6 w-6" /> },
  ];

  return (
    <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white text-center">Imagen Gen</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <NavItem
            key={item.view}
            label={item.label}
            view={item.view}
            icon={item.icon}
            isActive={activeView === item.view}
            onClick={() => setActiveView(item.view)}
          />
        ))}
      </nav>
      <footer className="mt-auto text-center text-gray-500 text-xs">
        <p>&copy; 2024. All rights reserved.</p>
      </footer>
    </aside>
  );
};
