
import React from 'react';
import { Search, MessageSquare, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  onOpenMessages: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenMessages }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900/90 dark:backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 px-4 h-16 flex items-center justify-between shadow-sm transition-all duration-500">
      {/* Brand Logo Left */}
      <div className="flex items-center">
        <h1 className="text-[#312E81] dark:text-indigo-400 text-4xl font-[900] tracking-tighter italic select-none">R</h1>
      </div>

      {/* Action Icons Right */}
      <div className="flex space-x-2">
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 group"
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? (
            <Moon size={20} className="text-slate-600 group-hover:text-[#312E81]" />
          ) : (
            <Sun size={20} className="text-indigo-400 group-hover:text-white" />
          )}
        </button>
        <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 group">
          <Search size={20} className="text-slate-600 dark:text-slate-300 group-hover:text-[#312E81] dark:group-hover:text-indigo-400" />
        </button>
        <button 
          onClick={onOpenMessages}
          className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 relative group"
        >
          <MessageSquare size={20} className="text-slate-600 dark:text-slate-300 group-hover:text-[#312E81] dark:group-hover:text-indigo-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
            3
          </span>
        </button>
        <button 
          onClick={logout}
          title="Logout"
          className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 group"
        >
          <LogOut size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-red-500" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
