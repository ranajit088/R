
import React, { useState, useEffect } from 'react';
import { Plus, X, Camera, Send, Loader2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Story, User } from '../types';
import ProfilePage from './ProfilePage';

// Initial mock data
const INITIAL_MOCK_STORIES: Partial<Story>[] = [
  { id: '2', user: { id: 'u2', name: 'Alex Rivera', profilePic: 'https://picsum.photos/id/1012/200/200' } },
  { id: '3', user: { id: 'u3', name: 'Sarah Chen', profilePic: 'https://picsum.photos/id/1027/200/200' } },
  { id: '4', user: { id: 'u4', name: 'Marcus Doe', profilePic: 'https://picsum.photos/id/1005/200/200' } },
  { id: '5', user: { id: 'u5', name: 'Elena G.', profilePic: 'https://picsum.photos/id/1011/200/200' } },
  { id: '6', user: { id: 'u6', name: 'David Kim', profilePic: 'https://picsum.photos/id/1025/200/200' } },
];

const StorySection: React.FC = () => {
  const { user } = useAuth();
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [stories, setStories] = useState<Partial<Story>[]>(INITIAL_MOCK_STORIES);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDynamicStories();
  }, [user]);

  const loadDynamicStories = () => {
    const savedStories = JSON.parse(localStorage.getItem('simulated_firestore_stories') || '[]');
    const userStories = savedStories.filter((s: any) => s.user.id === user?.id);
    
    // Merge initial mock with user stories
    setStories(prev => {
      const others = INITIAL_MOCK_STORIES.filter(s => s.user?.id !== user?.id);
      if (userStories.length > 0) {
        return [{ id: 'my-story-active', user: user!, imageUrl: userStories[0].imageUrl }, ...others];
      }
      return others;
    });
  };

  const handleTriggerStory = () => {
    // Simulated camera capture/picker
    const randomId = Math.floor(Math.random() * 1000);
    const mockStoryImg = `https://images.unsplash.com/photo-${1500000000000 + randomId}?q=80&w=1080&auto=format&fit=crop`;
    setPreviewImage(mockStoryImg);
    setIsPreviewing(true);
  };

  const handlePostStory = async () => {
    if (!previewImage || !user) return;
    setIsUploading(true);

    // Simulated network delay for professional feel
    await new Promise(resolve => setTimeout(resolve, 1800));

    const newStoryEntry: Story = {
      id: `story_${Date.now()}`,
      user: { ...user },
      imageUrl: previewImage,
      timestamp: Date.now()
    } as any;

    const currentStories = JSON.parse(localStorage.getItem('simulated_firestore_stories') || '[]');
    localStorage.setItem('simulated_firestore_stories', JSON.stringify([newStoryEntry, ...currentStories]));

    loadDynamicStories();
    setIsUploading(false);
    setIsPreviewing(false);
    setPreviewImage(null);
  };

  if (viewingProfileId) {
    return (
      <div className="fixed inset-0 z-[70] bg-white">
        <ProfilePage targetUserId={viewingProfileId} onBack={() => setViewingProfileId(null)} />
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm overflow-x-auto no-scrollbar flex items-center px-4 py-5 space-x-4 snap-x snap-mandatory">
      {/* Story Creation Overlay */}
      {isPreviewing && previewImage && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <div className="relative flex-1 w-full max-w-xl mx-auto flex items-center justify-center p-4">
            <img 
              src={previewImage} 
              className="max-h-full w-full object-cover rounded-[2.5rem] shadow-2xl border border-white/10" 
              alt="Story Preview" 
            />
            
            {/* Top Controls */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
              <button 
                onClick={() => { setIsPreviewing(false); setPreviewImage(null); }}
                className="p-3 bg-black/40 text-white rounded-2xl backdrop-blur-xl border border-white/10 hover:bg-black/60 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Enhanced</span>
              </div>
            </div>

            {/* Bottom Sharing Bar */}
            <div className="absolute bottom-10 left-8 right-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="bg-white rounded-[2rem] p-4 flex items-center justify-between shadow-2xl shadow-black/50">
                <div className="flex items-center space-x-3 px-2">
                  <img src={user?.profilePic} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div>
                    <p className="text-slate-900 text-xs font-black italic tracking-tight">Post to Story</p>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Expires in 24h</p>
                  </div>
                </div>

                <button 
                  onClick={handlePostStory}
                  disabled={isUploading}
                  className="bg-[#312E81] text-white px-8 py-3.5 rounded-2xl font-black italic tracking-tighter flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  <span>{isUploading ? 'Capturing...' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Add Story" Slot */}
      <div 
        onClick={handleTriggerStory}
        className="flex flex-col items-center flex-shrink-0 space-y-1.5 cursor-pointer snap-start group"
      >
        <div className="relative">
          <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-slate-100 border-2 border-dashed border-slate-300 group-hover:border-indigo-400 transition-colors">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 relative">
              <img 
                src={user?.profilePic} 
                alt="Me" 
                className="w-full h-full object-cover opacity-60 grayscale-[0.5]" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Plus size={24} className="text-slate-600 group-hover:text-indigo-600 transition-colors" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
        <span className="text-[11px] font-black italic tracking-tight text-slate-500">Add Story</span>
      </div>

      {/* Friends & User Active Stories */}
      {stories.map((story) => (
        <div 
          key={story.id} 
          onClick={() => setViewingProfileId(story.user?.id || null)}
          className="flex flex-col items-center flex-shrink-0 space-y-1.5 cursor-pointer snap-start active:scale-95 transition-transform group"
        >
          <div className={`w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-500 ${
            story.id === 'my-story-active' 
              ? 'bg-[#312E81]' 
              : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500'
          }`}>
            <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-slate-50 shadow-inner">
              <img 
                src={story.user?.profilePic} 
                alt={story.user?.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
          </div>
          <span className={`text-[11px] font-black italic tracking-tight max-w-[72px] truncate ${
            story.id === 'my-story-active' ? 'text-[#312E81]' : 'text-slate-800'
          }`}>
            {story.id === 'my-story-active' ? 'Your Story' : story.user?.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StorySection;
