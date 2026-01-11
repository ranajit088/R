
import React from 'react';
import { Home, Users, Bell, Menu, Tv } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavigationBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPostModal: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, setActiveTab, onOpenPostModal }) => {
  const { notifications, user } = useAuth();
  const { theme } = useTheme();
  
  const unreadCount = notifications.filter(n => n.toUserId === user?.id && !n.isRead).length;

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'friends', icon: Users, label: 'Friends' },
    { id: 'watch', icon: Tv, label: 'Watch' },
    { id: 'notifications', icon: Bell, label: 'Alerts', hasBadge: true },
    { id: 'menu', icon: Menu, label: 'Menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-50 flex items-center justify-around h-18 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-none pb-safe transition-all duration-500">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 relative group py-2"
          >
            <div className={`p-2 transition-all duration-300 rounded-2xl relative ${
              isActive 
                ? 'text-[#312E81] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40' 
                : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-50 dark:group-hover:bg-slate-800'
            }`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {tab.hasBadge && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
              )}
            </div>
            
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#312E81] dark:bg-indigo-400 rounded-b-full shadow-[0_2px_4px_rgba(49,46,129,0.3)]"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
