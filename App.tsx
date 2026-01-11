
import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import NavigationBar from './components/NavigationBar';
import HomeScreen from './components/HomeScreen';
import ProfilePage from './components/ProfilePage';
import ChatList from './components/ChatList';
import DiscoverScreen from './components/DiscoverScreen';
import NotificationsScreen from './components/NotificationsScreen';
import WatchScreen from './components/WatchScreen';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import SplashScreen from './components/SplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'main' | 'messages'>('main');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [showSplash, setShowSplash] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [transitioningTab, setTransitioningTab] = useState(activeTab);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Handle smooth transition state
  useEffect(() => {
    setTransitioningTab(activeTab);
  }, [activeTab]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  if (!user) {
    return authView === 'login' 
      ? <LoginScreen onNavigateToSignUp={() => setAuthView('signup')} /> 
      : <SignUpScreen onNavigateToLogin={() => setAuthView('login')} />;
  }

  const renderContent = () => {
    if (view === 'messages') {
      return <ChatList />;
    }

    return (
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {(() => {
          switch (activeTab) {
            case 'home':
              return <HomeScreen isPostModalOpen={isPostModalOpen} setIsPostModalOpen={setIsPostModalOpen} />;
            case 'friends':
              return <DiscoverScreen />;
            case 'watch':
              return <WatchScreen />;
            case 'notifications':
              return <NotificationsScreen />;
            case 'menu':
              return <ProfilePage />;
            default:
              return (
                <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-10 text-slate-400 text-center">
                  <div className="text-6xl mb-4 opacity-10 grayscale">🛠️</div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Under Refinement</h2>
                  <p className="mt-2 text-slate-500 text-sm">The {activeTab} section is currently being architected for the premium experience.</p>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <div className={`flex flex-col min-h-screen max-w-xl mx-auto shadow-2xl relative transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <TopBar onOpenMessages={() => setView('messages')} />
      
      <main className="flex-1 overflow-y-auto pb-16 pt-14 no-scrollbar">
        {renderContent()}
      </main>

      {view === 'main' && (
        <NavigationBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenPostModal={() => setIsPostModalOpen(true)} 
        />
      )}

      {view === 'messages' && (
        <button 
          onClick={() => setView('main')}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#312E81] text-white rounded-full font-black uppercase tracking-widest text-xs shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4"
        >
          Back to Feed
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
