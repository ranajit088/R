
import React, { useState, useEffect, useCallback } from 'react';
import PostCreationBox from './PostCreationBox';
import StorySection from './StorySection';
import PostCard from './PostCard';
import FeedShimmer from './FeedShimmer';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Layout, AlertCircle } from 'lucide-react';

interface HomeScreenProps {
  isPostModalOpen: boolean;
  setIsPostModalOpen: (open: boolean) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ isPostModalOpen, setIsPostModalOpen }) => {
  const { posts, refreshFeed, loading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const initFeed = async () => {
      try {
        setStatus('loading');
        await refreshFeed();
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    initFeed();
  }, [refreshFeed]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFeed();
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [refreshFeed]);

  return (
    <div className="flex flex-col relative min-h-screen bg-slate-50">
      {/* Pull-to-refresh Visual Indicator */}
      <div 
        className={`flex justify-center items-center transition-all duration-500 overflow-hidden bg-white border-b border-slate-100 ${
          isRefreshing ? 'h-14 opacity-100' : 'h-0 opacity-0'
        }`}
      >
        <div className="flex items-center space-x-2 text-[#312E81]">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Network...</span>
        </div>
      </div>

      <PostCreationBox isModalOpen={isPostModalOpen} setIsPostModalOpen={setIsPostModalOpen} />
      
      <StorySection />
      
      {/* State-driven Rendering */}
      <div className="mt-2 flex-1">
        {status === 'loading' && <FeedShimmer />}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-4">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-lg font-[900] italic tracking-tight text-slate-900">Connection Interrupted</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">We couldn't reach the R servers. Please check your network.</p>
            <button 
              onClick={() => setStatus('loading')} 
              className="px-8 py-3 bg-[#312E81] text-white rounded-2xl font-black italic shadow-xl shadow-indigo-100"
            >
              Retry Connection
            </button>
          </div>
        )}

        {status === 'success' && posts.length === 0 && (
          <div className="bg-white mx-4 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm border border-slate-100 mt-4">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
               <Layout size={40} className="text-slate-200" />
            </div>
            <div>
              <h3 className="text-xl font-[900] italic text-slate-900 tracking-tight">Your feed is a blank canvas</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-[240px] mx-auto">
                Be the pioneer of your professional circle. Share an insight or an image today.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && posts.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {/* End of Feed */}
            <div className="py-20 px-6 text-center">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
              <h4 className="text-slate-900 font-[900] italic text-sm tracking-tight">Timeline Optimized</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">You're fully caught up with your network</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
